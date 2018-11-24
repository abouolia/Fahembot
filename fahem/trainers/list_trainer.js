const TrainerAdapter = require('./trainer_adapter');
const Statement = require('../models/statement');
const StatementRepository = require('../repositories/statement_repository');
const Response = require('../models/response');
const Tag = require('../models/tag');

/**
 * Allows a chat bot to be trained using a list of strings.
 */
class ListTrainer extends TrainerAdapter{

	/**
	 * Constructor method.
	 * @constructor
	 */
	constructor(fahem){
		super(fahem);
	}

	/**
	 * Train the chat bot based on the provided list of 
	 * statements that represents a single conversation.
	 * @async
	 * @param {Array} conversation - 
	 * @param {String|Array} category -  for classification.
	 */
	async train(conversation, category){
		if( ! Array.isArray(conversation) )
			throw new Error('`conversation` parameter should be array.');
		
		let categories = Array.isArray(category) ? category : [category];
		let statement = null;

		for (let i = 0; i < conversation.length; i++) {
			let statementText = conversation[i];

			if( statement ) {
				let response = new Response({text: statementText});
				statement.addResponse(response);
			} else {
				statement = new Statement({text: statementText});
			}
		}

		if( statement ){
			categories.forEach((category) => {
				let tag = Tag.toModel(category);
				statement.addTag(tag);
			});

			// initializing the repository.
			let statementRepository = new StatementRepository(statement);

			// Save the statement to the repository.
			await statementRepository.save();
		}
	}
}

module.exports = ListTrainer;