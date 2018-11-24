
/**
 * A dictionary/hash map data structure for storing key/value pairs. Finding
 * an entry in a hash table takes O(1) constant time(same for 10 as 1 billion items). Whereas 
 * finding an item via binary search takes time proportional to the logarithm of
 * the item in  the list O(logn). Finding an item in a regular old list takes time proportional to
 * the length of the list O(n). Very slow. Hash Tables = very fast 
 */
class HashTable{

    constructor(max){
        this.max = max || 10000;
        this.storage = [];
    }
    
    /**
     * Create a method that converts any key such as 'alex', 'best hotels', 'google' etc.. and
     * converts it into a 'seemingly' random number.
     * @param {String|Numeric} key 
     */
    createHashIndex(key) {
        var hash = 0;
        for (var i = 0; i < key.length; i++) {
            hash = (hash << 5) - hash + key.charCodeAt(i);
            hash = hash >>> 0; //convert to 32bit unsigned integer
        }
        return Math.abs(hash % this.max);
    }

    /**
     * The insert method will call the CreateHashIndex to encrypt our insertion key and insert its value at
     * this specified index in our storage array (any index from 0 to max)
     * 
     * @param {String|Numeric} key
     * @param {Mixed} value 
     */
    insert(key, value){
        if (key === undefined || value === undefined || key.length === 0 || value.length === 0)
            throw ('Insertion of undefined not possible')
        else {
            var hashIndex = this.createHashIndex(key);
            this.storage[hashIndex] = value;
        }
        return this;
    }
    
    retrieve(key) {
        var hashIndex = this.createHashIndex(key);
        return this.storage[hashIndex] || [];
    }
}

module.exports = HashTable;