const fs = require('fs');
const TrainerAdapter = require('./trainer_adapter');
const ListTrainer = require('./list_trainer');

/**
 * Allow the chatbot to be trained using data from dialog corpus JSON files.
 */
class CorpusTrainer extends TrainerAdapter{
 
    /**
     * Train chatbot based on extrenal corpus files.
     * @async
     * @param Array {corpusPaths} - 
     */
    async train(corpusPaths){
        if( ! corpusPaths.length )
            throw new Error("No corpus files.");

        corpusPaths = corpusPaths.filter(corpuePath => {
            return ( fs.existsSync(corpuePath) );
        });

        for (let i = 0; i < corpusPaths.length; i++) {
            let corpuePath = corpusPaths[i];

            fs.readFile(corpuePath, async (error, data) => {
                let corpusData = JSON.parse(data);

                for( let corpusCategory in corpusData){
                    let corpusCategoryData = corpusData[corpusCategory];
                    let previousStatement = null;

                    for (let x = 0; x < corpusCategoryData.length; x++) {
                        let conversation = corpusCategoryData[x];
                        let listTrainer = new ListTrainer(this.fahem);
                        
                        await listTrainer.train(conversation, corpusCategory);
                    }
                }
            });
        };
    }
}

module.exports = CorpusTrainer;