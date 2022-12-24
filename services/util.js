const mysqlLib = require('../connection/base');

class UtilService {
  constructor() {
    this.mysqlDB = new mysqlLib();
  }

  async listParameters(key, callback) {
    //let lista = null;

    var query = `CALL sps_parameter("${key}", 0)`;

    await this.mysqlDB.callProcedure(query, (res) => {
      return callback(res);
    });
  }

  async listCategories(id_type, callback) {
    var query = `CALL sps_cetegory(${id_type})`;
    await this.mysqlDB.callProcedure(query, (res) => {
      return callback(res);
    });
  }

  async listAmountsPerYear(id_year, id_user, callback) {
    var query = `CALL sps_listamounts_year(${id_year}, ${id_user})`;
    await this.mysqlDB.callProcedure(query, (res) => {
      return callback(res);
    });
  }

  async listAmountsPerMonth(id_user, id_year, id_month, callback) {
    var query = `CALL sps_listamounts_month(${id_user}, ${id_year}, ${id_month})`;
    await this.mysqlDB.callProcedure(query, (res) => {
      return callback(res);
    });
  }
}

module.exports = UtilService;
