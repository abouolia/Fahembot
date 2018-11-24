process.env.NODE_ENV = 'production';

const Fahem = require('../../fahem/fahem');
const SocketAdapter = require('../../fahem/io/socket_io');
const acceptance = require('../../fahem/utterances/acceptance');
const validate = require("validate.js");
const numToWords = require('../../fahem/utterances/numbers');

const db = require('knex')({
    client: 'mysql',
    version: '5.7',
    connection: {
        host : '127.0.0.1',
        user : 'root',
        password : 'root',
        database : 'chatbot_pizza'
    }
});

// Initialize Fahem Chatbot.
let fahem = new Fahem({
    io: new SocketAdapter
});

// Get specific response dialog.
let sr = fahem.dialogs.get('SpecificResponse');

let data = {};

sr.reply("Hello there! Welcome to our pizza store.", {threshold: 2000});


/** -- Select pizza kind -------------------------------- */

sr.ask('What kind of pizza do you want?', [
    {
        keyword: '1. Veg. Pizza',
        pattern: /veg|vegetable/,
        callback: () => {
            sr.gotoThread('veg_pizza_list');
        }
    },
    {
        keyword: '2. Non-Veg. Pizza',
        pattern: /none|non|non\-veg|without/,
        callback: () => {
            sr.gotoThread('veg_pizza_list');
        }
    },
    {
        default: true,
        callback: () => {
            sr.repeat();
        }
    }
], {optionsType: 'list', threshold: 1000});

sr.ask('Pick one', [
    {
        keyword: 'Extravaganza',
        pattern: 'extravaganza',
        data: {
            attachment: 'http://localhost/pizza/Cloud9.jpg',
            description: 'Black Olives, Onion, Crisp Capsicum, Mushroom, FreshTomato, Golden Corn, Jalapeno & Extra Cheese',
        },
        callback: () => {
            sr.reply('You choose Extravaganza pizza', {threshold: 500});
            data.pizza = 'extravaganza';
            sr.gotoThread('how_large');
        }
    },
    {
        keyword: 'Cloud 9',
        pattern: 'cloud 9',
        data: {
            attachment: 'http://localhost/pizza/Cloud9.jpg',
            description: 'Onion, Tomato, Babycorn, Paneer, Crisp Capsicum & Jalapeno',
        },
        callback: () => {
            sr.reply('You choose Cloud 9 pizza', {threshold: 500});
            data.pizza = 'cloud-9';
            sr.gotoThread('how_large');
        }
    },
    {
        keyword: 'Roman',
        pattern: 'roman',
        data: {
            attachment: 'http://localhost/pizza/Cloud9.jpg',
            description: 'Roman Veg Supreme'
        },
        callback: () => {
            sr.reply('You choose Roman pizza', {threshold: 500});
            data.pizza = 'roman';
            sr.gotoThread('how_large')
        }
    },
    {
        keyword: 'Veggie Paradise',
        pattern: 'veggie paradise',
        data: {
            attachment: 'http://localhost/pizza/Cloud9.jpg',
            description: 'Babycorn, Black Olives, Crisp Capsicum & Red Paprika'
        },
        callback: () => {
            sr.reply('You choose Veggie Paradise pizza', {threshold: 500});
            data.pizza = 'veggie-paradise';
            sr.gotoThread('how_large')
        }
    },
    {
        default: true,
        callback: () => {
            sr.repeat();
        }
    }
], {optionsType: 'cards', threshold: 1000}, 'veg_pizza_list');


/** -- Select large of pizza -------------------------------- */

sr.ask('How large?', [
    {
        keyword: '1. Regular',
        pattern: 'regular',
        callback: () => {
            sr.reply('Cool!, regular one.', {threshold: 500});
            data.size = 'regular';
            sr.gotoThread('more_cheese');
        }
    },
    {
        keyword: '2. Medium',
        pattern: 'medium',
        callback: () => {
            sr.reply('Cool!, medium one.', {threshold: 500});
            data.size = 'medium';
            sr.gotoThread('more_cheese');
        }
    },
    {
        keyword: '3. Large',
        pattern: 'large',
        callback: () => {
            sr.reply('Cool!, large one.', {threshold: 500});
            data.size = 'large';
            sr.gotoThread('more_cheese');
        }
    },
    {
        default: true,
        callback: () => {
            sr.repeat();
        }
    }
], {threshold: 1000}, 'how_large');

/** -- Customize the pizza -------------------------------- */

