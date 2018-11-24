
/**
 * Abstruct class for all input/output subclasses.
 */
class IOAdapter{

    /**
     * Constructor method.
     */
    constructor(){}
    
    /**
     * Called after the chatbot activity is start.
     */
    onStart(){
        throw new Error('The `onStart` is not implemented by this adapter.');
    }

    /**
     * Convert setTimeout from callback to Promise based.
     * @param {Integer} timestamp 
     */
    timer(timestamp){
        return new Promise((resolve, rejcet) => setTimeout(resolve, timestamp));
    }

    /**
     * Set fahem 
     * @param {Fahem} fahem 
     */
    setFahem(fahem){
        this.fahem = fahem;
    }
}

module.exports = IOAdapter;