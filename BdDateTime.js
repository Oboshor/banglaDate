/****** date showing function ****/
Date.prototype.toBdTime = function () {
  var localTime = this.getTime();
  var localOffset = this.getTimezoneOffset() * 60000;
  var utc = localTime + localOffset;
  this.setTime(utc + 3600000 * 6);

  return this;
};

function bdDateConverter(inputDate) {
  var d =
    Object.prototype.toString.call(inputDate) === "[object Date]"
      ? inputDate
      : new Date().toBdTime();
  this.inputDate = d;

  // Modifications as per new convention from 19.OCT.2023

  var leapYearMonthIndex = 10,
    leapYearMonthDays = 30;
  //* Ensure that dates before the convention match with paper-published days
  if (d < new Date() && d > new Date(1970, 0, 1)) {
    // Additional code to respect convention before 1430 bengali year
    leapYearMonthDays = 31;
    this.formatConvertList.multiplierBD[5] = 30;
    this.formatConvertList.multiplierBD[11] = 30;
  }

  var y = this.inputDate.getFullYear();
  this.leapYear = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  if (this.leapYear) {
    this.formatConvertList.multiplierBD[leapYearMonthIndex] = leapYearMonthDays;
    this.formatConvertList.multiplierEN[1] = 29;
  }

  function daysIntoYear(date) {
    return (
      (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
        Date.UTC(date.getFullYear(), 0, 0)) /24/60/60/1000
    );
  }
  this.totalDaysInEN = 0;
  this.totalDaysInEN = daysIntoYear(this.inputDate);
  this.firstDayInBD =
    this.formatConvertList.multiplierEN[0] +
    this.formatConvertList.multiplierEN[1] +
    this.formatConvertList.multiplierEN[2] +
    14;

  this.prepareDateInstanceFormats();
}

bdDateConverter.prototype.prepareDateInstanceFormats = function () {
  this.dateInstance = {
    l: this.inputDate.getDay(),
    G: this.inputDate.getHours(),
    H:
      this.inputDate.getHours() > 9
        ? this.inputDate.getHours()
        : "0" + this.inputDate.getHours(),
    g:
      this.inputDate.getHours() > 12
        ? this.inputDate.getHours() - 12
        : this.inputDate.getHours(),
    i: this.inputDate.getMinutes(),
    M:
      this.inputDate.getMinutes() > 9
        ? this.inputDate.getMinutes()
        : "0" + this.inputDate.getMinutes(),
    S:
      this.inputDate.getSeconds() > 9
        ? this.inputDate.getSeconds()
        : "0" + this.inputDate.getSeconds(),
    s: this.inputDate.getSeconds(),
  };
  this.dateInstance.A = this.A();
  this.dateInstance.Y = this.Y(this.inputDate.getFullYear());

  if (this.totalDaysInEN < this.firstDayInBD) {
    this.totalDaysInEN =
      365 + +this.leapYear - (this.firstDayInBD - this.totalDaysInEN);
  } else {
    this.totalDaysInEN -= this.firstDayInBD;
  }
  var Fj = this.Fj();
  this.dateInstance.F = Fj.m - 1;
  this.dateInstance.j = Fj.d;

  this.dateInstance.h = this.dateInstance.g;
  this.dateInstance.m = Fj.m;
  this.dateInstance.d = Fj.d;
};

bdDateConverter.prototype.Fj = function () {
  var m = 0;
  for (
    var i = 0;
    i < this.formatConvertList.multiplierBD.length && this.totalDaysInEN >= 0;
    ++i
  ) {
    m += 1;
    if (this.formatConvertList.multiplierBD[i] - this.totalDaysInEN > 0) break;
    this.totalDaysInEN -= this.formatConvertList.multiplierBD[i];
  }
  return {
    m: m > 9 ? m : "0" + m,
    d: this.totalDaysInEN + 1,
  };
};

bdDateConverter.prototype.Y = function (y) {
  if (y - 2016 > 0) {
    y = 1423 + Math.floor((y - 2016) / 4) * 4 + ((y - 2016) % 4);
  } else {
    y = 1423 - Math.floor((2016 - y) / 4) * 4 - ((2016 - y) % 4);
  }
  if (this.firstDayInBD > this.totalDaysInEN) y = y - 1;

  return y;
};

bdDateConverter.prototype.A = function () {
  if (this.dateInstance.G >= 4 && this.dateInstance.G < 6) return 0;
  else if (this.dateInstance.G >= 6 && this.dateInstance.G < 12) return 1;
  else if (this.dateInstance.G >= 12 && this.dateInstance.G < 16) return 2;
  else if (this.dateInstance.G >= 16 && this.dateInstance.G < 18) return 3;
  else if (this.dateInstance.G >= 18 && this.dateInstance.G < 20) return 4;
  else if (this.dateInstance.G >= 20 && this.dateInstance.G <= 23) return 5;
  else if (this.dateInstance.G >= 0 && this.dateInstance.G < 4) return 5;
  return 6;
};

bdDateConverter.prototype.convert = function (formatString) {
  this.formatString = formatString;

  var bDate = "";
  for (var i = 0; i < formatString.length; ++i) {
    var singleFormatChar = formatString.charAt(i);
    if (singleFormatChar in this.dateInstance === false) {
      bDate += singleFormatChar;
      continue;
    }
    switch (singleFormatChar) {
      case "A":
      case "F":
      case "l":
        bDate +=
          this.formatConvertList[singleFormatChar][
            this.dateInstance[singleFormatChar]
          ];
        break;
      default:
        var intToStr = this.dateInstance[singleFormatChar].toString();
        for (var j = 0; j < intToStr.length; ++j) {
          bDate += this.formatConvertList._N[intToStr[j]];
        }
        break;
    }
  }

  return bDate;
};

bdDateConverter.prototype.formatConvertList = {
  multiplierEN: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  multiplierBD: [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 29, 30],

  A: ["ভোর", "সকাল", "দুপুর", "বিকাল", "সন্ধ্যা", "রাত"],
  F: [
    "বৈশাখ",
    "জ্যৈষ্ঠ",
    "আষাঢ়",
    "শ্রাবণ",
    "ভাদ্র",
    "আশ্বিন",
    "কার্তিক",
    "অগ্রহায়ণ",
    "পৌষ",
    "মাঘ",
    "ফাল্গুন",
    "চৈত্র",
  ],
  l: [
    "রবিবার",
    "সোমবার",
    "মঙ্গলবার",
    "বুধবার",
    "বৃহস্পতিবার",
    "শুক্রবার",
    "শনিবার",
  ],
  _N: ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"],
};

// mimic jQuery to export modules
if ("object" === typeof module && "object" === typeof module.exports) {
  module.exports = bdDateConverter;
}
