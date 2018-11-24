process.env.NODE_ENV = 'development';

const Fahem = require('../../fahem/fahem');
const SocketAdapter = require('../../fahem/io/socket_io');
const acceptance = require('../../fahem/utterances/acceptance');
const validate = require("validate.js");
const crypto = require('crypto');

// Connect to the database.
const db = require('knex')({
    client: 'mysql',
    version: '5.7',
    connection: {
        host : '127.0.0.1',
        user : 'root',
        password : 'root',
        database : 'chatbot_bank'
    }
});

// Initialize Fahem chatbot.
let fahem = new Fahem({
    io: new SocketAdapter
});

// Get specific response dialog.
let sr = fahem.dialogs.get('SpecificResponse');

// Holds the data into conversation.
let data = {newAccount: {}, transaction: {}};


/** ------ WELCOME -------------------------------------- */

sr.reply('Hello! Welcome to Central Bank. ' +
    'Opening your account, making transaction, query your balance and ' + 
    'other services now super easy.', {threshold: 2000});

sr.ask('Do you have an account?', [
    {
        pattern: acceptance.yes,
        callback: (response) => {
            sr.reply("That's greet!", {threshold: 1000});
            sr.gotoThread('account_login:number');
        }
    },
    {
        pattern: acceptance.no,
        callback: (response) => {
            sr.reply('No problem!', {threshold: 1000});
            sr.gotoThread('list:no_account');
        }
    },
    {
        callback: (response) => {
            sr.reply('I can not understand you.', {threshold: 1000});
            sr.gotoThread('do_have_account');
        }
    }
], {threshold: 2000}, 'do_have_account');


sr.gotoThread('do_have_account');

/** ------ MENU -> ACCOUNT -------------------------------------- */

sr.ask('What can I help you today? select from the menu below.', [
    {
        pattern: ['1', 'What the closest ATM', 'closest ATM'],
        keyword: '1. What the closest ATM?',
        callback: (response) => {
            sr.reply('');
            sr.gotoThread('something_else');
        }
    },
    {
        pattern: ['2', 'How much i spent', 'how much i spent in last month'],
        keyword: '2. How much i spent in last month?',
        callback: (response) => {
            sr.reply("Let's see. You spent 1000 DL.");
            sr.gotoThread('something_else');
        }
    },
    {
        pattern: ['3', 'my balance', 'balance'],
        keyword: '3. My balance',
        callback: (response) => {
            sr.reply('Your balance ' + data.account.balance + ' DL', {threshold: 1000});
            sr.gotoThread('something_else');
        }
    },
    {
        pattern: ['4', 'make transaction', 'transaction'],
        keyword: '4. Make transaction',
        callback: (response) => {
            sr.gotoThread('make_transaction:amount');
        }
    },
    {
        pattern: ['5', 'lost my card', 'lost my credit card'],
        keyword: '5. Lost my credit card',
        callback: () => {
            sr.reply("Don't worry. We have an elaborate process for such cases - " + 
                "you request a replacement card which also block your existing card.", {threshold: 2000});
            
            sr.reply('We will contact you as soon as possible', {threshold: 2000});
            sr.gotoThread('something_else');
        }
    }
], {threshold: 1000}, 'list:account');

sr.ask('Please enter the amount that would you like transfer.', [
    {
        callback: (response) => {
            let amount = praseInt(response);

            if( amount <= 0 ){
                sr.reply('Please enter a valid numeric value e.g. 1000 DL.', {threshold: 1000});
                sr.gotoThread('make_transaction:amount');
            } else {
                data.transaction.amount = amount;
                sr.gotoThread('make_transaction:account_number');
            }
        }
    }
], {threshold: 2000}, 'make_transaction:amount')

