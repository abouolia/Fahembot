const DialogAdapter = require('./dialog_adapter');
const math = require('mathjs');
const Response = require('../models/response');


class MathematicalDialog extends DialogAdapter{

    /**
     * Called after the user entered a new statement.
     * @async
     * @param  {String} inputStatement - A user input statement
     * @return {Object}
     */
    async onRun(inputStatement){
        let result;

        try{
            result = math.eval(inputStatement);

            if( result === parseInt(inputStatement) )
                throw new Error;

            if( result === parseFloat(inputStatement) )
                throw new Error;
            
            if( typeof result === 'undefined' || result == null )
                throw new Error;

            let response = new Response({
                text: 'Equals: ' + result
            });

            response.confidence = 100;
            result = response;
        } catch(error){}
        
        return result;
    }
}

module.exports = MathematicalDialog;