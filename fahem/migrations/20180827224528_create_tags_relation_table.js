
exports.up = function(knex, Promise) {
    return knex.schema.createTable('tags_relation', (table) => {
        table.increments();
        table.integer('statement_id');
        table.integer('tag_id');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('tags_relation');
};
