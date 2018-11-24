'use strict';
const _ = require('lodash');
const {cleanWhitespace, replaceLinebreaksTab, replaceTabs, unescapeHtml,
convertToAscii, convertToLowercase} = require('./receivers');
const StorageAdapter = require('./storage/storage_adapter');
const SqlStorage = require('./storage/sql_storage');
const TrainerAdapter = require('./trainers/trainer_adapter');
const {validateAdapterInstance, validateAdapterClass} = require('./utils');
const IOAdapter = require('./io/io_adapter');
const ListTrainer = require('./trainers/list_trainer');
const DialogsRegistry = require('./dialogs/dialog_registry');
const MathematicalDialog = require('./dialogs/mathematical_dialog');
const ContextualDialog = require('./dialogs/contextual_dialog');
const SpecificResponse = require('./dialogs/specific_dialog');
const LowestConfidentDialog = require('./dialogs/lowest_confident_dialog');
const TimeDialog = require('./dialogs/time_dialog');
const TerminalIO = require('./io/terminal_io');


/**
 * Chatbot Engine.
 * -----------------------------------------
 */
const Fahem = (() => {
    
const VERSION = '0.0.1';

let CONFIG = {
    /**
     * Reply rendom statement when there's no proper answer.
     */
    randomStatement: true
};

let storageAdapter = SqlStorage;

/**
 * Class Definition
 * -----------------------------------------
 */
class Fahem{

    /**
     * Constructor method.
     * @constructor
     * @param {Array} settings 
     */
    constructor(settings){
        this.args = Object.assign({
            receivers: [],
            dialogs: [],
            io: new TerminalIO,
        }, settings);

        this.config = CONFIG;

        this.io = this.args.io;

        this.receivers = [
            cleanWhitespace,
            replaceLinebreaksTab,
            replaceTabs,
            unescapeHtml,
            convertToAscii,
            convertToLowercase
        ];
        
        // Initialize the engine.
        this._initialize();
    }

    /**
     * Fahem chatbot version.
     * @static
     */
    static get VERSION(){
        return VERSION;
    }

    /**
     * Initialize the engine.
     * @private
     */
    _initialize(){
        this.io.setFahem(this);

        this.trainer = new ListTrainer(this);
        this.dialogs = DialogsRegistry.instance(this);

        this.dialogs.add( new LowestConfidentDialog(this) );
        this.dialogs.add( new TimeDialog(this) );
        this.dialogs.add( new MathematicalDialog(this) );
        this.dialogs.add( new ContextualDialog(this) );
        this.dialogs.add( new SpecificResponse(this) );

        this.args.receivers.forEach((receiver) => {
            this.receivers.push(receiver);
        });
    }

    /**
     * Run receivers functions on input statement
     * @private
     * @param  {String} input 
     * @return {String}
     */
    runReceivers(input){

        // Run input statement on receiver functions.
        this.receivers.forEach((receiver) => {
            if( _.isFunction(receiver) )
                input = receiver(input);
        });

        return input;
    }

    /**
     * Start Fahem chatbot.
     * @async 
     */
    async start(){
        // Start dialogs class.
        let responses = await this.dialogs.onStart();
        
        // Start input/output class.
        return await this.io.onStart(responses); 
    }

    /**
     * Stop the user session.
     * @async
     */
    async stop(){
        await this.dialogs.onStop();
    }

    /**
     * Returns response for input statement.
     * @async 
     * @param {String} inputStatement - Input statement.
     */
    async getResponse(inputStatement){
        // Pass the input statement on all registered receivers.
        inputStatement = this.runReceivers(inputStatement);

        return await this.dialogs.onRun(inputStatement);
    }
    
    /**
     * Proxy method to access to trainer's class.
     */
    train(){
        return this.trainer.train;
    }

    /**
     * Getter method for trainer adapter.
     * @return {TrainerAdapter} 
     */
    get trainer(){
        return this.trainerAdapter;
    }

    /**
     * Setter method for trainer adapter.
     * @param {TrainerAdapter} trainerClass - 
     */
    set trainer(trainerClass){
        validateAdapterInstance(trainerClass, TrainerAdapter);
        this.trainerAdapter = trainerClass;
    }

    /**
     * Getter method for SQL storage adapter.
     * @static
     * @return {StorageAdapter}
     */
    static get storage(){
        return storageAdapter;
    }

    /**
     * Setter storage class to Fahem class.
     * @static
     * @param {StorageAdapter} storageClass - 
     */
    static set storage(storageClass){
        validateAdapterClass(storageClass, StorageAdapter);
        storageAdapter = storageClass;
    }

    /**
     * Getter method for input/output adapter.
     * @return {IOAdapter}
     */
    get io(){
        return this.ioAdapter;
    }

    /**
     * Setter method for input/output adapter.
     * @param {IOAdapter} ioClass - 
     */
    set io(ioClass){
        this.ioAdapter = validateAdapterInstance(ioClass, IOAdapter);
    }
}

return Fahem;
})();
global.Fahem = Fahem;

module.exports = Fahem;