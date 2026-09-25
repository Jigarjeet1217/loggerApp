const { warn, debug } = require('console');

module.exports = (config) => {

	const defaultConfig = {
		logDirectory: 'logs',
		logColors: {
			error: 'red',
			warn: 'yellow',
			info: 'green',
			debug: 'cyan'
		},
		log_level: 'debug',
		printToConsole: true,
		logFileDateFormat: 'YYYY-MM-DD HH:mm:ss:ms'
	}

	config = config || defaultConfig;

	/**
	 * Winston separates log generation from log destination.
	 * Destination sources can be Console, log folders, elastic stack or Loki or Grafana
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
	const { format } = winston;
	const { colorize, timestamp, json, printf, combine } = format;

	let transports = [];

	// create logger transport 1 - logs folder
	let logDirectory = path.resolve(process.cwd(), config.logDirectory);
	fs.mkdirSync(logDirectory, { recursive: true });

	// add global logging colors
	winston.addColors(config.logColors);

	/**
	 * Note when using colorize, timestamp, json in order, 
	 * json creates/appends ansi color codes of form {"level":"\u001b[36mdebug\u001b[39m","message":"\u001b[36mThe query to generate new user is : query\u001b[39m","timestamp":"2026-09-24 22:09:10:910"}
	 * 
	 * so use printf when coloring
	 */
	// adding global scoped formatter
	let consoleFormat = combine(
		colorize({ all: true }),
		timestamp({ format: config.logFileDateFormat }),
		// json(),
		printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
	)

	transports.push(new winston.transports.File({ filename: `${config.logDirectory}/App.log` }))

	if (config.printToConsole) {
		transports.push(new winston.transports.Console())
	}

	const logger = winston.createLogger({
		level: process.env.log_level || config.log_level || 'debug',
		format: consoleFormat,
		transports
	});

	return logger;
}