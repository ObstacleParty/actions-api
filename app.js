const express = require('express');
const http = require('http');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.post('/api/execute', require('./api/execute'));
app.get('/api/continue', require('./api/continue'));
app.all('/api/current/:executionId', require('./api/current/[name].js'));

http.createServer(app)
  .listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });