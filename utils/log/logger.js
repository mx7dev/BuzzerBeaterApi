// import  *  as  winston  from  'winston';
// import  'winston-daily-rotate-file';
// import  appRoot  from  'app-root-path';

const winston = require('winston');
require('winston-daily-rotate-file');
// const appRoot = require('app-root-path');

const logger = winston.createLogger({
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'application-%DATE%.log',
      // dirname:  `${appRoot}/logs/`,
      dirname: `~/logsxd/`,
      level: 'info',
      handleExceptions: true,
      colorize: true,
      json: false,
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
  exitOnError: false,
});

// export  default  logger;
module.exports = logger;
