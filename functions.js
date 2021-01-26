function randomInteger(max, min = 0) {          // Целые, [от min до max-1]
    return Math.round(min - 0.5 + Math.random()*(max - min));
}

function componentToHex(value) {
    var hex = value.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
function rgbToHex(colors) {
    return "#" + componentToHex(colors[0]) + componentToHex(colors[1]) + componentToHex(colors[2]);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomHexBrightString(){
    return rgbToHex(shuffle([0, 255, randomInteger(256)]));
}

String.prototype.format = String.prototype.f = function(){
	var args = arguments;
	return this.replace(/\{(\d+)\}/g, function(m,n){
		return args[n] ? args[n] : m;
	});
};

function parseInteger(str){
    if(str == undefined)
        return undefined;
    regexp = /^-?(\d+)$/gm;
    match = Array.from(str.matchAll(regexp));
    return match.length == 1 ? match[0][0] : NaN;
}

module.exports = { 
    getRandomHexBrightString, 
    randomInteger, 
    String, 
    parseInteger
}
