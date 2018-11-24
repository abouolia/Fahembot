process.env.NODE_ENV = 'test';

const chai = require('chai');
const {initDB, destroyDB} = require('../utils');
const assert = chai.assert;
const Fahem = require('../../fahem/fahem');
const Statement = require('../../fahem/models/statement');
const StatementRepository = require('../../fahem/repositories/statement_repository');
const Response = require('../../fahem/models/response');
const ContextualDialog = require('../../fahem/dialogs/contextual_dialog');
const Naivebayes = require('../../fahem/classification/naive_bayes');
const Knex = require('../../fahem/knex');

let contextualDialog;
let fahem = new Fahem();

describe('ContextualDialog', () => {

    beforeEach( async () => {
        await initDB();
        contextualDialog = new ContextualDialog(fahem);
        contextualDialog.setClassifier(new Naivebayes());
    });

    afterEach( async () => {
        await destroyDB();
    });

    describe('#onRun()', () => {

        it('Should get the closest statement from the database.', async () => {

            let statement = new Statement({text: 'hello'});
            let response = new Response({text: 'Fine'});

            statement.addResponse(response);
            
            let statementRepository = new StatementRepository(statement);
            await statementRepository.save();

            let result = await contextualDialog.onRun('helo');

            assert.instanceOf(result, Response);
            assert.equal(result.text, 'Fine');
        });

        it('Should get random statement from the storage.', async () => {

            let statement = new Statement({text: 'hello'});
            let response = new Response({text: 'Fine'});
            
            statement.addResponse(response);
            
            let statementRepository = new StatementRepository(statement);
            await statementRepository.save();
            
            let result = await contextualDialog.onRun('goverment');

            assert.instanceOf(result, Statement);
            assert.equal(result.text, 'hello');
        });
    });
});