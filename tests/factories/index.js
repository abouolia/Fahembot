const factory = require('knex-factory')(knex);
const faker = require('faker');


factory.define('statement', 'statements', {
    text: faker.lorem.sentence
});

factory.define('response', 'responses', {
    text: faker.lorem.sentence,
    occurence: 1,
    async respond_to(){
        return await factory.create('statement');
    }
});

factory.define('tag', 'tags', {
    text: faker.lorem.sentence
});

factory.define('tag_relation', 'tags_relation', {
    async tag_id(){
        return await factory.create('tagItem');
    },
    async statement_id(){
        return await factory.create('statement');
    }
});

module.exports = factory;