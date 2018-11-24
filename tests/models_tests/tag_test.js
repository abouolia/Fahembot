process.env.NODE_ENV = 'test';

const chai = require('chai');
const Tag = require('../../fahem/models/tag');
const TagRepository = require('../../fahem/repositories/tag_repository');
const Statement = require('../../fahem/models/statement');
const StatementRepository = require('../../fahem/repositories/statement_repository');
const {initDB, destroyDB} = require('../utils');
const assert = chai.assert;

describe('Tag', () => {

    describe('fetchStatements', () => {

        it('Should fetch all statements that belongs to the tag.', async () => {
            await initDB();

            let statement = new Statement({text: 'hello'});
            let greeting = new Tag({text: 'greeting'});

            statement.addTag(greeting);
            
            let statementRepository = new StatementRepository(statement);
            await statementRepository.save();
    
            let statements = await TagRepository.fetchStatements(greeting);
            
            assert.equal(statements.length, 1);
            assert.equal(statements[0].text, 'hello');
            
            await destroyDB();
        });
    });
});