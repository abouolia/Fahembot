
/**
 * Registry class for storing a collection of data.
 */
class RegistryAdapter{

    /**
     * Constructor method.
     * @constructor
     * @param {Object} adapter 
     */
    constructor(adapter){
        this.collection = {};
        this.adapter = adapter;
    }

    /**
     * Register an object.
     * @param {Object} adapterClass
     */
    register(adapterClass){
        this.validateAdapterObject(adapterClass);
        
        if( ! this.exists(adapterClass) )
            this.collection[adapterClass.name] = adapterClass;
    }

    /**
     * Unregister an object.
     * @param {Object} adapterObject 
     */
    unregister(adapterObject){
        this.validateAdapterObject(adapterObject);

        if( this.exists(adapterObject) ){
            delete this.collection[adapterObject.name];
        }
    }

    /**
     * Check if an object exist.
     * @return {Boolean}
     */
    exists(adapterObject){
        if( 'undefined' === typeof this.collection[adapterObject.name] )
            return false;

        return true;
    }

    /**
     * Gets adapter object.
     * @param {String} adapterName 
     */
    getAdapter(adapterName){
        if( this.collection[adapterName] )
            return this.collection[adapterName];

        return false;
    }
    
    /**
     * Get all collection data.
     * @return {Array}
     */
    getCollection(){
        return this.collection;
    }
    
    /**
     * Validate input object is extended from adapter class.
     * @param {Object} adapterObject 
     */
    validateAdapterObject(adapterObject){
        if( false === adapterObject.prototype instanceof this.adapter )
            throw new Error('Registered object is not extended from adapter class.');
    }

    /**
     * Instances of the object.
     * @return {Array}
     */
    static get instances(){
        return [];
    }

    /**
     * Return the instance.
     * @param {String} name - Name of instance.
     * @param {Object} adapter - Super-class.
     */
    static instance(name, adapter){
        if( ! RegistryAdapter.instances[name] )
            return RegistryAdapter.instances[name] = new this(adapter);

        return RegistryAdapter.instances[name];
    }
}

module.exports = RegistryAdapter;