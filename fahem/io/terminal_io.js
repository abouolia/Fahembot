const Response = require('../models/response');
const loading = require('loading-cli');
const IOAdapter = require('./io_adapter');
const readline = require('readline');
const commander = require('commander');
const CorpusTrainer = require('../trainers/corpus_trainer');
const {asyncForEach} = require('../utils');

class TerminalIO extends IOAdapter{

    /**
     * Constructor method.
     * @param {Fahem} fahem 
     */
    constructor(fahem){
        super(fahem);

        this.rl = null;
        this.interval = 200;
    }
    
    /**
     * Called when the chatbot activity is start.
     * @async
     * @param {Array} responses 
     */
    async onStart(responses){
        commander
            .version('0.0.1')
            .usage('[options]')
            .option("-t, --train [files]", "Train the chatbot on corpus files.")
            .option('-r, --run', 'Run the chatbot dialog.')
            .parse(process.argv);

        if( commander.train ){
            const files = [commander.train];
            const corpusTrainer = new CorpusTrainer(this.fahem);

            const train = async () => {
                await corpusTrainer.train(files);
            };

            console.log("Training is started");
            
            train(commander.train).then(() => {
                console.log("Training is completed...");
            });
        } else {
            await this.run(responses);
        }
    }
    
    /**
     * Run the command line interface and listen to termainl line.
     * @async
     * @param {Array} responses 
     */
    async run(responses){
        let rl = this.rl;
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '> '
        });
    
        await asyncForEach(responses, async (response) => {
            await this.output(response);
        });

        rl.prompt();

        rl.on('line', async (line) => {
            let input = line.trim();
            let responses = await this.fahem.getResponse(input);

            await asyncForEach(responses, async (response) => {
                response = this.parseResponseMultilines(response);
                await this.output(response);
            });
            rl.prompt();
        });

        rl.on('close', () => {
            process.exit(0);
        });
    }
    
    /**
     * Outputs the result to the terminal.
     * @param {Response} response 
     */
    async output(response){
        response.text = '< ' + response.text;

        if( response.threshold > 0 ){
            let load = loading({
                frames: ['.', '..', '...', ''],
                interval: this.interval
            }).start();

            await this.timer(response.threshold);
            load.stop(); 
            console.log(response.text);
        } else {
            await this.timer(response.threshold);
            console.log(response.text);
        }
    }

    /**
     * Parse response that has multi-lines text.
     * @param {Response} response 
     * @return {Response}
     */
    parseResponseMultilines(response){

        if( response.type === Response.TYPES.OPTIONS &&
            Array.isArray(response.text) ){
            response.text = response.text.join(', ');
        }

        return response;
    }
}

module.exports = TerminalIO;