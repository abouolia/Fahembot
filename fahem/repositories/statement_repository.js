const BaseRepository = require('./base_repository');
const Statement = require('../models/statement');
const Tag = require('../models/tag');
const Response = require('../models/response');


class StatementRepository extends BaseRepository{

    /**
     * Constructor method.
     * @param {Statement} statement 
     */
    constructor(statement){
        super();

        if( false === statement instanceof Statement )
            throw new Error('statement argument is not instance of Statement.');

        this.statement = statement;
    }

    /**
     * Save statement model to the database.
     * @async
     */
    async save(){
        return await StatementRepository.save(this.statement);
    }

    /**
     * Fetch all tags that associated to the statement.
     * @async
     * @static
     * @return {Array}
     */
    async fetchTags(){
        return StatementRepository.fetchTags(this.statement);
    }

    /**
     * Fetch responses of this statement.
     * @async
     * @return {Array} 
     */
    async fetchResponses(){
        return await StatementRepository.fetchResponses(this.statement);
    }

    /**
     * Find statement in the storage.
     */
    async find(){
        return StatementRepository.find(this.statement);
    }

    /** ------------ STATIC METHODS ------------ */

    /**
     * Save statement model to the storage.
     * @static
     * @async
     * @param {Statement} statement - 
     */
    static async save(statement){
        return await Fahem.storage.update(statement);
    }

    /**
     * Fetch all statements from the database.
     * @static
     * @return {Array}
     */
    static async all(){
        let statements = [];
        let foundStatements = await knex('statements');

        foundStatements.forEach((statement) => {
            statement = Statement.toModel(statement);
            statements.push(statement);
        });

        return statements;
    }

    /**
     * Fetch responses from database by statement object or ID.
     * @param  {Statement|Integer} statement - 
     * @return {Array}
     */
    static async fetchResponses(statement){
        statement = Statement.toModel(statement);
        let responsesQuery = await Fahem.storage.findResponsesByStatement(statement);
        
        if( responsesQuery.length ){
            responsesQuery.forEach((response) => {
                response = Response.toModel(response);

                if( ! statement.responses.find(findResponse) )
                    statement.responses.push(response);

                function findResponse(_response){
                    return _response.text === response.text;
                }
            });

            return statement.responses;
        }
    }
    
    /**
     * Fetch tags that associated with given statement.
     * @async
     * @param {Statement} statement 
     */
    static async fetchTags(statement){
        statement = Statement.toModel(statement);
        let tagsFound = await Fahem.storage.findTagsByStatement(statement);

        if( tagsFound.length ){
            tagsFound.forEach((tag) => {
                tag = Tag.toModel(tag);

                if( ! statement.tags.find(findTag) )
                    statement.tags.push(tag);

                function findTag(_tag){
                    return _tag.text === tag.text;
                }
            });
        }

        return statement.tags;
    }

    /**
     * Find the given statement.
     * @param  {Statement} Statement - 
     * @return {Statement}
     */
    static async find(statement){
        statement = Statement.toModel(statement);
        let foundStatement = await Fahem.storage.findStatement(statement);

        if( foundStatement ){
            statement = Statement.toModel(foundStatement);
            return statement;
        }
    }

    /**
     * Get random statement from the storage.
     * @async
     * @static
     * @return {Statement}
     */
    static async getRandom(){
        let statement = await Fahem.storage.getRandomStatement();

        if( statement )
            statement = Statement.toModel(statement);

        return statement;
    }
}

module.exports = StatementRepository;