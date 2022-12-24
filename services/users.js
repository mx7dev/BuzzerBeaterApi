const bcrypt = require('bcrypt');
const mysqlLib = require('../connection/base');
// const logger = require('../utils/log/logger');

class UserService {
  constructor() {
    this.mysqlDB = new mysqlLib();
  }

  async createUser(user, callback) {
    const hashedPassword = await bcrypt.hash(user.spassword, 10);

    var query = `CALL spi_create_user('${user.suser}', '${hashedPassword}', '${user.snames}', '${user.slastname}', 
                '${user.slastname2}', '${user.semail}', '${user.sphone}', '${user.saddress}', ${user.nid_user_register})`;

    await this.mysqlDB.callProcedure(query, (res) => {
      callback(res[0]);
    });
  }

  async getuser(user, callback) {
    var query = `CALL sps_login('${user}')`;
    await this.mysqlDB.callProcedure(query, (res) => {
      return callback(res[0]);
    });
  }
}

module.exports = UserService;
