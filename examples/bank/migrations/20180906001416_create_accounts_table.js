
exports.up = function(knex, Promise) {
  return knex.schema.createTable('accounts', (table) => {
    table.increments();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('email').notNullable();
    table.string('gender').notNullable();
    table.string('balance').notNullable();
    table.string('password');
    table.string('type').notNullable();
    table.boolean('active').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('accounts');
};
