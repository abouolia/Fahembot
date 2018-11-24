
class Multiton{

    /**
     * Constructor method.
     * @constructor
     */
    constructor(){
        this.instances = {};
    }

    /**
     * Add class instance to multiton collection.
     * @param {Object} classInstance 
     */
    add(classInstance){
        let className = classInstance.__proto__.constructor.name;

        if( ! this.exists(className) )
            this.instances[className] = classInstance;
    }

    /**
     * Remove class instance from multiton collection.
     * @param {String} className 
     */
    remove(className){
        
        if( this.exists(className) )
            delete this.instances[className];
    }

    /**
     * Detarmine wether the object exist.
     * @param {String} className 
     */
    exists(className){
        return this.instances[className] ? true : false;
    }

    /**
     * Get class instance by class name
     * @param {*} classInstance 
     */
    get(className){
        
        if( this.exists(className) )
            return this.instances[className];

        return null;
    }
}

module.exports = Multiton;