process.env.NODE_ENV = 'test';

const {initDB, destroyDB} = require('../utils');
const knex = require('../../fahem/knex');
const Fahem = require('../../fahem/fahem');
const Statement = require('../../fahem/models/statement');
const Response = require('../../fahem/models/response');
const Tag = require('../../fahem/models/tag');
const chai = require('chai');
const assert = chai.assert;

describe('statement', () => {

    describe('addResponse', () => {

        it('Should append the response to statement model.', () => {
            let statement = new Statement({text: 'Hello'});
            let response = new Response({text: 'Fine'});
            
            statement.addResponse(response);
            
            let foundResponse = statement.responses.find((response) => {
                return response.text === 'Fine';
            });
            
            assert.equal(foundResponse.text, response.text);
        });

        it('Should appended response in statement stack its occurency increase one if it found.', () => {
            let statement = new Statement({text: 'Hello'});
            let responseFirst = new Response({text: 'Fine'});
            let responseSecond = new Response({text: 'Fine'});
            let occurence = 0;

            statement.addResponse(responseFirst);
            statement.addResponse(responseSecond);

            statement.responses.forEach((response) => {
                if( response.text === 'Fine' )
                    occurence = response.occurence;
            });
            
            assert.equal(2, occurence);
        });
    });

    describe('removeResponse', () => {

        it('Should response be removed from statement model.', () => {
            let statement = new Statement({text: 'Hello'});
            let response = new Response({text: 'Fine'});
            
            statement.addResponse(response);
            assert.equal(statement.responses.length, 1);
            
            assert.isTrue(statement.removeResponse(response));
            assert.equal(statement.responses.length, 0);
        });
    });

    describe('addTag', () => {

        it('Should append the tag to the statement model.', () => {
            let statement = new Statement({text: 'Hello'});
            let tag = new Tag({text: 'greeting'});

            statement.addTag(tag);

            assert.equal(statement.tags[0].text, tag.text);
        });
    });

    describe('removeTag', () => {

        it('Should tag be remove from statement model.', () => {
            let statement = new Statement({text: 'Hello'});
            let tag = new Tag({text: 'greeting'});

            statement.addTag(tag);
            
            assert.equal(statement.tags.length, 1);
            assert.equal(statement.tags[0].text, 'greeting');
        });
    });

    describe('serialize', () => {
        
        it('Should serialize Statement instance to plain objet', () => {
            let statement = new Statement({ text: 'Hello' });
            let response  = new Response({ text: 'Fine' });

            statement.addResponse(response);

            assert.notStrictEqual(statement.serialize(), {
                id: 0,
                text: 'Hello',
                created_at: null,
                responses: [{
                    text: 'Fine',
                    id: 0,
                    respond_to: 0,
                    created_at: null,
                    occurence: 1
                }]
            });
        });
    });
});