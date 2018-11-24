const Receivers = require('../receivers');

class TrainerAdapter{

    /**
     * Constructor method.
     * @constructor
     */
    constructor(fahem){
        this.fahem = fahem;
    }

    /**
     * Train method should be override by subclasses.
     * @async
     */
    async train(){
        throw new Error('The `train` is not implemented by this adapter.');
    }

    /**
     * Return input statement after passing on all receivers functions.
     * @param {String} input - A user input statement.
     */
    getReceivedStatement(input){
        this.fahem.receivers.forEach((receiver) => {
            input = Receivers[receiver](input);
        });
    }
}

module.exports = TrainerAdapter;