
exports.up = function(knex, Promise) {

    return knex.schema.createTable('orders', (table) => {
        table.increments();
        table.string('full_name').notNullable();
        table.string('mobile_number').notNullable();
        table.string('address').notNullable();

        table.string('pizza').notNullable();
        table.string('pizza_size').notNullable();
        table.string('extra_cheese').notNullable();

        table.string('quentity').notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('orders');
};
