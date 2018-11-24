process.env.NODE_ENV = 'test';

const chai = require('chai');
const Fahem = require('../fahem/fahem');
const IOAdapter = require('../fahem/io/io_adapter');
const StorageAdapter = require('../fahem/storage/storage_adapter');
const TrainerAdapter = require('../fahem/trainers/trainer_adapter');
const SqlStorage = require('../fahem/storage/sql_storage');
const assert = chai.assert;

describe('fahem', () => {

    describe('train', () => {

        it('Should train adapter be set in instance of Fahem object.', () => {
            let fahem = new Fahem();
            
            class MockTrainerAdapter extends TrainerAdapter{
                train(){}
            }

            let mockTrainerAdapter = new MockTrainerAdapter(fahem);
            fahem.trainer = mockTrainerAdapter;

            assert.equal(fahem.trainer, mockTrainerAdapter);
        });
    });

    describe('storage', () => {

        it('Should storage adapter be set in Fahem object.', () => {
            let fahem = new Fahem();

            class MockStorageAdapter extends StorageAdapter{}

            Fahem.storage = MockStorageAdapter;
            
            assert.equal(Fahem.storage, MockStorageAdapter);

            Fahem.storage = SqlStorage;
        });
    });

    describe('io', () => {

        it('Should set up io adapter class to Fahem object.', () => {
            let fahem = new Fahem();

            class MockIOAdapter extends IOAdapter{}

            let mockIoAdapter = new MockIOAdapter();
            fahem.io = mockIoAdapter;

            assert.equal(fahem.io, mockIoAdapter);
        });
    });
});