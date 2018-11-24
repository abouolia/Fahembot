
exports.up = function(knex, Promise) {
    return knex.schema.createTable('statements', (table) => {
        table.increments();
        table.string('text').notNullable();
        table.integer('created_at');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('statements');
};
