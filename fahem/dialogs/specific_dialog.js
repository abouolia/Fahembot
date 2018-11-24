const DialogAdapter = require('./dialog_adapter');
const Response = require('../models/response');
const Tag = require('../models/tag');
const Statement = require('../models/statement');
const HashTable = require('../utils/hash_table');
const Naivebayes = require('../classification/naive_bayes');
const _ = require('lodash');
class SpecificResponse extends DialogAdapter{

    /**
     * Constructor method.
     * @constructor
     * @param {Fahem} fahem 
     */
    constructor(fahem){
        super(fahem);

        this.events = [];
        this.categories = new HashTable();
        this.responses  = new Proxy([], this.proxyResponsesHandle());;
        
        this.messages = [];
        this.threads  = {};
        this.options  = [];
        
        this._latestResponse;
    }

    /**
     * Listen for the given message.
     * @public
     * @param {String|Array} keywords 
     * @param {Function} callback 
     */
    hears(keywords, callback, config){
        let categories = this.categories;

        if( 'string' === typeof keywords )
            keywords = [keywords];

        if( keywords instanceof RegExp )
            keywords = [keywords];

        config = Object.assign({
            category: [],
        }, config);

        if( ! Array.isArray(config.category))
            config.category = [config.category];

        keywords.forEach((keyword) => {
            let statement = new Statement({text: keyword});
            let event = {statement, callback};
            
            config.category.forEach((category) => {
                let tag = Tag.toModel(category);
                statement.addTag(tag);

                let statementsTag = categories.retrieve(category);

                if( typeof statementsTag === 'undefined' ){
                    categories.insert(category, [event]);
                } else {
                    statementsTag.push(event);
                    categories.insert(category, statementsTag);
                }
            });

            this.events.push(event);
        });
    }

    /**
     * Reply to a user with the given message.
     * @public
     * @param {String} text 
     */
    reply(text, config){
        config = Object.assign({
            threshold: 0
        }, config)

        let response = new Response({
            text: text,
            threshold: config.threshold
        });

        this.responses.push(response);
    }

    /**
     * Add message or reply.
     * @public
     * @param {String|Object} message 
     * @param {String} context 
     */
    addMessage(message, context){
        let messages = this.messages;
        let threads = this.threads;

        if( 'string' === typeof message )
            message = {text: message};
        
        message = Object.assign({
            text: '', action: '', threshold: 0
        }, message);

        if( ! message.response ){
            message.response = new Response({text: message.text});
            message.response.threshold = message.threshold;
        }

        if( 'undefined' === typeof context ){
            this.responses.push(message.response);
            return;
        }

        message.response.context = context;

        if( messages[context] ){
            messages[context] = [messages[context], message.response];
        } else {
            messages[context] = message.response;
        }

        if( ! threads[context] )
            threads[context] = [];
        
        if( message.action && ! threads[context] )
            threads[message.action] = [];

        if( threads[context] && threads[context].indexOf(message.action) === -1 ){

            if( message.action )
                threads[context].push(message.action);
        }
    }

    /**
     * Walk to the given thread of messages.
     * @public
     * @param {String} context - Context of the message.
     */
    gotoThread(context){
        let threads = this.threads;
        let visited = [];
        let output = [], path = [];

        let walk = (from) => {
            if( ! threads[from] ) return;

            path.push(from);

            if( threads[from].length === 0 )
                output = path.slice();

            threads[from].forEach((thread) => {
                if( ! visited[thread] ){
                walk(thread);
                visited[thread] = true;
                }
            });
            path.pop();
        }
        
        walk(context);

        output.forEach((node) => {
           if( this.messages[node] ) 
                this.responses.push(this.messages[node]);
        });
    }

    /**
     * Adds a message as question includes options to capture user option. 
     * @public
     * @param {Object} message 
     * @param {Array} options 
     * @param {String} context 
     */
    ask(message, options, config, context){
        context = _.isString(config) ? config : context;
        config = _.isString(config) ? {} : config;

        config = Object.assign({
            optionsType: 'list',
            threshold: 0
        }, config);

        if( 'string' === typeof message )
            message = {text: message};

        message = Object.assign({
            text: '', action: ''
        }, message);

        message.response = new Response({
            text: message.text,
            threshold: config.threshold
        });
        message.response.type = Response.TYPES.QUESTION;
        message.response.optionsType = config.optionsType;

        options.forEach((option) => {
            option = Object.assign({
                pattern: null,
                keyword: '',
                data: {},
                callback: () => {}
            }, option);

            message.response.options.push(option);
        });

        this.addMessage(message, context);
    }

    /**
     * Repeat the latest response.
     * @public
     */
    repeat(){
        if( this._latestResponse )
            this.responses.push(this._latestResponse);
    }
    
