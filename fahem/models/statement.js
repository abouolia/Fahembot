const Response = require('./response');
const Tag = require('./tag');
const Model = require('./model');
const sprintf = require("sprintf-js").sprintf;

class Statement extends Model{

    /**
     * Constructor method.
     * @constructor 
     * @param {Array} args 
     */
    constructor(args){
        super();
        
        args = Object.assign({
            text: '',
            id: 0,
            responses: [],
            tags: [],
            createdAt: null,
        }, args);

        this.id = args.id; 
        this.text = args.text;
        this.responses = args.responses;
        this.tags = args.tags;
        this.createdAt = args.createdAt;
        this.confidence = 0;
        this.type = 'plain';

        this._responsesDeleted = [];
        this._tagsDeleted = [];
        
        // The Methods that stores to the database.
        this.fields = ['text', 'createAt'];
    }

    /**
     * Add response to statement model.
     * @param {Response} response - 
     */
    addResponse(response){
        if( false == response instanceof Response )
            throw new Error( sprintf('A %s Is not instace of Response object.', typeof response) );
        
        let updated = false;

        for( let i = 0; i < this.responses.length; i++ ){
            if( this.responses[i].text === response.text ){
                this.responses[i].occurence += 1;
                updated = true;
            }
        }

        if( ! updated ){
            response._stored = false;
            response.respondTo = this.id;
            this.responses.push(response);
        }
    }

    /**
     * Remove response from statement model.
     * @param {Response} response - 
     * @return {Boolean}
     */
    removeResponse(response){
        if( false === response instanceof Response )
            throw new Error( sprintf('A %s Is not instace of Response object.', typeof response) );

        for( let i = 0; i < this.responses.length; i++ ){
            if( this.responses[i].text == response.text ){
                if( this.responses[i].id )
                    this._responsesDeleted.push(this.responses[i].id);
                
                this.responses.splice(i, 1);
                return true;
            }
        }
        
        return true;
    }

    /**
     * Add tag to statement model.
     * @param {Tag} newTag 
     */
    addTag(tag){
        if( false === tag instanceof Tag )
            throw new Error( sprintf('A %s is not instance of Tag object.', typeof tag) );
        
        tag._stored = false;
        this.tags.push(tag);
    }

    /**
     * Serialize statement model to an array.
     * @param  {Boolean} excludeAssigns - Exclude mass assignments from serialization. 
     * @return {Array}
     */
    serialize(excludeAssigns){
        let data = {};

        data.id = this.id;
        data.text = this.text;
        data.created_at = this.createAt;
        data.responses = [];

        this.responses.forEach((response) => {
            data.responses.push(response.serialize());
        });

        data = (excludeAssigns) ? 
            super._excludeAssignsFromSerialize(data) : data; 

        return data;
    }

    /**
     * Convert the input to a Statement object.
     * @param  {Statement|String|Number} input - 
     * @return {Statement} 
     */
    static toModel(input){
        return Model.toModel(input, Statement);
    }
}

module.exports = Statement;