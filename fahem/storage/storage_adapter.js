

class StorageAdapter{

    /**
     * Constructor method.
     * @constructor
     */
    constructor(){}

    /**
     * Update statement model to the database.
     */
    static update(){
        throw new Error('The `update` is not implemented by this adapter.');
    }
    
    /**
     * Find statement in the database.
     */
    static findStatement(){
        throw new Error('The `findStatement` is not implemented by this adapter.');
    }

    /**
     * Find all responses by statement.
     */
    static findResponsesByStatement(){
        throw new Error('The `findResponsesByStatement` is not implmeneted by this adapter.');
    }

    /**
     * Find all tags of given statement.
     */
    static findTagsByStatement(){
        throw new Error('The `findTagsByStatement` is not implmeneted by this adapter.');
    }

    /**
     * Find all statements of given tag.
     */
    static findStatementsByTag(){
        throw new Error('The `findStatementsByTag` is not implmeneted by this adapter.');
    }

    /**
     * Get random statement from the storage.
     */
    static getRandomStatement(){
        throw new Error('The `getRandomStatement` is not implemented by this adapter.');
    }
}

module.exports = StorageAdapter;