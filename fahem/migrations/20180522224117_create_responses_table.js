
exports.up = function(knex, Promise) {
    return knex.schema.createTable('responses', (table) => {
        table.increments();
        table.text('text', 'longtext').notNullable();
        table.integer('occurence').notNullable();
        table.integer('respond_to').notNullable().unsigned();
        table.integer('created_at');
        table.foreign('respond_to').references('id').inTable('statements');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('responses');
};
