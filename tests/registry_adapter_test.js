const RegistryAdapter = require('../fahem/registry_adapter');
const assert = require('chai').assert;

class CarAdapter {}
class Tesla extends CarAdapter{
    static get name(){
        return 'tesla';
    }
}

describe('registryAdapter', () => {

    describe('register', () => {

        it('Should register adapter class to data collection.', () => {
            let registry = new RegistryAdapter(CarAdapter);
            registry.register(Tesla);
            
            assert.include(registry.collection, Tesla);
        });

        it('Should not register adapter class to data collection, if it was exist.', () => {
            let registry = new RegistryAdapter(CarAdapter);
            registry.register(Tesla);
            registry.register(Tesla);

            assert.equal(Object.keys(registry.collection).length, 1);
        });
    });

    describe('unregister', () => {

        it('Should unregister adapter class from data collection.', () => {
            let registry = new RegistryAdapter(CarAdapter);
            registry.register(Tesla);
            registry.unregister(Tesla);

            assert.equal(Object.keys(registry.collection).length, 0);
        });
    });

    describe('exists', () => {

        it('Should return true if the object was already registered.', () => {
            let registry = new RegistryAdapter(CarAdapter);
            registry.register(Tesla);

            assert.equal(registry.exists(Tesla), true);
        });

        it('Should return false if the object was not registered.', () => {
            let registry = new RegistryAdapter(CarAdapter);
            
            assert.equal(registry.exists(Tesla), false);
        });
    });

    describe('validateAdapterObject', () => {

        it('Should throw error if registered class is not extended adapter class.', () => {
            let registry = new RegistryAdapter(CarAdapter);
            assert.throws(() => { registry.register(Mercedes); });
            assert.doesNotThrow(() => { registry.register(Tesla); });
        });
    });
});