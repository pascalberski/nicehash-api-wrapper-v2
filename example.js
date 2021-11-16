const fs = require('fs');
const Api = require('nicehash-api-wrapper-v2');

var api = new Api(JSON.parse(fs.readFileSync('secret.json')));
//var api = new Api({});

api.MinerPrivate.getMiningAddress().then((res) => {
    console.log(res);
});

