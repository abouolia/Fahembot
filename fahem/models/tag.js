const Model = require('./model');

class Tag extends Model{

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
        }, args);

        this.id = args.id; 
        this.text = args.text.toLowerCase();
        this.statements = [];

        this.fields = ['text'];
    }

    /**
     * Add tag to statement model.
     * @param {Tag} tag 
     */
    addTag(tag){
        if(false === tag instanceof Tag)
            throw new Error( sprintf('A %s is not instance of Tag object.', typeof tag) );
        
        tag._stored = false;
        this.tags.push(tag);
    }

    /** ------------ STATIC METHODS ------------ */

    /**
     * Convert the input to a Statement object.
     * @param  {Tag|String|Number} input - 
     * @return {Tag} 
     */
    static toModel(input){
        return Model.toModel(input, Tag);
    }
}

module.exports = Tag;