const fs = require('fs');
//const Api = require('nicehash-api-wrapper-v2');
const Api = require("./api"); // local files

const SECRET = JSON.parse(fs.readFileSync('secret.json'));

var api = new Api(SECRET);

/* api.MinerPrivate.getMiningAddress().then((res) => {
    console.log(res);
}); */

api.HashPower.getMyOrders().then((res) => {
    console.log(res);
});