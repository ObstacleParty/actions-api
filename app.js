require('dotenv').config();

const express = require('express');
const http = require('http');

const store = require('./lib/store');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// TODO: Remove test execution
// store.set(
//   'test_id',
//   {
//     user:{
//       user_id: 'auth0|5eac3866166afc00720b9450',
//       user_metadata: {
//         existing_value: 12345678
//       }
//     },
//     context: {
//       clientId: '9yd2uj29d8yj23d89y',
//       domain: 'bcd.local.dev.auth0.com'
//     },
//     actionLog: [
//       {
//         name: 'terms_and_conditions',
//         type: 'prompt',
//         status: 'pending',
//         action: 'prompt'
//       }
//     ],
//     pipline:[
//       {
//         name: 'terms_and_conditions',
//         type: 'prompt'
//       }
//     ]
//   }
// );

app.post('/api/execute', require('./api/execute'));
app.post('/api/continue/:executionId', require('./api/continue'));
app.all('/api/current/:executionId', require('./api/current/[name].js'));

http.createServer(app)
  .listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
