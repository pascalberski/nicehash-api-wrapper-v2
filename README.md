# nicehash-api-wrapper-v2
With this api wrapper you can use the nicehash api v2 in node js. You can read the api documentation here: <https://www.nicehash.com/docs/rest/>.

## Getting started
Run the following code in your npm environment.
```sh
npm i --save nicehash-api-wrapper-v2
```
Now you have to create an api key.
- Go to your [API Keys settings] in NH.
- Click on "Create new API Key".
- You can now give your key a name and you can select what permissions the key should have.
- Click "Generate API key" and verify it with your OTP.
- Now you have to save your API key and the secret. We will need it later.
- Activate your key with the email code.

#### first code
This is an example code which will show you your mining address.
```js
const NHApi = require('nicehash-api-wrapper-v2');
const api = new NHApi({apiKey: "your api key", apiSecret: "your api secret", orgId: "your organization Id"});

api.getMiningAddress().then((res) => {
    console.log(res);
});
```
#
## All implemented Endpoints
### Miner Private


##### getMiningAddress()
Returns the NH-MiningAddress.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
| none ||||

https://www.nicehash.com/docs/rest/get-main-api-v2-mining-miningAddress
#
##### getRigs()
List rigs and their statuses.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|size||int|25
|page||int|0
|path||string||filter by group name
|sort||enum|NAME|NAME,PROFITABILITY,ACTIVE,INACTIVE
|system||enum||NHM,NHOS,NHQM
|status||enum||Mining,Offline

<https://www.nicehash.com/docs/rest/get-main-api-v2-mining-rigs2>
#
##### getRigStatsAlgo(?rigid)
List mining algos with basic statistics for organization (and for rig id if specified).
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|rigid||string|

<https://www.nicehash.com/docs/rest/get-main-api-v2-mining-algo-stats>
#
##### getGroupsList(?extendedResponse)
List of groups with list of rigs in the groups.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
| extendedResponse ||bool|false|shows more informations|

<https://www.nicehash.com/docs/rest/get-main-api-v2-mining-groups-list>
#
##### getRigStatsAlgoStream(rigid, ?algorithm, ?afterTimestamp, ?beforeTimestamp)
Get statistical streams for selected rigs and selected algorithm.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
| rigid |*|string|||
|algorithm||int|20|id from algorith (20=daggerhashimoto)|
|afterTimestamp||int
|beforeTimestamp||int

<https://www.nicehash.com/docs/rest/get-main-api-v2-mining-rig-stats-algo>
#
##### getRigStatsUnpaidStream(rigid, ?afterTimestamp, ?beforeTimestamp)
Get statistical streams for selected rig.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
| rigid |*|string|||
|afterTimestamp||int
|beforeTimestamp||int

<https://www.nicehash.com/docs/rest/get-main-api-v2-mining-rig-stats-unpaid>
#
##### getRigInformation(rigid)
Get mining rig detailed information for selected rig.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
| rigid |*|string|

<https://www.nicehash.com/docs/rest/get-main-api-v2-mining-rig2-rigId>
#
##### getActiveWorkers(?size, ?page, ?sortParameter, ?sortDirection)
Get a list of active worker.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|size||int|100|
|page||int|0
|sortParameter||enum|RIG_NAME
|sortDirection||enum|ASC

<https://www.nicehash.com/docs/rest/get-main-api-v2-mining-rigs-activeWorkers>
#
##### getPayouts(?size, ?page, ?beforeTimestamp)
Get list of payouts.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|size||int|10|
|page||int|0
|beforeTimestamp||int|

<https://www.nicehash.com/docs/rest/get-main-api-v2-mining-rigs-payouts>
#
##### getStatsAlgoStream(?algorithm, ?afterTimestamp, ?beforeTimestamp)
Get statistical streams for all mining rigs for selected algorithm.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|algorithm||int|20|id of algorithm (20 = daggerhashimoto)
|afterTimestamp||int
|beforeTimestamp||int

<https://www.nicehash.com/docs/rest/get-main-api-v2-mining-rigs-stats-algo>
#
##### getStatsUnpaidStream(?afterTimestamp, ?beforeTimestamp)
Get statistical streams for all mining rigs.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|afterTimestamp||int
|beforeTimestamp||int

<https://www.nicehash.com/docs/rest/get-main-api-v2-mining-rigs-stats-unpaid>


#
## Todo
- implement more endpoints

Feel free to report [bugs].
   
   [API Keys Settings]: <https://www.nicehash.com/my/settings/keys>
   [bugs]: <https://github.com/pascalberski/nicehash-api-wrapper-v2/issues>