sr.ask('Please enter account number that you want transfer money to it.', [
    {
        callback: async (response) => {
            let accountNumber = parseInt(response);

            if( response.length < 6 ){
                sr.reply('Please enter valid numeric value. e.g. 123456.');
                sr.gotoThread('make_transaction:acount_number');
            } else {
                let account = await db('accounts').where('id', accountNumber);

                if( account.length === 0 ){
                    sr.reply('The account number is not correct, please make sure and try again.', {threshold: 1000});
                    sr.gotoThread('make_transaction:account_number');
                } else {
                    let transaction = await db('transactions').insert({
                        amount: data.transaction.amount,
                        to_account_id: account[0].id,
                        from_account_id: data.account.id
                    });

                    console.log(transaction);
                }
            }
        }
    }
], {threshold: 1000}, 'make_transaction:acount_number');


/** ------ MENU -> NO ACCOUNT -------------------------------------- */

sr.ask('What can I help you today? select from the below menu.', [
    {
        keyword: '1. Create a new account',
        pattern: ['1', 'create a new account', 'create account', 'new account'],
        callback: () => {
            sr.reply('I am happy to tell you that you are in the right place', {threshold: 2000});
            sr.reply('Interchange is a small fee paid by a merchant\'s bank (acquirer) to' + 
                ' a cardholder\'s bank (issuer) to compensate the issuer for the value and ' + 
                'benefits that merchants receive when they accept electronic payments.', {threshold: 2000});

            sr.gotoThread('new_account');
        }
    },
    {
        keyword: '2. What the benefit of the bank?',
        pattern: ['2', 'what the benefits of the bank', 'what the benefit'],
        callback: () => {
            sr.reply('benefits');
            sr.reply('something_else');
        }
    },
    {
        keyword: '3. Log in to my account',
        pattern: ['3', 'log in to my account', 'log in', 'login'],
        callback: () => {
            sr.reply('Sure!', {threshold: 500});
            sr.gotoThread('account_login:number');
        }
    },
    {
        callback: (response) => {
            sr.reply('I am sorry i am afraid, i can not understand you');
            sr.gotoThread('list:no_account');
        }
    }
], {threshold: 1000}, 'list:no_account');


/** ------ ACCOUNT LOGIN -------------------------------------- */

sr.ask('Your account number?', [
    {
        callback: (response) => {
            const accountNumber = parseInt(response);

            // Some validation is neccessary.
            if( response.trim().length < 6 ){
                sr.reply('The given account number is not valid. e.g. 132456.', {threshold: 1000});
                sr.gotoThread('account_login:number');
            } else {
                data.accountNumber = accountNumber;
                sr.gotoThread('account_login:password');
            }
        }
    }
], {threshold: 1000}, 'account_login:number');

sr.ask('Your account password?', [
    {
        callback: async (response) => {
            let password = response;
 
            if( password.length >= 6 ){
                let account = await db('accounts').where({
                    id: data.accountNumber, 
                    password: password
                }).first();

                if( account ){
                    sr.reply('Hello ' + captialize(account.first_name), {threshold: 1000});
                    data.account = account;
                    sr.gotoThread('list:account')
                } else {
                    sr.reply('The given password does not match with account number.');
                    sr.gotoThread('account_login:number');
                }
            } else {
                sr.reply('The account password should be minimum 6 digitals.');
                sr.gotoThread('account_login:password');
            }
        }
    }
], {threshold: 1000}, 'account_login:password');

 
/** ------ NEW ACCOUNT -------------------------------------- */

sr.addMessage({
    text: 'New account ',
    action: 'new_account:email',
}, 'new_account');

sr.ask('your email?', [
    {
        callback: (response) => {
            
            if( validateEmail(response) ){
                data.newAccount.email = response;
                sr.gotoThread('new_account:mobile_number');
            } else {
                sr.reply('Please give a valid email. e.g. ahmed@admin.com')
                sr.gotoThread('new_account:email')
            }
        }
    }
], {threshold: 1000}, 'new_account:email');


sr.ask('What is your mobile number?', [
    {
        callback: (response) => {

            if( validateMobileNumber(response) ){
                sr.gotoThread('new_account:full_name');
            } else {
                sr.reply('Please give a valid phone number. e.g.. 9876543210');
                sr.gotoThread('new_account:mobile_number');
            }
        }
    }
], {threshold: 1000}, 'new_account:mobile_number');

