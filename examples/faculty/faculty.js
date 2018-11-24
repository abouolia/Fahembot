process.env.NODE_ENV = 'development';

const Fahem = require('../../fahem/fahem');
const acceptance = require('../../fahem/utterances/acceptance');
const SocketAdapter = require('../../fahem/io/socket_io');
const validate = require("validate.js");
 
// Connect to the database.
const db = require('knex')({
    client: 'mysql',
    version: '5.7',
    connection: {
        host : '127.0.0.1',
        user : 'root',
        password : 'root',
        database : 'chatbot_faculty'
    }
});

// Initialize Fahem chat bot engine.
let fahem = new Fahem({
    io: new SocketAdapter
});

// Access to specific response dialog.
let sr = fahem.dialogs.get('SpecificResponse');

let data = {};

sr.reply('Hello! Welcome to Tripoli Faculty for information technology.', {threshold: 2000});
sr.reply('I am here to help you find what you are looking for.', {threshold: 1000});

sr.ask('You Student ID please?', [
    {
        callback: async (response) => {
            let student_id = parseInt(response);

            if( student_id > 0 ) {
                let student = await db('students').where('student_id', student_id).first();
                
                if( student ) {
                    data.student = student;
                    sr.gotoThread('your_password');
                } else {
                    sr.reply('There is no student with that ID number, please try again.', {threshold: 1000});
                    sr.gotoThread('student:id');
                }
            } else {
                sr.reply('Please enter a numeric value.', {threshold: 500});
                sr.gotoThread('student:id');
            }
        }
    }
], {threshold: 1000}, 'student:id');

sr.gotoThread('student:id');

sr.ask('Your password please?', [
    {
        callback: async (response) => {
            let user = await db('users').where({
                student_id: data.student.id,
                password: response
            }).first();

            if( user ){
                sr.reply('Hi, ' + data.student.firstname + ' ' + data.student.lastname, {threshold: 1000});
                sr.reply('Welcome to our services list', {threshold: 1000});
                sr.gotoThread('services_options');
            } else {
                sr.reply('The password that your entered is not correct.', {threshold: 1000});
                sr.reply('Please try again', {threshold: 500});
                sr.gotoThread('your_password');
            }
        }
    }
], 'your_password');

sr.ask('Select from the menu below, which the service do you want?', [
    {
        pattern: ['1', 'exams scores of latest semester', 'exams scores'],
        keyword: '1. Exams scores of latest semester',
        callback: (response) => {
            sr.reply('Java 1: 85.00 \n Mathmetical 2: 77.00 \n Database: 67.50 \n' + 
                'System Analysis: 87.00 \n Projects Managment: 77.00', {threshold: 2000});

            sr.gotoThread('something_else');
        }
    },
    {
        pattern: ['2', 'grade point average', 'GPA'],
        keyword: '2. Grade point average.',
        callback: () => {
            sr.reply('Your grade point average (GPA) is 75.0%.', {threshold: 2000});
            sr.gotoThread('something_else');
        }
    },
    {
        pattern: ['3', 'study schedule'],
        keyword: '3. Study schedule.',
        callback: () => {
            sr.reply('<strong>Saturday</strong>: Mathematical  9:00 AM to 11:00 AM \n Database: 2:00 AM to 4:00 AM \n' + 
                '<strong>Sunday</strong>: Projects Managment  10:00 AM to 12:00 AM \n' + 
                '<strong>Thursday</strong>: Java 1  11:00 AM to 2:30 PM', {threshold: 2000});

            sr.gotoThread('something_else');
        }
    },
    {
        pattern: ['4', 'exams schedule'],
        keyword: '4. Exams schedule',
        callback: () => {
            sr.gotoThread('something_else');
        }
    },
    {
        default: true,
        callback: () => {
            sr.reply('I can not understand you.', {threshold: 1000});
            sr.gotoThread('services_options');
        }
    }
], 'services_options');

sr.ask('Do you want something else?', [
    {
        pattern: acceptance.yes,
        callback: () => {
            sr.gotoThread('services_options');
        }
    },
    {
        pattern: acceptance.no,
        callback: () => {
            sr.gotoThread('services_options');
        }
    }
], 'something_else')

// Start the chat bot.
fahem.start();