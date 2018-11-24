
const chai = require('chai');
const assert = chai.assert;
const {cleanWhitespace, replaceLinebreaksTab, replaceTabs, unescapeHtml,
    convertToAscii, convertToLowercase} = require('../fahem/receivers');

describe('receiver_test', () => {


    describe('cleanWhitespace', () => {

        it('Should clean whitespace from the beggining and end.', () => {
            let text = cleanWhitespace(' Fahem ');

            assert.equal(text.length, 5);
            assert.equal(text, 'Fahem');
        });
    });

    describe('replaceLinebreaksTab', () => {

        it('Should clean line breaks and tabs from given string.', () => {
            let text = replaceLinebreaksTab('Fahem\nFahem\tFahem\r');

            assert.equal(text, 'Fahem Fahem Fahem');
        });
    });

    describe('unescapeHtml', () => {

        it('Should unscape html string input', () => {
            let text = unescapeHtml('<div id="hello">Hello</div>');

            assert.equal(text, '&lt;div id=&quot;hello&quot;&gt;Hello&lt;/div&gt;');
        });
    });

    describe('convertToLowercase', () => {

        it('Should convert uppercase chars to lowercase.', () => {
            let text = convertToLowercase('QWERTYUIOPASDFGHJKLZXCVBNM');

            assert.equal('qwertyuiopasdfghjklzxcvbnm');
        });
    });
});