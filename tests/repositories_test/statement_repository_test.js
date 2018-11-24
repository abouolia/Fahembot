process.env.NODE_ENV = 'test';

const {initDB, destroyDB} = require('../utils');
const knex = require('../../fahem/knex');
const Fahem = require('../../fahem/fahem');
const Statement = require('../../fahem/models/statement');
const StatementRepository = require('../../fahem/repositories/statement_repository');
const Response = require('../../fahem/models/response');
const Tag = require('../../fahem/models/tag');
const chai = require('chai');
const assert = chai.assert;


describe('statement_repository', () => {

    describe('save', async () => {

        it('Should save statement data to the storage.', async () => {
            await initDB();

            let statement = new Statement({text: 'Hello'});
            let statementRepository = new StatementRepository(statement);

            await statementRepository.save();

            let foundStatements = await knex('statements');

            assert.equal(foundStatements.length, 1);
            assert.equal(foundStatements[0].text, 'Hello');

            await destroyDB();
        });
    });

    describe('find', () => {

        it('It should find the given statement in the storage.', async () => {
            await initDB();

            let statement = new Statement({text: 'Hello'});
            let statementRepository = new StatementRepository(statement);

            await statementRepository.save();

            let foundStatement = await StatementRepository.find(statement);

            assert.instanceOf(foundStatement, Statement);
            assert.equal(foundStatement.text, 'Hello');

            await destroyDB();
        });
    });

    describe('fetchResponses', () => {

        it('It should fetch all responses of the statement model', async () => {
            await initDB();

            let helloWorld = 'Hello world';
            let statement = new Statement({text: helloWorld});
            let response = new Response({text: 'Fine'});

            statement.addResponse(response);
            
            let statementRepository = new StatementRepository(statement);

            await statementRepository.save(statement);
            await StatementRepository.fetchResponses(statement);

            assert.equal(statement.responses.length, 1);
            assert.equal(statement.responses[0].text, 'Fine');

            await destroyDB();
        });
    });

    describe('fetchTags', () => {

        it('Should fetch all tags that belongs to statement model.', async () => {
            await initDB();

            let statement = new Statement({text: 'hello'});
            let greeting = new Tag({text: 'greeting'});
            let sport = new Tag({text: 'sport'});
            
            statement.addTag(greeting);
            statement.addTag(sport);

            let statementRepository = new StatementRepository(statement);

            await statementRepository.save();
            await statementRepository.fetchTags();

            assert.equal(statement.tags.length, 2);
            assert.equal(statement.tags[0].text, 'greeting');
            assert.equal(statement.tags[1].text, 'sport');

            await destroyDB();
        });
    });

    describe('getRandom', () => {

        it('Should get random statement from the storage.', async () => {
            await initDB();

            let statement = new Statement({text: 'hello'});
            let statementRepository = new StatementRepository(statement);

            await statementRepository.save();

            let randomStatement = await StatementRepository.getRandom();

            assert.instanceOf(randomStatement, Statement);
            assert.equal(randomStatement.text, 'hello');

            await destroyDB();
        });
    });
});