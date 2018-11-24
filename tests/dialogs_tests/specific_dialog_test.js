process.env.NODE_ENV = 'test';

const chai = require('chai');
const assert = chai.assert;
const Response = require('../../fahem/models/response');
const SpecificResponse = require('../../fahem/dialogs/specific_dialog');
const Naivebayes = require('../../fahem/classification/naive_bayes');
const acceptance = require('../../fahem/utterances/acceptance');

let specificResponse;


describe('SpecificResponse', () => {

    beforeEach(() => {
        specificResponse = new SpecificResponse();
        specificResponse.setClassifier(new Naivebayes());
    });

    afterEach(() => {
        specificResponse = null; 
    });

    describe('#hear()', () => {

        it('Should event be registered.', () => {
            function callback(){
                specificResponse.reply('I am fine');
            }
            
            specificResponse.hears('Hello', callback);

            assert.equal(specificResponse.events.length, 1);
            assert.equal(specificResponse.events[0].callback, callback);
            assert.equal(specificResponse.events[0].statement.text, 'Hello');
        });

        it('Should statement that under specific category be registered under the category.', () => {
            function fine(){
                specificResponse.reply('Fine');
            }

            specificResponse.hears('hello', fine, {category: ['greeting']});

            assert.equal(specificResponse.categories.retrieve('greeting').length, 1);
            assert.equal(specificResponse.categories.retrieve('greeting')[0].statement.text, 'hello');
            assert.equal(specificResponse.categories.retrieve('greeting')[0].callback, fine);

            specificResponse.hears('hi', fine, {category: ['greeting']});

            assert.equal(specificResponse.categories.retrieve('greeting').length, 2);
            assert.equal(specificResponse.categories.retrieve('greeting')[1].statement.text, 'hi');
        });
    });

    describe('#reply()', () => {

        it('Should reply message be queued in the messages variable.', () => {            
            specificResponse.hears('Hello', () => {
                specificResponse.reply('I am fine');
            });

            specificResponse.events[0].callback();

            assert.equal(specificResponse.responses.length, 1);
            assert.equal(specificResponse.responses[0].text, 'I am fine');
        });
    });

    describe('#addMessage()', () => {

        it('Should messages be stored as a adjencency matrix.', () => {
            specificResponse.addMessage({text: 'B', action: 'c'}, 'b');
            specificResponse.addMessage({text: 'A', action: 'b'}, 'a');
            specificResponse.addMessage({text: 'C', action: ''}, 'c');
            specificResponse.addMessage({text: 'F', action: ''}, 'f');

            assert.notStrictEqual(specificResponse.threads['a'], ['b']);
            assert.notStrictEqual(specificResponse.threads['b'], ['c']);
            assert.notStrictEqual(specificResponse.threads['c'], []);
            assert.equal(specificResponse.threads['c'].length, 0);

            assert.notStrictEqual(specificResponse.threads['f'], []);
        });

        it('Should store all messages with its unique context.', () => {
            specificResponse.addMessage({text: 'A', action: 'b'}, 'a');
            specificResponse.addMessage({text: 'B', action: 'c'}, 'b');
            specificResponse.addMessage({text: 'C', action: ''}, 'c');

            specificResponse.addMessage({text: 'F', action: ''}, 'f');
            specificResponse.addMessage({text: 'G', action: ''}, 'f');

            assert.equal(specificResponse.messages['a'].text, 'A');
            assert.equal(specificResponse.messages['b'].text, 'B');
            assert.equal(specificResponse.messages['c'].text, 'C');

            assert.equal(specificResponse.messages['f'].length, 2);
            assert.equal(specificResponse.messages['f'][0].text, 'F');
            assert.equal(specificResponse.messages['f'][1].text, 'G');
        });

        it('Should register message to responses stack when there is no context.', () => {
            specificResponse.addMessage({text: 'A', action: 'b'});

            assert.equal(specificResponse.responses.length, 1);
            assert.equal(specificResponse.responses[0].text, 'A');
        });
    });

    describe('#gotoThread()', () => {
        
        it('Should traverse to end of the path for given message node.', () => {
            specificResponse.addMessage({text: 'B', action: 'c'}, 'b');
            specificResponse.addMessage({text: 'A', action: 'b'}, 'a');
            specificResponse.addMessage({text: 'C', action: ''}, 'c');

            specificResponse.gotoThread('a');
            
            assert.equal(specificResponse.responses.length, 3);
            assert.equal(specificResponse.responses[0].text, 'A');
            assert.equal(specificResponse.responses[1].text, 'B');
            assert.equal(specificResponse.responses[2].text, 'C');
        });
    });

    describe('#ask()', () => {

        it('Should register the question in responses array as a question.', () => {
            let specificResponse = new SpecificResponse();

            specificResponse.ask('What?', [
                {
                    pattern: '',
                    keyword: '1. Yes',
                    callback: () => { specificResponse.reply('YES') }
                },
                {
                    pattern: '',
                    keyword: '2. No',
                    callback: () => { specificResponse.reply('No') }
                }
            ]);
            
            assert.equal(specificResponse.responses.length, 1);
            assert.equal(specificResponse.responses[0].text, 'What?');
            assert.equal(specificResponse.responses[0].type, Response.TYPES.QUESTION);
            assert.equal(specificResponse.responses[0].options.length, 2);

            assert.equal(specificResponse.responses[0].options[0].keyword, '1. Yes');
            assert.equal(specificResponse.responses[0].options[1].keyword, '2. No');
        });
    });

    describe('#repeat()', () => {

        it('Should get the latest response.', () => {

            let response = new Response({text: 'Hello'});
            let response2 = new Response({text: 'World'});

            specificResponse.responses.push(response);
            specificResponse.responses.push(response2);

            assert.instanceOf(specificResponse._latestResponse, Response);
            assert.equal(specificResponse._latestResponse.text, 'World');
        });
    });

    describe('#onStart()', () => {

        it('Should get all queued responses.', async () => {
            specificResponse.responses.push(new Response({text: 'hello'}));

            let results = await specificResponse.onStart();

            assert.equal(results.length, 1);
        });
    });

    describe('#onRun()', () => {

        it('Should return the closest registered statement for given input statement', async () => {
            specificResponse.hears('Hello', () => {
                specificResponse.reply('I am fine');
            });

            specificResponse.hears('Ahmed', () => {
                specificResponse.reply('Bouhuolia');
            });

            let results = await specificResponse.onRun('hello');

            assert.equal(results.length, 1);
            assert.equal(results[0].id, 0);
            assert.equal(results[0].text, 'I am fine');
        
            results = await specificResponse.onRun('ahmed');

            assert.equal(results.length, 1);
            assert.equal(results[0].id, 0);
            assert.equal(results[0].text, 'Bouhuolia');    
        });

        it('Should return question and its options.', async () => {
            
            specificResponse.ask('What?', [
                {
                    keyword: 'Yes',
                    pattern: '',
                    callback: () => { specificResponse.reply('Ahmed'); }
                },
                {
                    keyword: 'No',
                    pattern: '',
                    callback: () => { specificResponse.reply('Mohamed'); }
                }
            ]);

            let results = await specificResponse.onRun('');

            assert.equal(results.length, 1);
            assert.equal(results[0].text, 'What?');
            assert.equal(results[0].type, Response.TYPES.QUESTION);

            assert.equal(results[0].options[0].keyword, 'Yes');
            assert.equal(results[0].options[0].keyword, 'Yes');
        });

        it('Should return responses of matched option of the question.', async () => {

            specificResponse.ask('What?', [
                {
                    keyword: 'Yes',
                    pattern: /^(yes)/,
                    callback: () => { specificResponse.reply('Yes Reply'); }
                },
                {
                    keyword: 'No',
                    pattern: /^(no)/,
                    callback: () => { specificResponse.reply('No Reply'); }
                }
            ]);
        
            await specificResponse.onRun('');
            let results = await specificResponse.onRun('yes');

            assert.equal(results.length, 1);
            assert.equal(results[0].text, 'Yes Reply');
        });

        it('Should return closest option of question options.', async () => {

            specificResponse.ask('What?', [
                {
                    keyword: 'Yes',
                    pattern: 'yes',
                    callback: () => { specificResponse.reply('Yes Reply'); }
                },
                {
                    keyword: 'No',
                    pattern: 'no',
                    callback: () => { specificResponse.reply('No Reply'); }
                }
            ]);

            await specificResponse.onRun('');
            let results = await specificResponse.onRun('yas');

            assert.equal(results.length, 1);
            assert.equal(results[0].text, 'Yes Reply');
        });

        it('Should return closest option of question options in case option has multi-pattern.', async () => {

            specificResponse.ask('What?', [
                {
                    pattern: ['A', 'B'],
                    callback: () => { specificResponse.reply('Yes reply'); }
                },
                {
                    pattern: ['C', 'D'],
                    callback: () => { specificResponse.reply('No reply'); }
                }
            ]);

            await specificResponse.onRun('');
            let results = await specificResponse.onRun('A');

            assert.equal(results.length, 1);
            assert.equal(results[0].text, 'Yes reply');
        });

        it('Should return response of default option of the question if not matched.', async () => {
        
            specificResponse.ask('What?', [
                {
                    keyword: 'Yes',
                    pattern: /^(yes)/,
                    callback: () => { specificResponse.reply('Yes Reply'); }
                },
                {
                    keyword: 'No',
                    pattern: /^(no)/,
                    callback: () => { specificResponse.reply('No Reply'); }
                },
                {
                    callback: () => { specificResponse.reply('Default Reply'); }
                }
            ]);
    
            await specificResponse.onRun('');
    
            let results = await specificResponse.onRun('Something');
    
            assert.equal(results.length, 1);
            assert.equal(results[0].text, 'Default Reply');
        });

        it('Should reset options after response to a question.', async  () => {
    
            specificResponse.ask('What?', [
                {
                    keyword: 'Yes',
                    pattern: /^(yes)/,
                    callback: () => { specificResponse.reply('Yes Reply'); }
                },
                {
                    keyword: 'No',
                    pattern: /^(no)/,
                    callback: () => { specificResponse.reply('No Reply'); }
                },
                {
                    callback: () => { specificResponse.reply('Default Reply'); }
                }
            ]);

            await specificResponse.onRun('');

            let results = await specificResponse.onRun('Something');

            assert.equal(specificResponse.options.length, 0);
        });
    });
});