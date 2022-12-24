const passport = require('passport');
const { BasicStrategy } = require('passport-http');
const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');

const UserService = require('../../services/users');

passport.use(
  new BasicStrategy(async function (user, password, cb) {
    const userService = new UserService();
    try {
      // const objUser = {
      //     suser: user,
      //     spassword: password
      // };
      await userService.getuser(user, (result) => {
        if (result.idrespuesta === 0) {
          const objectUser = {
            idrespuesta: '',
            message: '',
            nid_user: result.nid_user,
            suser: result.suser,
            snames: result.snames,
            slastname: result.slastname,
            slastname2: result.slastname2,
            semail: result.semail,
          };
          
          bcrypt.compare(password, result.spassword, function (err, res) {
            if (res) {
              objectUser.idrespuesta = 0;
              objectUser.message = 'Inicio Exitoso';
              return cb(null, objectUser);
            } else {
              return cb(boom.unauthorized(), false);
            }
          });
        } else {
          return cb(boom.unauthorized(), false);
        }
      });
    } catch (error) {
      return cb(error);
    }
  })
);
