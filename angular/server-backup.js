
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

const options = {
	key: fs.readFileSync('/etc/pki/tls/private/wildcard_rhodesportal_com.key'),
	cert: fs.readFileSync('/etc/pki/tls/certs/wildcard_rhodesportal_com.crt')
};




app.listen(process.env.PORT || 8000);

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	res.header('Access-Control-Allow-Credentials', 'true');
	next();
});

