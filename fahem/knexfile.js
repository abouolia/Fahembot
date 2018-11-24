// Update with your config settings.
 
module.exports = {

  development: {
    client: 'sqlite3',
    migrations: {
      directory: __dirname + '/migrations'
    },
    connection: {
      filename: __dirname + '/../db/fahem.sqlite'
    },
    useNullAsDefault: true
  },
  
  test: {
    client: 'sqlite3',
    migrations: {
      directory: __dirname + '/migrations'
    },
  connection: {
      filename: __dirname + '/../db/test.sqlite'
    },
    useNullAsDefault: true
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
