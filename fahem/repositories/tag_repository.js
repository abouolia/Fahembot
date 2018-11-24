const BaseRepository = require('./base_repository');
const Statement = require('../models/statement');
const Tag = require('../models/tag');


class TagRepository extends BaseRepository{

    /**
     * Constructor method.
     * @param {Tag} tag 
     */
    constructor(tag){
        super();

        if( false === tag instanceof Tag )
            throw new Error('tag argument is not instance of Tag');

        this.tag = tag;
    }

    /**
     * Fetch statements that associated to the tag model.
     * @async
     * @return {Array} - Collection of statements.
     */
    async fetchStatements(){
        return await TagRepository.fetchStatements(this.tag);
    }


    /** ------------ STATIC METHODS ------------ */

    /**
     * Fetch statements that associated to given tag model.
     * @static
     * @async
     * @param  {Tag} tag 
     * @return {Array} - Collection of statements.
     */
    static async fetchStatements(tag){
        tag = Tag.toModel(tag);

        let statementsQuery = await Fahem.storage.findStatementsByTag(tag);

        if( statementsQuery.length ){
            statementsQuery.forEach((statement) => {
                statement = Statement.toModel(statement);
                tag.statements.push(statement);
            });
        }

        return tag.statements;
    }
}

module.exports = TagRepository;