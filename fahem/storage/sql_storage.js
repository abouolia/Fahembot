const knex = require('../knex');
const StorageAdapter = require('./storage_adapter');
const Statement = require('../models/statement');
const {getRandomInt} = require('../utils');
const Tag = require('../models/tag');

class SqlStorage extends StorageAdapter{

    /**
     * Update statement model to the database.
     * @static
     * @async
     * @param {Statement} statement - 
     */
    static async update(statement){
        let statementQuery = await SqlStorage.findStatement(statement);
        
        if( statementQuery ){
            if( statementQuery.text != statement.text && statement.id )
                statement.id = await knex('statements').update('text', statement.text)
                    .where('id', statement.id);
            else
                statement.id = statementQuery.id;
        } else {
            statement.id = await knex('statements').insert(statement.serializeToDB());
        } 

        if( statement.id[0] )
            statement.id = statement.id[0];

        if( statement._responsesDeleted.length ){
            console.log(statement._responsesDeleted);
            await knex('responses').delete('id', statement._responsesDeleted);
            statement._responsesDeleted = [];
        }

        let responsesWillStore = [], responseDuplicated = [], tagsWillStore = [], foundResponse;
        let responsesQuery = await knex('responses').where('respond_to', statement.id);
        
        statement.responses.forEach((response) => {
            if( foundResponse = responsesQuery.find(findResponse) ){
                responseDuplicated.push(foundResponse.id);
            } else {
                if( false === response._stored ){
                    response.respondTo = statement.id;
                    responsesWillStore.push(response.serializeToDB());
                }
            }

            function findResponse(_response){
                return _response.text == response.text;
            }
        });

        statement.tags.forEach((tag) => {
            if( false === tag._stored )
                tagsWillStore.push(tag.serializeToDB());
        });

        if( responsesWillStore.length )
            await knex('responses').insert(responsesWillStore);

        if( responseDuplicated.length )
            await knex('responses').where('id', responseDuplicated).increment('occurence', 1);
        
        if( tagsWillStore.length )
            await SqlStorage._insertTags(tagsWillStore, statement);

        return statement;
    }

    /**
     * Insert tags intro the storage.
     * @param {Array} tags 
     * @param {Statement} statement 
     */
    static async _insertTags(tags, statement){

        for (let i = 0; i < tags.length; i++) {
            let tag = tags[i];
            let foundTag = await knex('tags').where('text', tag.text).first();
            let lastInsert;

            if( typeof foundTag === 'undefined' ){
                let tagsQuery = await knex('tags').insert(tags[i]);
                lastInsert = await knex.select(knex.raw('last_insert_rowid() as id')).first();
            } else {
                lastInsert = foundTag;
            }

            let foundRelation = await knex('tags_relation').where({
                statement_id: statement.id,
                tag_id: lastInsert.id
            });

            if( foundRelation.length === 0 ) {
                await knex('tags_relation').insert({
                    statement_id: statement.id,
                    tag_id: lastInsert.id
                });
            }
        }
    }

    /**
     * Find statement in the database.
     * @static
     * @async
     * @param  {Statement|String|Numeric} statement - 
     * @return {Statement} statement  
     */
    static async findStatement(statement){
        statement = Statement.toModel(statement);
        return knex('statements').where('text', statement.text).orWhere('id', statement.id).first();
    }

    /**
     * Find all statements of given tag.
     * @static
     * @async
     * @param  {Tag|String|Integer} tag - 
     * @return {Promise}
     */
    static async findStatementsByTag(tag){
        tag = Tag.toModel(tag);

        const foundTags = await knex('tags').where('text', tag.text);
        const foundTagsIds = foundTags.map((tag) => tag.id);

        const tagsRelation = await knex('tags_relation').whereIn('tag_id', foundTagsIds);
        const statementsIds = tagsRelation.map((tagRelation) => tagRelation.statement_id);

        const statements = await knex('statements').whereIn('id', statementsIds);
 
        return statements;
    }

    /**
     * Find all responses by statement.
     * @async 
     * @static
     * @param  {Statement|String|Number} statement 
     * @return {Promise} - Responses of statement.
     */
    static async findResponsesByStatement(statement){
        statement = Statement.toModel(statement);
        
        // Try get statement ID by statement text.
        if( ! statement.id && statement.text ){
            let queriedStatement = await knex('statements').where('text', statement.text).first();
            statement.id = queriedStatement.id || statement.id;
        }

        if( statement.id )
            return await knex('responses').where('respond_to', statement.id);
    }

    /**
     * Find all tags of given statement.
     * @async
     * @static
     * @param  {Statement} statement 
     * @return {Array} - Tags of statement.
     */
    static async findTagsByStatement(statement){
        statement = Statement.toModel(statement);

        if( ! statement.id && statement.text ){
            let queriedStatement = await knex('statements').where('text', statement.text);
            statement.id = (queriedStatement.length) ? queriedStatement[0].id : statement.id;
        }

        if( statement.id ){
            let tags = [];
            let tagsRelation = await knex('tags_relation').where('statement_id', statement.id);

            for (let i = 0; i < tagsRelation.length; i++) {
                const tagRelation = tagsRelation[i];
                const tag = await knex('tags').where('id', tagRelation.tag_id).first();

                tags.push(tag);
            }
            return tags;
        }
        return [];
    }

    /**
     * Get random statement from the storage.
     * @static
     * @async
     * @param {String} category 
     * @return {Statement} - Random statement. 
     */
    static async getRandomStatement(category){
        let statements = await knex('statements').count('id as count').first();

        let randomStatement = await knex('statements')
            .where({id: getRandomInt(1, statements.count)}).first();

        return randomStatement;
    }
 
}

module.exports = SqlStorage;