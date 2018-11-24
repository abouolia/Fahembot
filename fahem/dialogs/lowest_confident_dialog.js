const DialogAdapter = require('./dialog_adapter');
const Response = require('../models/response');

class LowestConfidentDialog extends DialogAdapter{

    /**
     * Constructor method.
     * @constructor
     * @param {Fahem} fahem 
     */
    constructor(fahem){
        super(fahem);
    }

    /**
     * Called after the user entered a new statement.
     * @async 
     * @param {String} inputStatement - Input statement
     * @return Object
     */
    async onRun(inputStatement){
        let response = new Response();

        response.text = "I'm sorry, I do not understand.";
        response.threshold = 250;
        response.occurence = 0;

        if( inputStatement.trim().length === 0 )
            response.occurence = 1;
        
        return response;
    }
}


module.exports = LowestConfidentDialog;