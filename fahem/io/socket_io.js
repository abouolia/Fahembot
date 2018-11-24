const IOAdapter = require('./io_adapter');
const express = require('express');
const socket = require('socket.io');
const {asyncForEach} = require('../utils');

class SocketAdapter extends IOAdapter{
    
    /**
     * Constructor method.
     * @constructor
     */
    constructor(){
        super();

        this.app = express();
        this.server = this.app.listen(7000);

        this.io = socket(this.server);
    }

    /**
     * Socket events namespaces.
     * @static
     * @return {Object}
     */
    static get SOCKET_TYPES(){
        return {
            MESSAGE_REPLY: 'MESSAGE_REPLY',
            RECEIVE_MESSAGE: 'RECEIVE_MESSAGE',
            MESSAGE_TYPING: 'MESSAGE_TYPING'
        };
    }

    /**
     * Called when the chatbot activity is start.
     * @async
     * @param {Array} responses 
     */
    async onStart(responses){
        const {RECEIVE_MESSAGE} = SocketAdapter.SOCKET_TYPES;

        this.io.on('connection', async (socket) => {
            console.log('A user connected.');

            await asyncForEach(responses, async (response) => {
                await this.output(response, socket);
            });
            
            socket.on(RECEIVE_MESSAGE, async (message) => {
                let responses = await this.fahem.getResponse(message);

                await asyncForEach(responses, async (response) => {
                    await this.output(response, socket);
                });
            });

            socket.on('disconnect', async (socket) => {
                await this.fahem.stop();
                console.log('A user disconnected.');
            });
        });
        
        console.log('Chatbot initialized.');
    }

    /**
     * Push the response to the socket channel.
     * @async
     * @param {Response} response 
     */
    async output(response, socket){
        const {MESSAGE_TYPING, MESSAGE_REPLY} = SocketAdapter.SOCKET_TYPES;

        // Remove any option that has no keyword string.
        const options = response.options.filter(option =>
            option.keyword.trim().length !== 0);

        let emit = (response) => {
            socket.emit(MESSAGE_REPLY, {
                text: response.text,
                type: response.type,
                options: options,
                optionsType: response.optionsType
            });
        };

        if(response.threshold > 0){
            socket.emit(MESSAGE_TYPING);

            await this.timer(response.threshold);
            emit(response);
        } else {
            await this.timer(response.threshold);
            emit(response);
        }
    }
}

module.exports = SocketAdapter;