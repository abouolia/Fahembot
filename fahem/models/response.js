const Model = require('./model');

class Response extends Model{

    /**
     * Constructor method.
     * @constructor 
     * @param {Array} args - 
     */
    constructor(args){
        super();

        args = Object.assign({
            text: '',
            id: 0,
            createdAt: null,
            occurence: 1,
            respondTo: 0,
            threshold: 0
        }, args);

        this.id = args.id;
        this.text = args.text;
        this.createdAt = args.createdAt;
        this.occurence = args.occurence;
        this.respondTo = args.respondTo;
        this.threshold = args.threshold;

        this.confidence = 0;
        this.type = 'plain'; // plain, options.
        this.options = []; 
        this.optionsType = '';
        this.tags = [];

        // The methods that stores to the database.
        this.fields = ['text', 'createdAt', 'occurence', 'respondTo'];
        
        this._stored = false;
    }

    /**
     * Get response types.
     * @static
     */
    static get TYPES(){
        return {
            QUESTION: 'question',
            OPTIONS: 'options',
            OPTION: 'OPTION',
            PLAIN: 'plain'
        };
    }

    /**
     * Serialize response model to an array.
     * @return {Array}
     */
    serialize(){
        let data = {};
        
        data.id = this.id;
        data.text = this.text;
        data.respond_to = this.respondTo;
        data.created_at = this.createdAt;
        data.occurence = this.occurence;

        return data;
    }

    /**
     * Convert the input to a Response object.
     * @param  {Response|String|Number} input
     * @return {Response} 
     */
    static toModel(input){
        return Model.toModel(input, Response);
    }
}

module.exports = Response;