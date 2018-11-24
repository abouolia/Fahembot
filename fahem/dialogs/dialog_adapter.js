const Levenshtein = require('../comparison/levenshtein');
const {getRandomInt} = require('../utils');

class DialogAdapter{
    
    /**
     * Constructor method.
     * @param {Fahem} fahem - 
     */
    constructor(fahem){
        this.fahem = fahem;
        this.classifier;
    }

    /**
     * Called after the chatbot activity is start.
     * @async
     * @return {Array|Response}
     */
    async onStart(){
        return [];
    }
    
    /**
     * Called after the user entered a new statement.
     * @async
     * @param  {String} inputStatement - Input statement.
     * @return {Array|Response}
     */
    async onRun(){
        return [];
    }

    /**
     * Called after the user leave the session.
     * @async
     */
    async onStop(){}
    
    /**
     * Compare two statements using Levenshtein distance.
     * @param  {String} inputStatement 
     * @param  {Statement} statement 
     * @return {Number}
     */
    compareStatements(inputStatement, statement){
        let levenshtein = new Levenshtein(inputStatement, statement)
        
        return levenshtein.ratio();
    }

    /**
     * Compare the input option and target option using Levenshtein distance.
     * @param {String} inputOption 
     * @param {String} targetOption 
     */
    compareOptions(inputOption, targetOption){
        let levenshtein = new Levenshtein(inputOption, targetOption)
        
        return levenshtein.ratio();
    }

    /**
     * Select the response that has the most occurance value.
     * @param  {Array} responsesList 
     * @return {Response}
     */
    selectResponse(responsesList){
        return this.selectRandomResponse(responsesList);
    }

    /**
     * Select the response that has the most occurance value.
     * @param  {Array} responsesList 
     * @return {Response}
     */
    selectMostOccurenceResponse(responsesList){
        let result = null;

        if( responsesList && responsesList.length ){
            let maxOccurence = -1;
            
            responsesList.forEach((response) => {
                if( maxOccurence < response.occurence ){
                    result = response;
                    maxOccurence = response.occurence;
                }
            });
        }
        return result;
    }
    
    /**
     * Select random response from the list.
     * @param  {Array} responsesList 
     * @return {Response}
     */
    selectRandomResponse(responsesList){
        let count = responsesList.length;
        let randomIndex = getRandomInt(0, (count - 1));

        return responsesList[randomIndex];
    }

    /**
     * Set classifier.
     * @param {Classifier} classifier 
     */
    setClassifier(classifier){
        this.classifier = classifier;
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

module.exports = DialogAdapter;