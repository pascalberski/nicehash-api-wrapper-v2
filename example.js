const fs = require('fs');
const Api = require('./api');

var api = new Api(JSON.parse(fs.readFileSync('secret.json')));
//var api = new Api({});

api.MinerPrivate.getMiningAddress().then((res) => {
    console.log(res);
});

