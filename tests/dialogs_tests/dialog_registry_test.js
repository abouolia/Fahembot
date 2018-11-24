process.env.NODE_ENV = 'test';

const DialogAdapter = require('../../fahem/dialogs/dialog_adapter');
const DialogRegistry = require('../../fahem/dialogs/dialog_registry')
const SpecificDialog = require('../../fahem/dialogs/specific_dialog');
const TimeDialog = require('../../fahem/dialogs/time_dialog');
const Response = require('../../fahem/models/response');
const chai = require('chai');
const assert = chai.assert;

let dialogRegistry;

describe('DialogRegistry', () => {

    beforeEach(() => {
        dialogRegistry = new DialogRegistry()
    });

    describe('getResponsesFromDialogs()', () => {

        it('Should get responses from dialogs results', () => {
            let response1 = new Response({text: 'A'});
            let response2 = new Response({text: 'B'});

            let dialogResults = [
                [response1, response2],
                response2
            ];

            let responses = dialogRegistry.getResponsesFromDialogs(dialogResults);
 
            assert.equal(responses.length, 2);
            assert.equal(responses[0][0].text, 'A');
            assert.equal(responses[1].text, 'B');
        });
    });

    describe('getHighestConfidenceResponse()', () => {

        it('Should get the most occurance response from the stack', () => {
            let response1 = new Response({text: 'A', occurence: 100});
            let response2 = new Response({text: 'B', occurence: 40});
            let response3 = new Response({text: 'C', occurence: 10});
            
            let responses = [response1, response2, response3];
            let responsesResult = dialogRegistry.getHighestConfidenceResponse(responses);
            
            assert.equal(responsesResult.text, 'A');
            assert.equal(responsesResult.occurence, 100); 
        });
    });
    
    describe('onStart()', () => {

        it('Should get responses from dialogs adapters.', async () => {

            class TestDialog extends DialogAdapter{
                onStart(){
                    let responses = [];
                    responses.push( new Response({text: 'A'}) );
                    return responses;
                }
            }

            class TestDialog2 extends DialogAdapter{
                onStart(){
                    let responses = [];
                    responses.push( new Response({text: 'B'}) );
                    return responses;
                }
            }

            dialogRegistry.add(new TestDialog);
            dialogRegistry.add(new TestDialog2);

            let responses = await dialogRegistry.onStart();

            assert.equal(responses.length, 2);
            assert.equal(responses[0].text, 'A');
            assert.equal(responses[1].text, 'B');
        });
    });

    describe('onRun()', () => {

        it('Should get responses of highest priority dialog adapter.', async () => {
            class TestDialog extends DialogAdapter{
                onRun(){
                    let responses = [];
                    responses.push( new Response({text: 'A'}) );
                    responses.push( new Response({text: 'B'}) );
                    return responses;
                }
            }

            class TestDialog2 extends DialogAdapter{
                onRun(){
                    let responses = [];
                    responses.push( new Response({text: 'X'}) );
                    responses.push( new Response({text: 'Y'}) );
                    return responses;
                }
            }

            dialogRegistry.add(new TestDialog);
            dialogRegistry.add(new TestDialog2);

            let responses = await dialogRegistry.onRun('A');

            assert.equal(responses.length, 2);
            assert.equal(responses[0].text, 'A');
            assert.equal(responses[1].text, 'B');
        });

        it('Should gets the most occurence response from all dialog adapters.', async () => {
            class TestDialog extends DialogAdapter{
                onRun(){
                    let responses = [];
                    responses.push( new Response({text: 'A', occurence: 100}) );
                    return responses;
                }
            }

            class TestDialog2 extends DialogAdapter{
                onRun(){
                    let responses = [];
                    responses.push( new Response({text: 'C', occurence: 50}) );
                    return responses;
                }
            }

            dialogRegistry.add( new TestDialog );
            dialogRegistry.add( new TestDialog2 );

            let results = await dialogRegistry.onRun('A');

            assert.equal(results.length, 1);
            assert.equal(results[0].text, 'A');
            assert.equal(results[0].occurence, 100);
        });
    });
});