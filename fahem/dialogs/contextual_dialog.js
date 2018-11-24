const DialogAdapter = require('./dialog_adapter');
const Statement = require('../models/statement');
const StatementRepository = require('../repositories/statement_repository');
const Tag = require('../models/tag');
const TagRespository = require('../repositories/tag_repository');
const {asyncForIn, asyncForEach} = require('../utils');
class ContextualDialog extends DialogAdapter{
    
    /**
     * Constructor method.
     * @constructor
     */
    constructor(fahem){
        super(fahem);
    }

    /**
     * Called after the chatbot activity is start.
     * @async 
     * @return {Object}
     */
    async onStart(){
        const statements = await StatementRepository.all();

        await asyncForIn(statements, async (statement) => {

            // Initializing the repository.
            let statementRepository = new StatementRepository(statement);

            // Fetch the tags of statement from the repository.
            await statementRepository.fetchTags();

            statement.tags.forEach((tag) => {
                this.classifier.addDocument(statement.text, tag.text)
            });
        });
    }
    
    /**
     * Called after the user entered a new statement.
     * @async
     * @param  {String} inputStatement - Input statement.
     * @return {Object}
     */
    async onRun(inputStatement){
        let statements = [];
        let minConfident = ContextualDialog.MIN_CONFIDENT;
        let closestStatement;
        let result;

        // Calculate classification of input statement.
        const classifications = this.classifier.getClassifications(inputStatement);
    
        await asyncForEach(classifications, async (classification) => {
            let category = classification.label;
            let probability = classification.value;
            let tag = Tag.toModel(category);

            // Can't continue if probability of this category less than zero.
            if( probability <= 0 ) return; 

            // Initializing tag repository.
            let tagRespository = new TagRespository(tag);

            // Statements that belongs to the tag.
            const statementsTag = await tagRespository.fetchStatements();
            
            statementsTag.forEach((statement, index) => {
                statements.push(statement)
            });
        });
    
        statements.forEach((statement) => {
            let confidence = this.compareStatements(inputStatement, statement.text);

            // Get the statement that has highest confidence value.
            if( minConfident < confidence ){
                statement.confidence = confidence;
                closestStatement = statement;
                
                minConfident = confidence;
            }
        });

        // Return random statement if there's no closest statement for input statement.
        if( this.fahem.config.randomStatement ){
            result = await StatementRepository.getRandom();
            result.confidence = 1;
        }

        if( closestStatement ){
            // Initializing closest statement repository.
            let statementRepository = new StatementRepository(closestStatement);

            // Fetch statement responses from the storage.
            let responses = await statementRepository.fetchResponses();            
            
            responses.forEach((response) => {
                response.confidence = minConfident;
            });

            // Select one response from responses list.
            result = this.selectResponse(responses);   
        }
        
        return result;
    }

    /** ------------- STATIC METHODS ------------- */
    
    /**
     * Minimum confident to return response.
     * @static
     * @return {Numeric}
     */
    static get MIN_CONFIDENT(){
        return 0;
    }
}

module.exports = ContextualDialog;