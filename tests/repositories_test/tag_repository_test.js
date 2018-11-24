process.env.NODE_ENV = 'test';

const {initDB, destroyDB} = require('../utils');
const knex = require('../../fahem/knex');
const chai = require('chai');
const TagRepository = require('../../fahem/repositories/tag_repository');
const assert = chai.assert;

describe('tag_repository', () => {

    describe('fetchStatement', () => {

        it('Should fetch all statements of associated tag.', async () => {
            await initDB();
    
            let statementId = await knex('statements').insert({
                text: 'hello',
            });

            let tagId = await knex('tags').insert({text: 'greeting'});

            await knex('tags_relation').insert({
                statement_id: statementId[0],
                tag_id: tagId[0]
            });

            let statements = await TagRepository.fetchStatements('greeting');

            assert.equal(statements.length, 1);
            assert.equal(statements[0].text, 'hello');

            await destroyDB();
        });
    });
});