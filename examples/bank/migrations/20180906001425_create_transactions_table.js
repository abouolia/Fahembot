
exports.up = function(knex, Promise) {
  return knex.schema.createTable('transactions', (table) => {
    table.increments();
    table.string('amount');
    table.string('from_account_id');
    table.string('to_account_id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('transactions');
};
