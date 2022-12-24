var mysql = require('mysql');
const logger = require('../utils/log/logger');


var config_mysql = {
  host: 'MYSQL5045.site4now.net',
  port: '3306',
  database: 'db_a7cba7_buzzer2',
  user: 'a7cba7_buzzer2',
  password: 'buzzer123456',
  // database: 'jespukdk_ControlGastos',
  // user: 'jespukdk_root',
  // password: 'rootDataBase'
}

var configMySql = mysql.createConnection(config_mysql);
handleDisconnect(configMySql);

function handleDisconnect(client) {
  client.on('error', function (error) {
    if (!error.fatal) return;
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('> Re-connecting lost MySQL connection: ' + error.stack);

      // NOTE: This assignment is to a variable from an outer scope; this is extremely important
      // If this said `client =` it wouldn't do what you want. The assignment here is implicitly changed
      // to `global.mysqlClient =` in node.
      configMySql = mysql.createConnection(client.config);
      handleDisconnect(configMySql);
      configMySql.connect();
    }
  });
};

class mysqlLib {
  connect(sprocedure) {
    try {
      const result = configMySql.query(
        sprocedure,
        true,
        (error, results, fields) => {
          if (error) {
            return console.error(error.message);
          }
          //console.log(results[0]);
          configMySql.end();
          return results[0];
        }
      );
      return result;
    } catch (error) {
      configMySql.end();
      return console.error('junior Error', error);
    }
  }

  callProcedure(sprocedure, callback) {
    // const list =  this.connect(sprocedure);
    // console.log('listXD', list);
    // return list;
    logger.info('iniciar llamada sp');
    configMySql.query(sprocedure, true, (error, results, fields) => {
      if (error) {
        console.log(error, 'error call procedure');
        logger.info('error sp');
        logger.info(error);
        return callback(null);
      }
      return callback(results[0]);
    });
  }
}

module.exports = mysqlLib;
