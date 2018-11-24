process.env.NODE_ENV = 'test';

const Model = require('../../fahem/models/model');
const Statement = require('../../fahem/models/statement');
const chai = require('chai');
const assert = chai.assert;

describe('model', () => {
    
    describe('toModel', () => {

        it('Should return Model object.', () => {
            let model = Model.toModel('Hello World', Model);
            assert.isTrue(model instanceof Model);
        });

        it('Should convert string input to the title method of Model object.', () =>{
            let model = Model.toModel('Hello World', Model);
            assert.equal(model.text, 'Hello World');
        });

        it('Should convert integer input to the ID method of Model object.', () => {
            let model = Model.toModel(100, Model);
            assert.equal(model.id, 100);
        });

        it('Should convert plain object to Model object', () => {
            let model = Model.toModel({id: 10});
            assert.equal(model.id, 10);
        });
    });
});