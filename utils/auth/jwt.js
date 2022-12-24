const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const boom = require('@hapi/boom');

const UserService = require('../../services/users');
const { config } = require('../../config/index');

passport.use(
  new Strategy(
    {
      secretOrKey: config.apiKey,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },

    async function (tokenPayLoad, cb) {
      const userService = new UserService();
      try {
        await userService.getuser(tokenPayLoad.user, (result) => {
          if (result.idrespuesta === 0) {
            return cb(null, result);
          } else {
            return cb(boom.unauthorized(), false);
          }
        });
      } catch (error) {
        return cb(error);
      }
    }
  )
);
