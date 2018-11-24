const environment = process.env.NODE_ENV || 'development';
const config = require('./knexfile.js')[environment];

if( ! global.knex )
    global.knex = require('knex')(config);

module.exports = global.knex;