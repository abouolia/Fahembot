
exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', (table) => {
        table.increments();
        table.string('student_id').notNullable();
        table.string('password').notNullable();
    })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
