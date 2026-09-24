module.exports = (config) => {


	/**
	 * Winston separates log generation from log destination.
	 * Destination sources can be Console, log folders, elastic stack or Loki or Grafana
	 * 
	 * 
	 * Concepts 
	 * 
	 * 1. Logger - generates logs
	 * 
	 * 2. Formats - give particular format to logs
	 * 
	 * 3. Transport - Actual destination source for logs
	 * 
	 * 4. Levels - Priorities given to log events
	 * 
	 * The priority/severity of level is 0 highest to 6 Lowest
	 * 0 error -> warn -> info -> http -> verbose -> debug -> silly 6
	 * eg. if log level is debug -> it will log debug, verbose, http, info and error logs
	 * 
	 */

	const path = require('path');
	const fs = require('fs');
	const winston = require('winston');

	// console.log(winston)

	let transports = [];

	// create logger transport 1 - logs folder
	let logDirectory = path.resolve(process.cwd(), 'logs');
	fs.mkdirSync(logDirectory, { recursive: true });


	// transports.push( new winston.transports.File())







	const logger = winston.createLogger({
		level: process.env.log_level || 'debug',
		transports: [
			new winston.transports.Console()
		]
	});

	return logger;
}