const SpecificDialog = require('./specific_dialog');

/**
 * Time dialog returns the current time.
 */
class TimeDialog extends SpecificDialog{

    /**
     * Constructor method.
     * @constructor
     */
    constructor(){
        super();

        this.timeQuestions = [
            'what time is it',
            'what is the time',
            'hey what time is it',
            'do you have the time',
            'do you know the time',
            'do you know what time it is',
            'time know',
            'please time',
            'tell me the time',
            'time'
        ];
        
        this.dateQuestions = [
            'what the date today',
            'do you know the date',
            'what is the date',
            'please date',
            'tell me the date'
        ];
    }

    /**
     * Called after the chatbot activity is start.
     * @async
     * @return {Array}
     */
    async onStart(){

        // Inline function to convert any numeric to two digital.
        let twoDigital = (n) => n > 9 ? '' + n: '0' + n;

        this.hears(this.timeQuestions, (statements) => {
            let now = new Date();

            this.reply('The time now is ' + twoDigital(now.getHours()) + ':'+
                twoDigital(now.getMinutes()) + '', statements);
        });
        
        this.hears(this.dateQuestions, (statements) => {
            let now = new Date();

            var monthNames = [
                "January", "February", "March", "April",
                "May", "June", "July", "August", "September",
                "October", "November", "December"
            ];
            
            let dayNames = [
                'Sunday', 'Monday', 'Tuesday', 'Wednesday',
                'Thursday', 'Friday', 'Saturday'
            ];

            var date = now.getDate();
            var monthIndex = now.getMonth();
            var year = now.getFullYear();
            let day = now.getDay();
            
            let dateString =  dayNames[day] + ', ' + twoDigital(date) + ', ' +
                monthNames[monthIndex] + ', ' + year;

            this.reply('Today ' + dateString + '.');
        }, {category: 'date'});
        
        let responses = super.onStart();
        return responses;
    }
}

module.exports = TimeDialog;