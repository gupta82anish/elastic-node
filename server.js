var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var multer = require('multer');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var port = 3030;

var router = express.Router();

require('./routes/routes.js')(app);

app.get('/',(req, res)=> res.sendFile(path.join(__dirname + '/views/upload.html')));


app.listen(port);

console.log("Server started at "+port);
