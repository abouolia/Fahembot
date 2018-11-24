'use strict';

/**
 * Clean whitespaces.
 * @param  {String} input - Statement input..
 * @return {String}
 */
function cleanWhitespace(input){
	input = input.replace(/\s+/g, " ").trim()
	return input;
}

/**
 * Replace linebreaks with spaces.
 * @param  {String} input - Statement input.
 * @return {String}
 */
function replaceLinebreaksTab(input){
    input = input.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
	return input;
}

/**
 * Replace tabs with spaces.
 * @param {String} input - Statement input.
 */
function replaceTabs(input){
	input = input.replace('\r', ' ');
	return input;
}

/**
 * Unscape HTML.
 * @param {String} input
 * @return {String} 
 */
function unescapeHtml(input){
	var entityPairs = [
        {character: '&', html: '&amp;'},
        {character: '<', html: '&lt;'},
        {character: '>', html: '&gt;'},
        {character: "'", html: '&apos;'},
        {character: '"', html: '&quot;'},
    ];
    entityPairs.forEach(function(pair){
        var reg = new RegExp(pair.character, 'g');
        input = input.replace(reg, pair.html);
	});
	return input;
}

/**
 * Converts unicode characters to ASCII character equivalents.
 * @param  {String} input - 
 * @return {String} 
 */
function convertToAscii(input){

	return input;
}

/**
 * Converts string to lowercast string.
 * @param  {String} input 
 * @return {String}
 */
function convertToLowercase(input){
	return input.toLowerCase();
}

module.exports = {
	cleanWhitespace,
	replaceLinebreaksTab,
	replaceTabs,
	unescapeHtml,
	convertToAscii,
	convertToLowercase
}