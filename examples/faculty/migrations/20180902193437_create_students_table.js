
exports.up = function(knex, Promise) {
  return knex.schema.createTable('students', (table) => {
    table.increments();
    table.string('firstname').notNullable();
    table.string('lastname').notNullable();
    table.string('semester').notNullable();
    table.boolean('active').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('students');
};
