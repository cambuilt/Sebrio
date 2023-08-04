
const express = require('express');
const app = express();
const https = require('https');
const http = require('http');
const fs = require('fs');

app.disable('x-powered-by')
app.use(express.static(__dirname + '/dist'));

app.all('*', (req, res) => {
	res.status(200).sendFile(__dirname + '/dist/index.html');
});

const securePort = process.env.SECURE_PORT || 4200;
var credentials = {

  key: fs.readFileSync('/etc/pki/tls/private/keyfile-decrypted.key', 'utf8'),
  cert: fs.readFileSync('/etc/pki/tls/certs/certificate.crt', 'utf8')

};

https.createServer(credentials, app).listen(securePort, '0.0.0.0');

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	res.header('Access-Control-Allow-Credentials', 'true');
	next();
});

// app.listen(4200, '0.0.0.0');
