module.exports = (config) => {

	const defaultConfig = {
		logDirectory: 'logs',
		logColors: {
			error: 'red',
			warn: 'yellow',
			info: 'green',
			debug: 'cyan'
		},
		logFileRotation: {
			// for winston package

			// maxFiles: 10,  // files log files to create
			// maxsize: 10 * 1024 * 1024 // 10MB it should be a number not string

			// for daily rotate package

			maxFiles: '5d', // how long to retain log files
			maxSize: '10mb' // max size of each file
		},
		log_level: 'debug',
		logFormatType: 'txt',
		printToConsole: true,
		logFileDateFormat: 'YYYY-MM-DD HH:mm:ss:ms'
	}

	config = {
		...defaultConfig,
		...config || {}
	};

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
	const DailyRotateFile = require('winston-daily-rotate-file');
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

	let logLevels = ['error', 'warn', 'info', 'debug'];

	const onlyLevel = (level) =>
		format((info) => {
			if (info.level === level) {
				return info;
			}

			return false;
		})();

	/**
	 * Note: winston uses paramaters maxsize and maxFiles to track file rotation when maxsize is reached
	 * maxFiles - Maximum number of rotated log files to retain
	 * maxsize - Maximum size of a log file in bytes before rotation.s
	 * eg. if  current file rotation counter is App-debug20 it means it will keep only files from counter 16-20 in memory
	 * 
	 * This is file rotation concept
	 */
	// logLevels.forEach(lvl => {
	// 	transports.push(new winston.transports.File({
	// 		filename: `${config.logDirectory}/App-${lvl}.log`,
	// 		// level: 'info',
	// 		...config.logFileRotation,
	// 		format: combine(
	// 			onlyLevel(lvl),
	// 			timestamp({ format: config.logFileDateFormat }),
	// 			config.logFormatType === 'json' ? json() : printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
	// 		)
	// 	}))
	// })

	const fileFormat = combine(
		timestamp({ format: config.logFileDateFormat }),
		config.logFormatType === 'json' ? json() : printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
	)

	logLevels.forEach(lvl => {
		transports.push(
			new DailyRotateFile({
				filename: `${config.logDirectory}/App-${lvl}-%DATE%.log`,
				datePattern: 'DD-MM-YYYY',
				...config.logFileRotation,
				format: fileFormat,
				level: lvl
			}))
	})

	if (config.printToConsole) {
		transports.push(new winston.transports.Console({ format: consoleFormat, }))
	}

	const logger = winston.createLogger({
		level: process.env.log_level || config.log_level || 'debug',
		transports
	});

	return logger;
}