sr.ask('Do you want to more cheese?', [
    {
        keyword: 'Yes',
        pattern: new RegExp(acceptance.yes.join('|'), 'gi'),
        callback: () => {
            sr.reply('Cool!, Mooooore cheese!', {threshold: 500});
            data.extra_cheese = true;
            sr.gotoThread('how_many');
        }
    },
    {
        keyword: 'No',
        pattern: new RegExp(acceptance.no.join('|'), 'gi'),
        callback: () => {
            sr.reply('Cool!', {threshold: 500});
            data.extra_cheese = false;
            sr.gotoThread('how_many');
        }
    },
    {
        default: true,
        callback: () => {
            sr.repeat();
        }
    }
], {threshold: 1000}, 'more_cheese');


/** -- Quentity of pizza -------------------------------- */

sr.ask('How many do you want?', [
    {
        callback: (response) => {
            let count = parseInt(response);

            if( count <= 0 ){
                sr.reply('Please enter numeric value.', {threshold: 500});
                sr.repeat();
            } else {
                let numberInWords = numToWords(count);
                data.quentity = count;
                sr.reply('Ok!!, '+ numberInWords +' pizza.');
                sr.gotoThread('user_info');
            }
        }
    },
], {threshold: 1000}, 'how_many');

sr.addMessage({
    text: 'Got it. Let me just take your information',
    action: 'user_info_name',
    threshold: 1500
}, 'user_info');


/** -- Personal information -------------------------------- */

sr.ask('Your full name', [
    {
        callback: (response) => {
            let match = response.match(/([a-z])\w+/gi);

            if( match.length < 2 ){
                sr.reply('Please give a valid full name. e.g. Ahmed Bouhuolia');
                sr.gotoThread('user_info_name');
            } else {
                let user_name = captialize(response);
                sr.reply('Done!, ' + user_name);
                data.user_name = user_name;
                sr.gotoThread('user_info_mobile');
            }
        }
    }
], {threshold: 1000}, 'user_info_name');

sr.ask('Your mobile number please.', [
    {
        callback: (response) => {

            if( ! validateMobileNumber(response) ) {
                sr.reply('Please give a valid phone number. e.g.. 9876543210', {threshold: 1000});
                sr.gotoThread('user_info_mobile');
            } else {
                sr.reply('Your mobile number is ' + response, {threshold: 500});
                data.mobile_number = response;
                sr.gotoThread('user_mobile_config');
            }
        }
    },
], {threshold: 1000}, 'user_info_mobile');

sr.ask('Is that right?', [
    {
        keyword: 'Yes',
        pattern: new RegExp(acceptance.yes.join('|'), 'gi'),
        callback: () => {
            sr.reply('Cool!', {threshold: 500});
            sr.gotoThread('user_address');
        }
    },
    {
        keyword: 'No',
        pattern: new RegExp(acceptance.no.join('|'), 'gi'),
        callback: () => {
            sr.gotoThread('user_info_mobile')
        }
    }
], {threshold: 750}, 'user_mobile_config');


sr.ask('Finally, Your delivery address, please!', [
    {
        default: true,
        callback: (response) => {
            sr.reply('Your address ' + response);
            data.address = response;
            sr.gotoThread('user_address_confirm');
        }
    }
], {threshold: 500}, 'user_address');

/** -- Order Done -------------------------------- */

sr.ask('Is that right?', [
    {
        keyword: 'Yes',
        pattern: new RegExp(acceptance.yes.join('|'), 'gi'),
        callback: async () => {
            sr.reply('Awesome. Your order is placed', {threshold: 1000});
            sr.reply('Your order #1', {threshold: 1000});
            sr.reply('We will call you when the order is ready.', {threshold: 1000});
            
            await saveOrder(data);
            console.log(data);
        }
    },
    {
        keyword: 'No',
        pattern: new RegExp(acceptance.no.join('|'), 'gi'),
        callback: () => {
            data.address = '';
            sr.gotoThread('user_address_again');
        }
    }
], {threshold: 1000}, 'user_address_confirm');

// Start the engine.
fahem.start();


async function saveOrder(data){

    await db('orders').insert({
        full_name: data.user_name,
        mobile_number: data.mobile_number,
        quentity: data.quentity,
        address: data.address,
        pizza: data.pizza,
        pizza_size: data.size,
        extra_cheese: data.extra_cheese
    });
}

function captialize(text){
    return text.replace(/\b\w/g, function(l){ return l.toUpperCase() })
}

function validateMobileNumber(response){
    let phone_pattern = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    let match = response.match(phone_pattern);

    return ( match === null ) ? false : true;
}