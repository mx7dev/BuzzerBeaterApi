const express = require('express');
const app = express();
const cors = require('cors');
const authApi = require('./routes/auth');
const teamApi = require('./routes/team');
// const utilsApi = require('./routes/utils');
// const incomeApi = require('./routes/income');
// const expenseApi = require('./routes/expense');

// const UserService = require('./services/users');

const { config } = require('./config/index');

// const usersService = new UserService();

//body parser
app.use(cors()); //Cors for all request
app.use(express.json());

// Directorio Publico
app.use( express.static('public'));

// routes
authApi(app);
teamApi(app);
// utilsApi(app);
// incomeApi(app); // Cors for some domains
// expenseApi(app); // app.get('/', function (req, res) { //   res.send('Hello world');
/*
const corsOptions = { origin: "http://example.com" };

app.use(cors(corsOptions));*/ // });

// app.get('/json', function (req, res) {
//   res.json({ hello: 'world' });
// });

// app.get('/listParams', function (req, res) {
//   usersService.lisTest((listParam) => {
//     res.status(200).json({
//       data: listParam,
//       message: 'user created',
//     });
//   });
// });

app.listen(config.port, function () {
  console.log(`Listening http://localhost:${config.port}`);
});
