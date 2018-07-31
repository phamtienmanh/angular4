var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var port = process.env.port || process.env.PORT || 1337;
var dir = 'dist';
var assetPath = path.join(__dirname, dir);

global.ROOTPATH = assetPath;

// Config
app.set('port', port);
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.static(assetPath));

app.get('/**', function (req, res){
  res.sendFile('index.html', { root: assetPath });
});

app.listen(app.get('port'), function (){
  console.log('Express server listening on port ' + app.get('port'));
});

process.on('uncaughtException', function (err){
  if (err) {
    console.error('uncaughtException: ' + err.message);
    console.error(err.stack);
    //process.exit(1);             // exit with error
  }
});
