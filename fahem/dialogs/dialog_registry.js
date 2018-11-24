const Multiton = require('../multiton');
const DialogAdapter = require('./dialog_adapter');
const Response = require('../models/response');
const Statement = require('../models/statement');
const BayesClassifier = require('../classification/naive_bayes');
const {asyncForIn} = require('../utils');
const _ = require('lodash');


class DialogRegistry extends Multiton{

    /**
     * Constructor method.
     * @constructor
     */
    constructor(adapter, fahem){
        super(adapter);
        this.fahem = fahem;
        this.classifier = new BayesClassifier();
    }
    
    /**
     * Called after the chatbot activity is start.
     * @async
     * @return {Array} - Responses
     */
    async onStart(){
        let dialogResults = []

        // Collect all responses from dialog adapters.
        await asyncForIn(this.instances, async (dialogInstance) => {
            dialogInstance.setClassifier(this.classifier);
            
            const dialogResult = await dialogInstance.onStart();

            if( dialogResult )
                dialogResults.push(dialogResult);
        });

        // Compute Naive Bayes probabilities.
        this.classifier.train();

        // Parse response from dialogs results.
        let responses = this.getResponsesFromDialogs(dialogResults);

        // Flattens responses to a single level deep.
        responses = _.flatten(responses);

        return Array.isArray(responses) ? responses : [responses];
    }
    
    /**
     * Called after the user entered a new statement.
     * @async
     * @param  {String} inputStatement - A user input statement.
     * @return {Array} - responses  
     */
    async onRun(inputStatement){
        let dialogResults = [];
        
        // Collect all responses from dialog adapter instances.
        await asyncForIn(this.instances, async (dialogInstance) => {
            const dialogResult = await dialogInstance.onRun(inputStatement);
            
            if( dialogResult )
                dialogResults.push(dialogResult);
        });
        
        // Get responses from dialogs results.
        let responses = this.getResponsesFromDialogs(dialogResults);

        // Get the most occurance respones.
        let result = this.getHighestConfidenceResponse(responses);

        return Array.isArray(result) ? result : [result];
    }

    /**
     * Called after the user leaved the session.
     * @async
     */
    async onStop(){

        // Run stop for each registered dialog instance.
        await asyncForIn(this.instances, async (dialogInstance) => {
            await dialogInstance.onStop();
        });
    }
    
    /**
     * Get responess from dialogs results.
     * @param  {Array} dialogs 
     * @return {Array}
     */
    getResponsesFromDialogs(dialogs){
        let responses = [];

        dialogs.forEach((dialogResult) => {

            if( ! Array.isArray(dialogResult) &&
                false == dialogResult instanceof Response &&
                false == dialogResult instanceof Statement )
                return;

            if( Array.isArray(dialogResult) && dialogResult.length === 0 )
                return;

            responses.push(dialogResult);
        });
        return responses;
    }
    
    /**
     * Get the respones that has highest confidence value from responses list.
     * @param {Array} responses 
     * @return {Response|Array}
     */
    getHighestConfidenceResponse(responses){
        let result;
        let maxConfident = -1;

        // Get the result that has the highest occurence from its dialog adapter.
        responses.forEach((response) => {
            let _response = Array.isArray(response) ? response[0] : response;

            if( maxConfident < _response.confidence ){
                result = response;
                maxConfident = _response.confidence;
            }
        });
        return result;
    }

    /**
     * Return the instance.
     * @param {Fahem} fahem 
     */
    static instance(fahem){
        if( ! DialogRegistry._instance ){
            return DialogRegistry._instance = new this(DialogAdapter, fahem);
        }
        return DialogRegistry._instance;
    }
}

module.exports = DialogRegistry;