'use strict';
process.env.NODE_ENV = 'test';

const {initDB, destroyDB} = require('../utils');
const chai = require('chai');
const assert = chai.assert;
const Fahem = require('../../fahem/fahem');
const ListTrainer = require('../../fahem/trainers/list_trainer');

let fahem = new Fahem();

describe('list_trainer', () => {

    describe('train', () => {

        it('Should store training list data to the database.', async () => {
            await initDB();

            let listTrainer = new ListTrainer();

            await listTrainer.train([
                'How are you?',
                'I am fine',
                'what about you',
            ]);
            
            let statementQuery = await knex('statements');
            assert.equal(1, statementQuery.length);

            let responseQuery = await knex('responses');
            assert.equal(2, responseQuery.length);

            await destroyDB();
        });

        it('Should store training list data under given categories in the DB.', async () => {
            await initDB();

            let listTrainer = new ListTrainer(fahem);

            await listTrainer.train([
                'How are you?',
                'I am fine',
                'what about you',
            ], ['greeting', 'hello']);

            let tagsQuery = await knex('tags');
            assert.equal(2, tagsQuery.length);

            await destroyDB();
        });
    });
});