const isPlainObject = require('lodash.isplainobject');
const _ = require('lodash');

class Model{
    
    /**
     * Constructor method.
     * @constructor
     */
    constructor(){
        this.id = 0;
        this.fields = [];
    }

    /**
     * Convert the input to the given model object.
     * @static
     * @param  {Model|String|Numeric} input
     * @param  {object} model -  
     * @return {Statement}
     */
    static toModel(input, ModelObject){
        ModelObject = ModelObject || Model;
        
		let model = new ModelObject;
		model.text = '';
		model.id = 0;

		if( isPlainObject(input) ){
			for( let prop in input ){
				if( ! input.hasOwnProperty(prop) ) continue;
				model[prop] = input[prop];
			}
		} else {
			if( input instanceof ModelObject )
				model = input;

            else if( 'string' === typeof input )
                model.text = input;

			else if( 'number' === typeof input )
				model.id = input;	
		}
		
		return model;
    }

    /**
     * Serialize a model as a plain object to the database.
     * @return {Array}
     */
    serializeToDB(){
        let data = {};

        this.fields.forEach((item) => {
            if( 'undefined' !== typeof this[item] )
                data[_.snakeCase(item)] = this[item];
        });

        return data;
    }
}

module.exports = Model;