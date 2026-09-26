console.log("Index Page")

global.logger = require('./utils/logger')();

for (let i = 0; i <= 10000; i++) {
	logger.error('Error')
	logger.warn('Someinfo on warning');
	logger.info('Added new client', "This is the meta data fields for client")
	logger.debug('The query to generate new user is : query', "new query")
}
