console.log("Index Page")

global.logger = require('./utils/logger')();

for (let i = 0; i <= 1000; i++) {
	logger.debug('The query to generate new user is : query', "new query")
	logger.info('Added new client', "This is the meta data fields for client")
	logger.error('Error')
	logger.warn('Someinfo on warning');
}
