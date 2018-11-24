const knex = require('../fahem/knex');

async function initDB(){
    await knex.migrate.rollback();
    await knex.migrate.latest();
}

async function destroyDB(){
    await knex.migrate.rollback();
}

module.exports = {
    initDB,
    destroyDB
}