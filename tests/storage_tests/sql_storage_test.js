'use strict';
process.env.NODE_ENV = 'test';
 
const chai = require('chai');
const {initDB, destroyDB} = require('../utils');
const assert = chai.assert;
const knex = require('../../fahem/knex');
const Fahem = require('../../fahem/fahem');
const Statement = require('../../fahem/models/statement');
const StatementRepository = require('../../fahem/repositories/statement_repository');
const SqlStorage = require('../../fahem/storage/sql_storage');
const Response = require('../../fahem/models/response');
const Tag = require('../../fahem/models/tag');
const factory = require('../factories');


describe('SqlStorage', () => {

    describe('update', () => {

        it("Should insert a new statement to the database.", async () => {
            await initDB();

            let helloWorld = 'Hello world';
            let statement = new Statement({text: helloWorld});

            await SqlStorage.update(statement);

            let savedQuery = await knex('statements').where('text', helloWorld).first();
            assert.include(savedQuery, {text: helloWorld});

            await destroyDB();
        });

        it('Should not insert a new statement if it was found.', async () => {
            await initDB();

            await factory.create('statement', {text: 'Hello world'});

            let statement = new Statement({text: 'Hello world'}); 
            await SqlStorage.update(statement);

            let savedStatement = await knex('statements');
            assert.equal(savedStatement.length, 1);

            await destroyDB();
        });

        it('Should update statement text in the database if statement ID is defined.', async () => {
            await initDB();

            let statement = await factory.create('statement');
            statement = await StatementRepository.find(statement.id);

            statement.text = 'Hello world';

            await SqlStorage.update(statement);

            let queriedStatements = await knex('statements').where('text', statement.text).first();
            assert.include(queriedStatements, {text: statement.text});

            await destroyDB();
        });

        it('Should inserted responses that added to the Statement model to the database.', async () => {
            await initDB();

            let statement = new Statement({text: 'Hello World'});
            let response1 = new Response({text: 'Fine'});
            let response2 = new Response({text: 'I am fine'});

            statement.addResponse(response1);
            statement.addResponse(response2);

            let savedStatement = await SqlStorage.update(statement);
            let savedResponses = await knex('responses').where('respond_to', savedStatement.id);

            assert.equal(savedResponses.length, 2);
            assert.equal(savedResponses[0].text, 'Fine');
            assert.equal(savedResponses[0].respond_to, savedStatement.id);

            assert.equal(savedResponses[1].text, 'I am fine');
            assert.equal(savedResponses[1].respond_to, savedStatement.id);

            await destroyDB();
        });

        it('Should delete responses that deleted from Statement model from the database,', async () => {
            await initDB();

            let statement = await factory.create('statement');
            let response  = await factory.create('response', {
                respond_to: statement.id
            });
            
            statement = Statement.toModel(statement);
            
            let statementRepository = new StatementRepository(statement);
            let responses = await statementRepository.fetchResponses();

            statement.removeResponse(responses[0]);
            await SqlStorage.update(statement);

            let foundStatement = await knex('responses');

            assert.equal(foundStatement.length, 0);

            await destroyDB();
        });

        it('Should response belongs to the statement that exist in the database.', async () => {
            await initDB();

            let statement = new Statement({text: 'Hello'});
            let statementRespository = new StatementRepository(statement);

            await statementRespository.save();

            let helloWorld = new Statement({text: 'Hello'});
            let response = new Response({text: 'Fine'})
            helloWorld.addResponse(response);

            await SqlStorage.update(helloWorld);

            let statements = await knex('statements'); 
            assert.equal(statements.length, 1);

            let responsesQuery = await knex('responses').where('text', 'Fine');
            assert.equal(responsesQuery[0].text, 'Fine');
            assert.equal(responsesQuery[0].respond_to, 1);

            await destroyDB();
        });

        it('Should appended tags be stored to the database.', async () => {
            await initDB();

            let statement = new Statement({text: 'Hello'});
            let tag = new Tag({text: 'greeting'});

            statement.addTag(tag);

            let statementRepository = new StatementRepository(statement);
            await statementRepository.save();

            let tagsQuery = await knex('tags').where({text: 'greeting'});

            assert.equal(tagsQuery.length, 1);
            assert.equal(tagsQuery[0].text, 'greeting');

            let tagsRelationQuery = await knex('tags_relation').where({
                statement_id: statement.id,
                tag_id: tagsQuery[0].id
            });

            assert.equal(tagsRelationQuery[0].tag_id, tagsQuery[0].id);
            assert.equal(tagsRelationQuery[0].statement_id, statement.id);

            await destroyDB();
        });

        it('Should not store the tag if it already stored in the storage.', async () => {
            await initDB();

            let statement = await factory.create('statement');
            let tag = await factory.create('tag');

            let tagRelation = await factory.create('tag_relation', {
                tag_id: tag.id,
                statement_id: statement.id
            });

            tag = new Tag({text: tag.text});
            statement = new Statement({text: 'hi'});
            statement.addTag(tag);

            let statementRepository = new StatementRepository(statement);
            await statementRepository.save();

            let tagsFound = await knex('tags').where({text: tag.text});
            assert.equal(tagsFound.length, 1);

            await destroyDB();
        });

        it('Should return statement data after saving to the database.', async () => {
            await initDB();

            let statement = new Statement({text: 'Hello world'});
            let statementRepository = new StatementRepository(statement);

            let savedStatement = await statementRepository.save();
            
            assert.include(savedStatement, {text: 'Hello world'});

            await destroyDB();
        });
    });

    describe('findStatement', () => {

        it('Should statement found by text.', async () => {
            await initDB();

            let statement = await factory.create('statement');

            let foundStatement = await SqlStorage.findStatement(statement.text);
            
            assert.isDefined(foundStatement);

            statement = Statement.toModel(foundStatement);
            assert.include(statement, {text: statement.text});

            await destroyDB();
        });

        it('Should statement found by id.', async () => {
            await initDB();
            
            let statement = await factory.create('statement');

            let foundStatement = await SqlStorage.findStatement(statement.id);
            
            statement = Statement.toModel(foundStatement);
            assert.include(statement, {text: statement.text});

            await destroyDB();
        });

        it('Should statement not found.', async () => {
            await initDB();

            let foundStatement = await SqlStorage.findStatement(1);
            assert.isUndefined(foundStatement);

            await destroyDB();
        });
    });

    describe('findResponsesByStatement', () => {

        it('Should responses found by statement id.', async () => {
            await initDB();

            let statement = await factory.create('statement');
            let response = await factory.create('response', {
                respond_to: statement.id
            });

            let savedResponses = await SqlStorage.findResponsesByStatement(statement.id);

            assert.equal(savedResponses.length, 1);
            assert.equal(savedResponses[0].text, response.text);
            assert.equal(savedResponses[0].respond_to, statement.id);

            await destroyDB();
        });

        it('Should responses found by statement text.', async () => {
            await initDB();

            let statement = await factory.create('statement');
            let response = await factory.create('response', {
                respond_to: statement.id
            });

            let queriedResponses = await SqlStorage.findResponsesByStatement(statement.text);
            
            assert.equal(queriedResponses.length, 1);
            assert.equal(queriedResponses[0].text, response.text);
            assert.equal(queriedResponses[0].respond_to, statement.id);
            
            await destroyDB();
        });
    });
    
    describe('findTagsByStatement', async () => {

        it('Should find all tags of given statement.', async () => {
            await initDB();

            let statement = new Statement({text: 'Hello'});
            let tag  = new Tag({text: 'greeting'});
            let tag2 = new Tag({text: 'sport'});

            statement.addTag(tag);
            statement.addTag(tag2);

            let statementRepository = new StatementRepository(statement);

            await statementRepository.save();
            
            let result = await SqlStorage.findTagsByStatement(statement);

            assert.equal(result.length, 2);

            assert.equal(result[0].text, 'greeting');
            assert.equal(result[1].text, 'sport');

            await destroyDB();
        });
    });

    describe('findStatementByTags', () => {

        it('Should find all statements that associated to a tag.', async () => {
            await initDB();

            let statement = new Statement({text: 'Hello'});
            let tag = new Tag({text: 'greeting'});

            statement.addTag(tag);

            let statementRepository = new StatementRepository(statement);

            await statementRepository.save();
            
            let result = await SqlStorage.findStatementsByTag('greeting');
 
            assert.equal(result.length, 1);
            assert.equal(result[0].text, 'Hello');

            await destroyDB();
        });
    });

    describe('getRandomStatement', () => {

        it('Should statement found by text.', async () => {
            await initDB();

            let statement = await factory.create('statement');

            let randomStatement = await SqlStorage.getRandomStatement();
 
            assert.equal(randomStatement.text, statement.text);

            await destroyDB();
        }); 
    });
});