sr.ask('your full name?', [
    {
        callback: (response) => {
            let match = response.match(/([a-z])\w+/gi);

            if( match.length < 2 ){
                sr.reply('Please give valid full name. e.g.. Ahmed Bouhuolia');
                sr.gotoThread('new_account:full_name');
            } else {
                data.newAccount.first_name = match[0];
                data.newAccount.last_name = match[1];
                sr.gotoThread('new_account:gender');
            }
        }
    }
], {threshold: 1000}, 'new_account:full_name');

sr.ask('Please select your gender', [
    {
        keyword: 'Male',
        pattern: 'male',
        callback: (response) => {
            data.newAccount.gender = 'male';
            sr.gotoThread('new_account:father_name');
        }
    },
    {
        keyword: 'Female',
        pattern: 'female',
        callback: (response) => {
            data.newAccount.gender = 'female';
            sr.gotoThread('new_account:father_name');
        }
    },
    {
        callback: () => {
            sr.reply('I can understand you.');
            sr.gotoThread('new_account:gender');
        }
    }
], {threshold: 1000}, 'new_account:gender');


sr.ask("What's your Father's full name?", [
    {
        callback: (response) => {
            let match = response.match(/([a-z])\w+/gi);

            if( match.length < 2 ){
                sr.reply('Please give valid full name. e.g.. Ahmed Bouhuolia');
                sr.gotoThread('new_account:father_name');
            } else {
                sr.gotoThread('new_account:type');
            }
        }
    }
], {threshold: 1000}, 'new_account:father_name');

sr.ask('What the type of account do you want to create?', [
    {
        keyword: 'Regular Account',
        pattern: 'regular',
        callback: async (response) => {
            data.newAccount.type = 'regular';

            sr.reply('Great. We have all the information we need.', {threshold: 2000});
            sr.reply('You will soon get a call from our executive with more information.', {threshold: 2000});

            await createNewAccount(data.newAccount);

            sr.gotoThread('something_else');
        }
    },
    {
        keyword: 'Joint Account',
        pattern: 'joint',
        callback: async (response) => {
            data.newAccount.type = 'joint';
 
            sr.reply('Great. We have all the information we need.', {threshold: 2000});
            sr.reply('You will soon get a call from our executive with more information.', {threshold: 2000});

            await createNewAccount(data.newAccount);

            sr.gotoThread('something_else');
        }
    },
    {
        callback: (response) => {
            sr.reply('I can not understand you.');
            sr.gotoThread('new_account:type');
        }
    }
], {threshold: 2000}, 'new_account:type');


async function createNewAccount(data){
 
    return await db('accounts').insert({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        gender: data.gender,
        type: data.type,
        balance: 0,
        password: '',
        active: 0
    })
}


/** --- SOMETHING ELSE ----------------------------------- */

sr.ask('Do you want something else?', [
    {
        pattern: new RegExp(acceptance.yes.join('|'), 'gi'),
        callback: (response) => {

            debugger;
            
            if( 'undefined' === typeof data.account.id ){
                sr.gotoThread('list:no_account');
            } else {
                sr.gotoThread('list:account');
            }
        }
    },
    {
        pattern: new RegExp(acceptance.no.join('|'), 'gi'),
        callback: (response) => {
            sr.reply('Thanks for your interest in banking with Central Bank');
        }
    }
], {threshold: 1000}, 'something_else');
 
// Start the engine.
fahem.start();


/** --- UTILITIES ----------------------------------- */

function validateMobileNumber(response){
    let phone_pattern = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    let match = response.match(phone_pattern);

    return ( match === null ) ? false : true;
}
 
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
function captialize(text){
    return text.replace(/\b\w/g, function(l){ return l.toUpperCase() })
}

function hashPassword(password){
    let hash = crypto.createHash('md5');
    let data = hash.update(password, 'utf-8');

    data = data.digest('hex');
    return data;
}