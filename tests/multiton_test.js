const Multiton = require('../fahem/multiton');
const assert = require('chai').assert;


describe('Multiton', () =>{

    describe('add', () => {

        it('Should add class instance to collection.', () => {
            let multiton = new Multiton();

            class Foo{}
            multiton.add(new Foo);

            assert.exists(multiton.instances.Foo);
        });
    });

    describe('remove', () => {

        it('Should remove class instance from collection', () => {
            let multiton = new Multiton();

            class Foo{}
            multiton.add(new Foo);
            multiton.remove('Foo');

            assert.isUndefined(multiton.instances.Foo);
        });
    });

    describe('exists', () => {

        it('Should detarimine if the class instance added already.', () => {
            let multiton = new Multiton();

            class Foo{}
            multiton.add(new Foo);

            assert.equal(multiton.exists('Foo'), true);
        });
    });

    describe('get', () => {

        it('Should get class instance from collection by class name.', () => {
            let multiton = new Multiton();

            class Foo{};
            let foo = new Foo();
            multiton.add(foo);

            assert.deepEqual(multiton.get('Foo'), foo);
        });
    });
});