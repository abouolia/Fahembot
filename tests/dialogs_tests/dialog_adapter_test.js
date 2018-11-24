process.env.NODE_ENV = 'test';

const chai = require('chai');
const assert = chai.assert;
const Fahem = require('../../fahem/fahem');
const Response = require('../../fahem/models/response');
const DialogAdapter = require('../../fahem/dialogs/dialog_adapter');

let dialogAdapter;

describe('DialogAdapter', () => {

    beforeEach(() => {
        dialogAdapter = new DialogAdapter();
    });

    describe('selectRandomResponse', () => {

        it('Should select random response.', () => {
            let responsesList = [];

            responsesList.push( new Response({text: 'A', occurence: 1}) );
            responsesList.push( new Response({text: 'C', occurence: 3}) );
            responsesList.push( new Response({text: 'B', occurence: 2}) );

            let selectedResponse = dialogAdapter.selectRandomResponse(responsesList);
        });
    });


    describe('selectMostOccurenceResponse', () => {

        it('Should select the most occurance response.', () => {
            let responsesList = [];

            responsesList.push( new Response({text: 'A', occurence: 1}) );
            responsesList.push( new Response({text: 'C', occurence: 3}) );
            responsesList.push( new Response({text: 'B', occurence: 2}) );

            let selectedResponse = dialogAdapter.selectMostOccurenceResponse(responsesList);

            assert.equal(selectedResponse.text, 'C');
        });
    });
});