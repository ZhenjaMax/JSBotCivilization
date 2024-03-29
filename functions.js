function randomInteger(max, min = 0) { return Math.round(min - 0.5 + Math.random()*(max - min)); } // Целые, [от min до max-1]
function componentToHex(value) {
    var hex = value.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(colors) { return "#" + componentToHex(colors[0]) + componentToHex(colors[1]) + componentToHex(colors[2]); }
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomHexBrightString(){ return rgbToHex(shuffle([0, 255, randomInteger(256)])); }
String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined' ? args[number] : match; 
    });
};

function parseInteger(str){
    if(str == undefined) return undefined;
    str = String(str);
    regexp = /^-?(\d+)$/gm;
    match = Array.from(str.matchAll(regexp));
    return match.length == 1 ? parseInt(match[0][0]) : NaN;
}

function parsePlayers(str){
    if(str == undefined)
        return [];
    regexp = /(<@!\d+>)+/g;
    retval = Array.from(str.matchAll(regexp)).map(function (regexElement) {return regexElement[0].slice(3, -1)});
    if(retval.length != 0)
        return retval;
    regexp = /(<@\d+>)+/g;
    retval = Array.from(str.matchAll(regexp)).map(function (regexElement) {return regexElement[0].slice(2, -1)});
    return retval;
}

function parseNumberRule(str){
    if(str == undefined)
        return undefined;
    regexp = /^(\d+)\.(\d+)$/gm;
    match = Array.from(str.matchAll(regexp));
    return match.length == 1 ? match[0][0] : undefined;
}

function parseDuration(str){
    if(str == undefined)
        return undefined;
    regexp = /^(\d+)([smhdy])$/gm;
    match = Array.from(str.matchAll(regexp));
    return match.length == 1 ? [match[0][1], match[0][2]] : undefined;
}

const typeofTime = new Map([
    ["s", 1],
    ["m", 60],
    ["h", 60*60],
    ["d", 60*60*24],
    ["y", 60*60*24*365]
]);

function getTimeInSeconds(value, typeSymbol){ return value * typeofTime.get(typeSymbol); }
function getDateRus(date){
    let hTimeDelta = 3;
    punishmentDate = new Date(date);
    punishmentDate.setTime(punishmentDate.getTime() + 1000*3600*hTimeDelta);
    dateString = "";
    dateString += (String(punishmentDate.getDate()) + " ");
    switch(punishmentDate.getMonth()){
        case 0:
            dateString += "января";
            break;
        case 1:
            dateString += "февраля";
            break;
        case 2:
            dateString += "марта";
            break;
        case 3:
            dateString += "апреля";
            break;
        case 4:
            dateString += "мая";
            break;
        case 5:
            dateString += "июня";
            break;
        case 6:
            dateString += "июля";
            break;
        case 7:
            dateString += "августа";
            break;
        case 8:
            dateString += "сентября";
            break;
        case 9:
            dateString += "октября";
            break;
        case 10:
            dateString += "ноября";
            break;
        case 11:
            dateString += "декабря";
            break;
    }
    dateString += (" " + punishmentDate.getFullYear() + " года,\n");
    if((punishmentDate.getHours())%24 < 10)
        dateString += "0"; 
    dateString += (punishmentDate.getHours()%24 + ":");
    if(punishmentDate.getMinutes() < 10)
        dateString += "0"; 
    dateString += (punishmentDate.getMinutes() + " МСК");
    return dateString;
}

function parseHexColor(str){
    if(str == undefined) return undefined;
    regexp = /^(#[0-9a-fA-F]{6})$/gm;
    match = Array.from(str.matchAll(regexp));
    return match.length == 1 ? match[0][0] : undefined;
}

function deepCopy(aObject){
    if (!aObject)
      return aObject;
    let v;
    let bObject = Array.isArray(aObject) ? [] : {};
    for(const k in aObject){
        v = aObject[k];
        bObject[k] = ( (typeof v === "object")&& !(v instanceof Date) ) ? deepCopy(v) : v;
    }
    return bObject;
}

function isEmptyObject(value){ return Object.keys(value).length === 0 && value.constructor === Object; }

const trueFilter = (reaction, user) => { return true; };

function getNextDayString(dateDayBefore, dayCurrent){
    dateDayBefore.setDate(dateDayBefore.getDate() + 1);
    diffH = Math.floor(( (dateDayBefore-dayCurrent)  % 86400000) / 3600000);
    diffMin = Math.floor(( (dateDayBefore-dayCurrent)  % 86400000) / 3600000 / 60000);
    return "{0}:{1} ч".format(diffH, (diffMin<10) ? "0{0}".format(diffMin) : diffMin);
}

module.exports = { 
    getRandomHexBrightString, 
    randomInteger, 
    String, 
    parseInteger,
    parsePlayers,
    parseNumberRule,
    parseDuration,
    getTimeInSeconds,
    getDateRus,
    parseHexColor,
    rgbToHex,
    deepCopy,
    isEmptyObject,
    trueFilter,
    getNextDayString,
}