    /**
     * Called after the chatbot activity is start.
     * @async 
     * @protected
     * @return {Array}
     */
    async onStart(){
        let responses = [];

        this.responses.forEach((response) => {
            responses.push(response);

            if( Response.TYPES.QUESTION === response.type )
                this.options = response.options;
        });
        
        // Reset responses stack.
        this.responses.splice(0, this.responses.length);

        return responses;
    }

    /**
     * Called after the user entered a new statement.
     * @async
     * @protected
     * @param  {String} inputStatement - A user input statement.
     * @return {Array}
     */
    async onRun(inputStatement){
        let responses = [];
        let options = this.options;
        
        // Choose matched option from options.
        if( options.length ){
            let matchedOption = this.getMatchedOption(options, inputStatement);
            this.options = [];

            if( matchedOption ){
                await matchedOption.callback.call(this, inputStatement);

                if( responses.length ){
                    this.responses.splice(0, this.responses.length);
                    return responses;
                }
            }
        }

        // Get closest statement from all register statements.
        let event = this.getClosestStatement(inputStatement);
        
        if( event ){
            // Trigger the callback of the closest statement.
            event.callback.call(this, inputStatement);
        }

        this.responses.forEach((response) => {
            this.parseQueuedResponse(response).forEach((response) => {
                response = _.clone(response);
                response.confidence = 1;
                responses.push(response);
            });
        });

        // Reset responses queue.
        this.responses.splice(0, this.responses.length);

        return responses;
    }

    /**
     * Called after stop the user session.
     * @async
     */
    async onStop(){
        this.options = [];
        this._latestResponse = null;
        this.responses.splice(0, this.responses.length);
    }

    /**
     * Get closest statement to input statement from all queued statement.
     * @private
     * @param  {String} inputStatement 
     * @return {Object}
     */
    getClosestStatement(inputStatement){
        let closestStatement;
        let minConfident = SpecificResponse.MINIMUM_CONFIDENT;
        let events = this.events;

        // Get the closest statement for input text.
        events.forEach((event) => {
            let statement = event.statement;
            
            // Compare input statement and target statement.
            let confidence = this.compareStatements(inputStatement, statement.text);

            // Get the statement that has highest confident value.
            if( minConfident < confidence ){
                statement.confidence = confidence;
                closestStatement = Object.create(event);
                closestStatement.statement.confidence = 1;

                minConfident = confidence;
            }
        });

        return closestStatement;
    }

    /**
     * Get matched option from question options.
     * @param {Array} options 
     * @param {String} inputStatement 
     */
    getMatchedOption(options, inputStatement){
        let matchedOption, defaultOption, closestOption;
        let minConfident = SpecificResponse.MINIMUM_OPTIONAL_CONFIDENT;

        let compare = (option, pattern, input) => {
            // Compare option and get closest option that has highest confident value.
            let confidence = this.compareOptions(pattern, input);

            if( minConfident < confidence ){
                closestOption = option;
                minConfident = confidence;
            }
        };
    
        options.forEach((option) => {
            if( option.pattern === null || option.pattern )
                defaultOption = option;

            if( matchedOption ) return;

            if( typeof option.pattern === 'string' )
                compare(option, option.pattern, inputStatement);

            else if( Array.isArray(option.pattern) )
                option.pattern.forEach((pattern) =>
                    compare(option, pattern, inputStatement));

            try{
                let reg = new RegExp(option.pattern);

                if( reg.test(inputStatement) )
                    matchedOption = option;
            } catch(error){
                console.log('Error in the regular expression: ' + option.keyword);
            }
        });

        // Return matched option or closest option, if not found return default option.
        return matchedOption || closestOption || defaultOption;
    }

    /**
     * Parse the queued responses.
     * @param {Response} response 
     * @return {Array}
     */
    parseQueuedResponse(response){
        let responses = [];

        if( Response.TYPES.QUESTION === response.type ){
            responses.push(response);
            this.options = response.options;
        } else {
            responses.push(response);
        }

        return responses;
    }

    /**
     * Responses proxy handler.
     * @return {Object}
     */
    proxyResponsesHandle(){
        return {
            get: (target, prop) => {
                const val = target[prop];
      
                if (typeof val === 'function') {
                  
                    if (['push'].includes(prop) ) {
                        let _this = this;
                        return function(el){
                            _this._latestResponse = el;
                            return Array.prototype[prop].apply(target, arguments);
                        }
                    }
                  
                    return val.bind(target);
                }
              
                return val;
            }
        };
    }
    

    /** ------------- STATIC METHODS ------------- */

    /**
     * minimum confident value to get closest response.
     * @static
     * @return {Numeric}
     */
    static get MINIMUM_CONFIDENT(){
        return 0.88;
    }

    /**
     * Minimum confident value to get cloest option.
     * @static
     * @return {Numeric}
     */
    static get MINIMUM_OPTIONAL_CONFIDENT(){
        return 0.8;
    }
}

module.exports = SpecificResponse;