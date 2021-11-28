# nicehash-api-wrapper-v2
With this api wrapper you can use the nicehash api v2 in node js. You can read the api documentation here: <https://www.nicehash.com/docs/rest/>.

[![Node.js CI](https://github.com/pascalberski/nicehash-api-wrapper-v2/actions/workflows/node.js.yml/badge.svg)](https://www.npmjs.com/package/nicehash-api-wrapper-v2)

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

api.MinerPrivate.getMiningAddress().then((res) => {
    console.log(res);
});
```
#
## All implemented Endpoints
### Miner Private (Api.MinerPrivate)


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
##### setRigs({group: "", rigId: "", deviceId: "", action: "", options: ""})
Update status for one or more rigs.

https://www.nicehash.com/docs/rest/post-main-api-v2-mining-rigs-status2


#
#
### External Miner (Api.ExternalMiner)

##### getRigs(btcAddress, ?size, ?page, ?sort)

| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|btcAddress| * |string||
|size||int|25|
|page||int|0|
|sort||enum|NAME|[ "NAME", "PROFITABILITY", "ACTIVE", "INACTIVE" ]|

https://www.nicehash.com/docs/rest/get-main-api-v2-mining-external-btcAddress-rigs2
#

##### getActiveWorkers(btcAddress, ?size, ?page, ?sortParameter, ?sortDirection)
Getting active workers and information about active workers on external miner, such as current mining algorithm, speed, profitability, etc.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|btcAddress| * |string||
|size||int|25|
|page||int|0|
|sortParameter||enum|RIG_NAME|[ "RIG_NAME", "TIME", "MARKET", "ALGORITHM", "UNPAID_AMOUNT", "DIFFICULTY", "SPEED_ACCEPTED", "SPEED_REJECTED", "PROFITABILITY" ]|
|sortDirection||enum|ASC|[ "ASC", "DESC" ]|

https://www.nicehash.com/docs/rest/get-main-api-v2-mining-external-btcAddress-rigs-activeWorkers
#

##### getStatsAlgoStream(btcAddress, ?algorithm, ?afterTimestamp, ?beforeTimestamp)
Get statistical streams for all mining rigs with external BTC address for selected algorithm.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|btcAddress| * |string||
|algorithm||int|20|id of algorithm (20 = daggerhashimoto)|
|afterTimestamp||int||
|beforeTimestamp||int||

https://www.nicehash.com/docs/rest/get-main-api-v2-mining-external-btcAddress-rigs-stats-algo
#

##### getStatsUnpaidStream(btcAddress, ?afterTimestamp, ?beforeTimestamp)
Get statistical streams for all mining rigs with external BTC address.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|btcAddress| * |string||
|afterTimestamp||int||
|beforeTimestamp||int||

https://www.nicehash.com/docs/rest/get-main-api-v2-mining-external-btcAddress-rigs-stats-unpaid
#

##### getWithdrawals(btcAddress, ?afterTimestamp, ?size, ?page)

| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|btcAddress| * |string||
|afterTimestamp||int||
|size||int|100|
|page||int|0|

https://www.nicehash.com/docs/rest/get-main-api-v2-mining-external-btcAddress-rigs-withdrawals
#
#
### HashPower (Api.HashPower)

##### getMyOrders(?op, ?limit, ?ts, ?algorithm, ?status, ?active, ?market)

| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|op||enum|GT||
|limit||int|100||
|ts||timestamp|current timestamp||
|algorithm||enum|||
|status||enum|||
|active||bool|||
|market||enum|||

https://www.nicehash.com/docs/rest/get-main-api-v2-hashpower-myOrders
#

##### createOrder({parameters})
Create hashpower order. Use parameters from API-doc as JSON.

https://www.nicehash.com/docs/rest/post-main-api-v2-hashpower-order
#

##### getOrder(id)
Get hashpower order detailed information using order id.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|id|*|||order id|

https://www.nicehash.com/docs/rest/get-main-api-v2-hashpower-order-id
#

##### deleteOrder(id)
Cancel hashpower order using order id.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|id|*|||order id|

https://www.nicehash.com/docs/rest/delete-main-api-v2-hashpower-order-id
#

##### refillOrder(id, amount)
When order is active, amount on the order can be increased and prolong duration of active order in marketplace. The limitation for minimal and maximal amount are defined for each algorithm and can be fetched using /main/api/v2/public/buy/info endpoint.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|id|*|||order id|
|amount|*|int|||

https://www.nicehash.com/docs/rest/post-main-api-v2-hashpower-order-id-refill
#

##### getOrderStats(id, ?afterTimestamp)
Get statistical streams for selected order using order id.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|id|*|||order id|
|afterTimestamp||timestamp||

https://www.nicehash.com/docs/rest/get-main-api-v2-hashpower-order-id-stats
#

##### updatePriceAndLimit(id, {parameters})
At any time order speed limit and price can be altered when hashpower order is active.
Use parameters from API-doc as JSON.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|id|*|||order id|

https://www.nicehash.com/docs/rest/post-main-api-v2-hashpower-order-id-updatePriceAndLimit
#

##### calculateEstimateDuration({parameters})
Estimated duration of a hashpower order from the order type, amount, price and limit. The maximal value for STANDARD order is 10 days.
Use parameters from API-doc as JSON.

https://www.nicehash.com/docs/rest/post-main-api-v2-hashpower-orders-calculateEstimateDuration
#

##### getOrderBook(algorithm, ?size, ?page)
Hashpower order book for specified algorithm. Response contains orders for all markest and their stats. When there a lot of orders, response will be paged.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|algorithm|*|enum|||
|size||int|100||
|page||int|0||

https://www.nicehash.com/docs/rest/get-main-api-v2-hashpower-orderBook
#

##### getOrderSummaries(?market, ?algorithm)
Get accepted and rejected speeds for rigs and pools, rig count and paying price for selected market and/or algorithm. When no market or algorithm is specified all markets and algorithms are returned.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|market||enum|||
|algorithm||enum|||

https://www.nicehash.com/docs/rest/get-main-api-v2-hashpower-orders-summaries
#

##### getOrderSummary(market, algorithm)
Get accepted and rejected speed from pools and rigs, rig count and paying price for selected market and algorithm.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|market|*|enum|||
|algorithm|*|enum|||

https://www.nicehash.com/docs/rest/get-main-api-v2-hashpower-orders-summary
#

##### getAlgoHistory(algorithm)
Whole history for the selected algorithm.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|algorithm|*|enum|||

https://www.nicehash.com/docs/rest/get-main-api-v2-public-algo-history
#

##### getBuyInfo()
Information for each enabled algorithm needed for buying hashpower.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|none|

https://www.nicehash.com/docs/rest/get-main-api-v2-public-buy-info
#

##### getOrders(?algorithm, ?market, ?op, ?timestamp, ?page, ?size)
Get all hashpower orders. Request parameter work as filter to fine tune the result. The result is paged, when needed.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|algorithm||enum|||
|market||enum|||
|op||enum|||
|timestamp||timestamp|||
|page||int|0||
|size||int|100||

https://www.nicehash.com/docs/rest/get-main-api-v2-public-orders
#

##### getSimpleStatus()
Get information about speed and price for each enabled algorithm.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|none|

https://www.nicehash.com/docs/rest/get-main-api-v2-public-simplemultialgo-info
#

##### getStats24h()
Get average price and hashpower speed for all enabled algorithms in average for past 24 hours.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|none|

https://www.nicehash.com/docs/rest/get-main-api-v2-public-stats-global-24h
#

##### getStatsCurrent()
Get current price and hashpower speed for all enabled algorithms in average for last 5 minutes.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|none|

https://www.nicehash.com/docs/rest/get-main-api-v2-public-stats-global-current
#

#
### Exchange Public (Api.ExchangePublic)

##### getCandlesticks(market, ?to, ?from, ?countBack, ?resolution)
Get candlesticks for specified resolution.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|market|*|enum|||
|to||timestamp|current timestamp||
|from||timestamp|||
|countBack||int|||
|resolution||int|1|

https://www.nicehash.com/docs/rest/get-exchange-api-v2-info-candlesticks
#

##### getMarketStats()
Get statistics for all markets.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|none|

https://www.nicehash.com/docs/rest/get-exchange-api-v2-info-marketStats
#

##### getPrices()
Get list of last prices for all markets.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|none|

https://www.nicehash.com/docs/rest/get-exchange-api-v2-info-prices
#

##### getExchangeStatus()
Get detailed exchange status information for each market.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|none|

https://www.nicehash.com/docs/rest/get-exchange-api-v2-info-status
#

##### getTrades(market, ?sortDirection, ?limit, timestamp)
Get trades for specific market. Limit, sort direction and timestamp can be optionally selected.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|market|*|enum|||
|sortDirection||enum|DESC||
|limit||int|25||
|timestamp||timestamp|||

https://www.nicehash.com/docs/rest/get-exchange-api-v2-info-trades
#

##### getOrderbook(market, ?limit)
Get a list of asks and bids. Limit determines the size of asks and bids lists.
| Parameter | required | type| default | remark |
| ----- | ----- | ----- | ----- | ----- |
|market|*|enum|||
|limit||int|25||

https://www.nicehash.com/docs/rest/get-exchange-api-v2-orderbook
#


#
## Todo
- implement more endpoints

Feel free to report [bugs].
   
   [API Keys Settings]: <https://www.nicehash.com/my/settings/keys>
   [bugs]: <https://github.com/pascalberski/nicehash-api-wrapper-v2/issues>
