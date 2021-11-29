const CryptoJS = require("crypto-js");
const request = require("request-promise-native");
const qs = require("qs");

function createNonce() {
  var s = "",
    length = 32;
  do {
    s += Math.random().toString(36).substr(2);
  } while (s.length < length);
  s = s.substr(0, length);
  return s;
}

const getAuthHeader = (
  apiKey,
  apiSecret,
  time,
  nonce,
  organizationId = "",
  request = {}
) => {
  const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, apiSecret);

  hmac.update(apiKey);
  hmac.update("\0");
  hmac.update(time);
  hmac.update("\0");
  hmac.update(nonce);
  hmac.update("\0");
  hmac.update("\0");
  if (organizationId) hmac.update(organizationId);
  hmac.update("\0");
  hmac.update("\0");
  hmac.update(request.method);
  hmac.update("\0");
  hmac.update(request.path);
  hmac.update("\0");
  if (request.query)
    hmac.update(
      typeof request.query == "object"
        ? qs.stringify(request.query)
        : request.query
    );
  if (request.body) {
    hmac.update("\0");
    hmac.update(
      typeof request.body == "object"
        ? JSON.stringify(request.body)
        : request.body
    );
  }

  return apiKey + ":" + hmac.finalize().toString(CryptoJS.enc.Hex);
};

class Api {
  constructor({ locale, apiHost, apiKey, apiSecret, orgId }) {
    this.locale = locale || "en";
    this.host = apiHost || "https://api2.nicehash.com";
    this.key = apiKey || null;
    this.secret = apiSecret || null;
    this.org = orgId || null;
    this.localTimeDiff = null;
    this.MinerPrivate = new MinerPrivate(this);
    this.ExternalMiner = new ExternalMiner(this);
    this.HashPower = new HashPower(this);
    this.ExchangePublic = new ExchangePublic(this);
    this.Accounting = new Accounting(this);
  }

  /**
   * @private
   */
  getTime() {
    return request({
      uri: this.host + "/api/v2/time",
      json: true,
    }).then((res) => {
      this.localTimeDiff = res.serverTime - +new Date();
      this.time = res.serverTime;
      return res;
    });
  }

  /**
   * @private
   */
  apiCall(method, path, { query, body, time } = {}) {
    if (this.localTimeDiff === null) {
      return Promise.reject(new Error("Get server time first .getTime()"));
    }

    // query in path
    var [pathOnly, pathQuery] = path.split("?");
    if (pathQuery) query = { ...qs.parse(pathQuery), ...query };

    const nonce = createNonce();
    const timestamp = (time || +new Date() + this.localTimeDiff).toString();
    const options = {
      uri: this.host + pathOnly,
      method: method,
      headers: {
        "X-Request-Id": nonce,
        "X-User-Agent": "NHApiWrapperV2/PascalBerski",
        "X-Time": timestamp,
        "X-Nonce": nonce,
        "X-User-Lang": this.locale,
      },
      qs: query,
      body,
      json: true,
    };
    if (this.key != null) {
      options.headers["X-Auth"] = getAuthHeader(
        this.key,
        this.secret,
        timestamp,
        nonce,
        this.org,
        {
          method,
          path: pathOnly,
          query,
          body,
        }
      );
      options.headers["X-Organization-Id"] = this.org;
    }

    return request(options);
  }
  /**
   * @private
   */
  get(path, options) {
    return this.apiCall("GET", path, options);
  }
  /**
   * @private
   */
  post(path, options) {
    return this.apiCall("POST", path, options);
  }
  /**
   * @private
   */
  put(path, options) {
    return this.apiCall("PUT", path, options);
  }
  /**
   * @private
   */
  delete(path, options) {
    return this.apiCall("DELETE", path, options);
  }
  /**
   * @private
   */
  async getRequest(url) {
    var ret = "NULL";

    await this.getTime()
      .then(() => this.get(url))
      .then((res) => {
        ret = res;
      })
      .catch((err) => {
        if (err && err.response)
          console.error(
            err.response.request.method,
            err.response.request.uri.href
          );
        console.error("ERROR", err.error || err);
      });
    return ret;
  }
  /**
   * @private
   */
  async postRequest(url, body) {
    var ret = "NULL";

    await this.getTime()
      .then(() => this.post(url, { body }))
      .then((res) => {
        ret = res;
      })
      .catch((err) => {
        if (err && err.response)
          console.error(
            err.response.request.method,
            err.response.request.uri.href
          );
        console.error("ERROR", err.error || err);
      });
    return ret;
  }
  /**
   * @private
   */
  async putRequest(url, body) {
    var ret = "NULL";

    await this.getTime()
      .then(() => this.put(url, { body }))
      .then((res) => {
        ret = res;
      })
      .catch((err) => {
        if (err && err.response)
          console.error(
            err.response.request.method,
            err.response.request.uri.href
          );
        console.error("ERROR", err.error || err);
      });
    return ret;
  }
  /**
   * @private
   */
  async deleteRequest(url) {
    var ret = "NULL";

    await this.getTime()
      .then(() => this.delete(url))
      .then((res) => {
        ret = res;
      })
      .catch((err) => {
        if (err && err.response)
          console.error(
            err.response.request.method,
            err.response.request.uri.href
          );
        console.error("ERROR", err.error || err);
      });
    return ret;
  }
  /**
   * @private
   */
  buildQuery(parameters = []) {
    var first = true;
    var query = "";

    parameters.forEach((element) => {
      if (element.value != undefined) {
        if (first) {
          query += "?";
          first = false;
        } else query += "&";
        query += element.key + "=" + element.value;
      }
    });

    return query;
  }
}

class Accounting {
  constructor(api) {
    this.api = api;
  }

  /**
   * Get balance for selected currency.
   * @permission VBTD
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-accounting-account2-currency
   */
  async getBalance(currency, extendedResponse = false) {
    const query = this.api.buildQuery([
      { key: "extendedResponse", value: extendedResponse },
    ]);

    var url = `/main/api/v2/accounting/account2/${currency}`;
    return await this.api.getRequest(url + query);
  }

  /**
   * Get total balance and for each currency separated.
   * @permission VBTD
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-accounting-accounts2
   */
  async getBalances(extendedResponse = false, fiat = undefined) {
    const query = this.api.buildQuery([
      { key: "extendedResponse", value: extendedResponse },
      { key: "fiat", value: fiat },
    ]);

    var url = `/main/api/v2/accounting/accounts2`;
    return await this.api.getRequest(url + query);
  }

  /**
   * Get activities for specified currency matching the filtering criteria as specified by request parameters.
   * @permission VBTD
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-accounting-activity-currency
   */
  async getActivities(
    currency,
    type = undefined,
    timestamp = undefined,
    stage = "ALL",
    limit = 10
  ) {
    const query = this.api.buildQuery([
      { key: "type", value: type },
      { key: "timestamp", value: timestamp },
      { key: "stage", value: stage },
      { key: "limit", value: limit },
    ]);

    var url = `/main/api/v2/accounting/activity/${currency}`;
    return await this.api.getRequest(url + query);
  }

  /**
   * Get deposit address for selected currency for all wallet types.
   * @permission VBTD
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-accounting-depositAddresses
   */
  async getDepositAddresses(currency, walletType = undefined) {
    const query = this.api.buildQuery([
      { key: "currency", value: currency },
      { key: "walletType", value: walletType },
    ]);

    var url = `/main/api/v2/accounting/depositAddresses`;
    return await this.api.getRequest(url + query);
  }

  /**
   * List of deposit transactions details matching the filtering criteria as specified by request parameters.
   * @permission VBTD
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-accounting-deposits-currency
   */
  async getDeposits(
    currency,
    statuses = undefined,
    op = "LT",
    timestamp = undefined,
    page = 0,
    size = 100
  ) {
    const query = this.api.buildQuery([
      { key: "statuses", value: statuses },
      { key: "op", value: op },
      { key: "timestamp", value: timestamp },
      { key: "page", value: page },
      { key: "size", value: size },
    ]);

    var url = `/main/api/v2/accounting/deposits/${currency}`;
    return await this.api.getRequest(url + query);
  }

  /**
   * Get specific deposit with deposit order id and currency.
   * @permission VBTD
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-accounting-deposits2-currency-id
   */
  async getDeposit(currency, id) {
    var url = `/main/api/v2/accounting/deposits2/${currency}/${id}`;
    return await this.api.getRequest(url);
  }

  /**
   * Get all transaction for selected exchange order using exchange order id and market pair.
   * @permission EXOR
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-accounting-exchange-id-trades
   */
  async getExchangeOrderTransactions(id, exchangeMarket) {
    const query = this.api.buildQuery([
      { key: "exchangeMarket", value: exchangeMarket },
    ]);

    var url = `/main/api/v2/accounting/exchange/${id}/trades`;
    return await this.api.getRequest(url + query);
  }

  /**
   * List of all transactions for selected hashpower order using hashpower order.
   * @permission VHOR
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-accounting-hashpower-id-transactions
   */
  async getHashpowerOrderTransactions(id, limit = 100, timestamp = undefined) {
    const query = this.api.buildQuery([
      { key: "limit", value: limit },
      { key: "timestamp", value: timestamp },
    ]);

    var url = `/main/api/v2/accounting/hashpower/${id}/transactions`;
    return await this.api.getRequest(url + query);
  }

  /**
   * Get list of mining payments
   * @permission VBTD
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-accounting-hashpowerEarnings-currency
   */
  async getHashpowerEarnings(
    currency,
    timestamp = undefined,
    page = 0,
    size = 100
  ) {
    const query = this.api.buildQuery([
      { key: "page", value: page },
      { key: "size", value: size },
      { key: "timestamp", value: timestamp },
    ]);

    var url = `/main/api/v2/accounting/hashpowerEarnings/${currency}`;
    return await this.api.getRequest(url + query);
  }

  /**
   * Get transaction by transaciton id and currency.
   * @permission VBTD
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-accounting-transaction-currency-transactionId
   */
  async getTransaction(currency, transactionId) {
    var url = `/main/api/v2/accounting/transaction/${currency}/${transactionId}`;
    return await this.api.getRequest(url);
  }

  /**
   * Get all transactions for selected currency matching the filtering criteria as specified by request parameters.
   * @permission VBTD
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-accounting-transactions-currency
   */
  async getTransactions(
    currency,
    type = undefined,
    purposes = undefined,
    op = undefined,
    timestamp = undefined,
    size = 10
  ) {
    const query = this.api.buildQuery([
      { key: "type", value: type },
      { key: "size", value: size },
      { key: "timestamp", value: timestamp },
      { key: "purposes", value: purposes },
      { key: "op", value: op },
    ]);

    var url = `/main/api/v2/accounting/transactions/${currency}`;
    return await this.api.getRequest(url + query);
  }

  /**
   * Get account withdrawal by currency and id.
   * @permission VBTD
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-accounting-withdrawal2-currency-id
   */
  async getWithdrawal(currency, id) {
    var url = `/main/api/v2/accounting/withdrawal2/${currency}/${id}`;
    return await this.api.getRequest(url);
  }

  /**
   * Get withdrawal address by widrawal address id.
   * @permission WIFU
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-accounting-withdrawalAddress-id
   */
  async getWithdrawalAddress(id) {
    var url = `/main/api/v2/accounting/withdrawalAddress/${id}`;
    return await this.api.getRequest(url);
  }

  /**
   * Get all transactions for selected currency matching the filtering criteria as specified by request parameters.
   * @permission VBTD
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-accounting-transactions-currency
   */
  async getWithdrawalAddresses(
    currency = undefined,
    type = undefined,
    size = 100,
    page = 0
  ) {
    const query = this.api.buildQuery([
      { key: "type", value: type },
      { key: "size", value: size },
      { key: "currency", value: currency },
      { key: "page", value: page },
    ]);

    var url = `/main/api/v2/accounting/withdrawalAddresses`;
    return await this.api.getRequest(url + query);
  }

  /**
   * Get list of withdrawals matching the filtering criteria as specified by request parameters.
   * @permission VBTD
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-accounting-withdrawals-currency
   */
  async getWithdrawals(
    currency = undefined,
    statuses = undefined,
    op = "LT",
    timestamp = undefined,
    size = 100,
    page = 0
  ) {
    const query = this.api.buildQuery([
      { key: "op", value: op },
      { key: "size", value: size },
      { key: "statuses", value: statuses },
      { key: "page", value: page },
      { key: "timestamp", value: timestamp },
    ]);

    var url = `/main/api/v2/accounting/withdrawals/${currency}`;
    return await this.api.getRequest(url + query);
  }

  /**
   * Create withdrawal request with whitelisted address using withdraw address id.
   * @permission WIFU
   * @description https://www.nicehash.com/docs/rest/post-main-api-v2-accounting-withdrawal
   */
  async createWithdrawal(currency, amount, withdrawalAddressId) {
    return await this.api.postRequest(`/main/api/v2/accounting/withdrawal`, {
      currency: currency,
      amount: amount,
      withdrawalAddressId: withdrawalAddressId,
    });
  }

  /**
   * Cancel withdrawal using withdrawal id and currency.
   * @permission WIFU
   * @description https://www.nicehash.com/docs/rest/delete-main-api-v2-accounting-withdrawal-currency-id
   */
  async cancelWithdrawal(currency, id) {
    var url = `/main/api/v2/accounting/withdrawal/${currency}/${id}`;
    return await this.api.deleteRequest(url);
  }
}

class MinerPrivate {
  constructor(api) {
    this.api = api;
  }

  /**
   * Getting mining address.
   * @permission VMDS
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-miningAddress
   */
  async getMiningAddress() {
    return await this.api.getRequest("/main/api/v2/mining/miningAddress");
  }

  /**
   * List mining algos with basic statistics for organization (and for rig id if specified).
   * @permission VMDS
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-algo-stats
   */
  async getRigStatsAlgo(rigid = undefined) {
    if (rigid)
      return await this.api.getRequest(
        "/main/api/v2/mining/algo/stats?rigId=" + rigid
      );
    else return await this.api.getRequest("/main/api/v2/mining/algo/stats");
  }

  /**
   * List of groups with list of rigs in the groups. When extendedResponse is set to true, response contains number of total and active devices for each rig and group.
   * @permission VMDS
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-groups-list
   */
  async getGroupsList(extendedResponse = false) {
    return await this.api.getRequest(
      "/main/api/v2/mining/groups/list?extendedResponse=" + extendedResponse
    );
  }

  /**
   * Get statistical streams for selected rigs and selected algorithm.
   * @permission VMDS
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-rig-stats-algo
   */
  async getRigStatsAlgoStream(
    rigid,
    algorithm = 20,
    afterTimestamp = undefined,
    beforeTimestamp = undefined
  ) {
    var url =
      "/main/api/v2/mining/rig/stats/algo?rigId=" +
      rigid +
      "&algorithm=" +
      algorithm;
    if (afterTimestamp) url += "&afterTimestamp=" + afterTimestamp;
    if (beforeTimestamp) url += "&beforeTimestamp=" + beforeTimestamp;
    return await this.api.getRequest(url);
  }

  /**
   * Get statistical streams for selected rig.
   * @permission VMDS
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-rig-stats-unpaid
   */
  async getRigStatsUnpaidStream(
    rigid,
    afterTimestamp = undefined,
    beforeTimestamp = undefined
  ) {
    var url = "/main/api/v2/mining/rig/stats/unpaid?rigId=" + rigid;
    if (afterTimestamp) url += "&afterTimestamp=" + afterTimestamp;
    if (beforeTimestamp) url += "&beforeTimestamp=" + beforeTimestamp;
    return await this.api.getRequest(url);
  }

  /**
   * Get mining rig detailed information for selected rig.
   * @permission VMDS
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-rig2-rigId
   */
  async getRigInformation(rigid) {
    return await this.api.getRequest("/main/api/v2/mining/rig2/" + rigid);
  }

  /**
   * Get a list of active worker.
   * @permission VMDS
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-rigs-activeWorkers
   */
  async getActiveWorkers(
    size = 100,
    page = 0,
    sortParameter = "RIG_NAME",
    sortDirection = "ASC"
  ) {
    return await this.api.getRequest(
      `/main/api/v2/mining/rigs/activeWorkers?size=${size}&page=${page}&sortParameter=${sortParameter}&sortDirection=${sortDirection}`
    );
  }

  /**
   * Get list of payouts.
   * @permission VBTD
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-rigs-payouts
   */
  async getPayouts(size = 10, page = 0, beforeTimestamp = undefined) {
    var url = `/main/api/v2/mining/rigs/payouts?size=${size}&page=${page}`;
    if (beforeTimestamp) url += "&beforeTimestamp=" + beforeTimestamp;
    return await this.api.getRequest(url);
  }

  /**
   * Get statistical streams for all mining rigs for selected algorithm.
   * @permission VMDS
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-rigs-stats-algo
   */
  async getStatsAlgoStream(
    algorithm = 20,
    afterTimestamp = undefined,
    beforeTimestamp = undefined
  ) {
    var url = `/main/api/v2/mining/rigs/payouts?algorithm=${algorithm}`;
    if (afterTimestamp) url += "&afterTimestamp=" + afterTimestamp;
    if (beforeTimestamp) url += "&beforeTimestamp=" + beforeTimestamp;
    return await this.api.getRequest(url);
  }

  /**
   * Get statistical streams for all mining rigs.
   * @permission VMDS
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-rigs-stats-unpaid
   */
  async getStatsUnpaidStream(
    afterTimestamp = undefined,
    beforeTimestamp = undefined
  ) {
    var url = `/main/api/v2/mining/rigs/payouts`;
    if (afterTimestamp) url += "?afterTimestamp=" + afterTimestamp;
    if (beforeTimestamp) {
      if (afterTimestamp) url += "&beforeTimestamp=" + beforeTimestamp;
      else url += "?beforeTimestamp=" + beforeTimestamp;
    }
    return await this.api.getRequest(url);
  }

  /**
   * Update status for one or more rigs.
   * @param parameters group, rigId, deviceId, action, options
   * @permission MARI
   * @description https://www.nicehash.com/docs/rest/post-main-api-v2-mining-rigs-status2
   */
  async setRigs(parameters) {
    return await this.api.postRequest(
      "/main/api/v2/mining/rigs/status2",
      parameters
    );
  }

  /**
   * List rigs and their statuses.
   * @permission VMDS
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-rigs2
   */
  async getRigs(
    size = 25,
    page = 0,
    path = undefined,
    sort = "NAME",
    system = undefined,
    status = undefined
  ) {
    const query = this.api.buildQuery([
      { key: "size", value: size },
      { key: "page", value: page },
      { key: "path", value: path },
      { key: "sort", value: sort },
      { key: "system", value: system },
      { key: "status", value: status },
    ]);
    return await this.api.getRequest("/main/api/v2/mining/rigs2" + query);
  }
}

class ExternalMiner {
  constructor(api) {
    this.api = api;
  }

  /**
   * List rig statuses for external miner.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-external-btcAddress-rigs2
   */
  async getRigs(btcAddress, size = 25, page = 0, sort = "NAME") {
    const query = this.api.buildQuery([
      { key: "size", value: size },
      { key: "page", value: page },
      { key: "sort", value: sort },
    ]);
    return await this.api.getRequest(
      "/main/api/v2/mining/external/" + btcAddress + "/rigs2" + query
    );
  }

  /**
   * Getting active workers and information about active workers on external miner, such as current mining algorithm, speed, profitability, etc.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-external-btcAddress-rigs-activeWorkers
   */
  async getActiveWorkers(
    btcAddress,
    size = 25,
    page = 0,
    sortParameter = "RIG_NAME",
    sortDirection = "ASC"
  ) {
    const query = this.api.buildQuery([
      { key: "size", value: size },
      { key: "page", value: page },
      { key: "sortParameter", value: sortParameter },
      { key: "sortDirection", value: sortDirection },
    ]);
    return await this.api.getRequest(
      "/main/api/v2/mining/external/" +
        btcAddress +
        "/rigs/activeWorkers" +
        query
    );
  }

  /**
   * Get statistical streams for all mining rigs with external BTC address for selected algorithm.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-external-btcAddress-rigs-stats-algo
   */
  async getStatsAlgoStream(
    btcAddress,
    algorithm = 20,
    afterTimestamp = null,
    beforeTimestamp = null
  ) {
    const query = this.api.buildQuery([
      { key: "algorithm", value: algorithm },
      { key: "afterTimestamp", value: afterTimestamp },
      { key: "beforeTimestamp", value: beforeTimestamp },
    ]);
    return await this.api.getRequest(
      "/main/api/v2/mining/external/" + btcAddress + "/rigs/stats/algo" + query
    );
  }

  /**
   * Get statistical streams for all mining rigs with external BTC address.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-external-btcAddress-rigs-stats-unpaid
   */
  async getStatsUnpaidStream(
    btcAddress,
    afterTimestamp = null,
    beforeTimestamp = null
  ) {
    const query = this.api.buildQuery([
      { key: "afterTimestamp", value: afterTimestamp },
      { key: "beforeTimestamp", value: beforeTimestamp },
    ]);
    return await this.api.getRequest(
      "/main/api/v2/mining/external/" +
        btcAddress +
        "/rigs/stats/unpaid" +
        query
    );
  }

  /**
   * External miner withdrawal list.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-external-btcAddress-rigs-withdrawals
   */
  async getWithdrawals(
    btcAddress,
    afterTimestamp = null,
    size = 100,
    page = 0
  ) {
    const query = this.api.buildQuery([
      { key: "afterTimestamp", value: afterTimestamp },
      { key: "size", value: size },
      { key: "page", value: page },
    ]);
    return await this.api.getRequest(
      "/main/api/v2/mining/external/" + btcAddress + "/rigs/withdrawals" + query
    );
  }
}

class HashPower {
  constructor(api) {
    this.api = api;
  }

  /**
   * Get a list of my hashpower orders matching the filtering criteria as specified by parameters included in the request.
   * @permission VHOR
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-hashpower-myOrders
   */
  async getMyOrders(
    op = "GT",
    limit = 100,
    ts = undefined,
    algorithm = undefined,
    status = undefined,
    active = undefined,
    market = undefined
  ) {
    const date = new Date();

    function seconds_since_epoch(d) {
      return Math.floor(d / 1);
    }

    if (ts == undefined) ts = seconds_since_epoch(date);

    const query = this.api.buildQuery([
      { key: "op", value: op },
      { key: "limit", value: limit },
      { key: "algorithm", value: algorithm },
      { key: "ts", value: ts },
      { key: "status", value: status },
      { key: "active", value: active },
      { key: "market", value: market },
    ]);

    var url = `/main/api/v2/hashpower/myOrders`;
    return await this.api.getRequest(url + query);
  }

  /**
   * Create hashpower order.
   * @permission PRCO
   * @description https://www.nicehash.com/docs/rest/post-main-api-v2-hashpower-order
   */
  async createOrder(parameters) {
    return await this.api.postRequest(
      "/main/api/v2/hashpower/order",
      parameters
    );
  }

  /**
   * Get hashpower order detailed information using order id.
   * @permission VHOR
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-hashpower-order-id
   */
  async getOrder(id) {
    var url = `/main/api/v2/hashpower/order/${id}`;
    return await this.api.getRequest(url);
  }

  /**
   * Cancel hashpower order using order id.
   * @permission PRCO
   * @description https://www.nicehash.com/docs/rest/delete-main-api-v2-hashpower-order-id
   */
  async deleteOrder(id) {
    var url = `/main/api/v2/hashpower/order/${id}`;
    return await this.api.deleteRequest(url);
  }

  /**
   * When order is active, amount on the order can be increased and prolong duration of active order in marketplace. The limitation for minimal and maximal amount are defined for each algorithm and can be fetched using /main/api/v2/public/buy/info endpoint.
   * @permission PRCO
   * @description https://www.nicehash.com/docs/rest/post-main-api-v2-hashpower-order-id-refill
   */
  async refillOrder(id, amount) {
    return await this.api.postRequest(
      `/main/api/v2/hashpower/order/${id}/refill`,
      { amount: amount }
    );
  }

  /**
   * Get statistical streams for selected order using order id.
   * @permission VHOR
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-hashpower-order-id-stats
   */
  async getOrderStats(id, afterTimestamp = undefined) {
    const query = this.api.buildQuery([
      { key: "afterTimestamp", value: afterTimestamp },
    ]);

    var url = `/main/api/v2/hashpower/order/${id}/stats`;
    return await this.api.getRequest(url + query);
  }

  /**
   * At any time order speed limit and price can be altered when hashpower order is active.
   * @permission ELCO
   * @description https://www.nicehash.com/docs/rest/post-main-api-v2-hashpower-order-id-updatePriceAndLimit
   */
  async updatePriceAndLimit(id, parameters) {
    return await this.api.postRequest(
      `/main/api/v2/hashpower/order/${id}/updatePriceAndLimit`,
      parameters
    );
  }

  /**
   * Estimated duration of a hashpower order from the order type, amount, price and limit. The maximal value for STANDARD order is 10 days
   * @permission PRCO
   * @description https://www.nicehash.com/docs/rest/post-main-api-v2-hashpower-orders-calculateEstimateDuration
   */
  async calculateEstimateDuration(parameters) {
    return await this.api.postRequest(
      `/main/api/v2/hashpower/orders/calculateEstimateDuration`,
      parameters
    );
  }

  /**
   * Hashpower order book for specified algorithm. Response contains orders for all markest and their stats. When there a lot of orders, response will be paged.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-hashpower-orderBook
   */
  async getOrderBook(algorithm, size = 100, page = 0) {
    const query = this.api.buildQuery([
      { key: "algorithm", value: algorithm },
      { key: "size", value: size },
      { key: "page", value: page },
    ]);

    var url = `/main/api/v2/hashpower/orderBook`;
    return await this.api.getRequest(url + query);
  }

  /**
   * Get accepted and rejected speeds for rigs and pools, rig count and paying price for selected market and/or algorithm. When no market or algorithm is specified all markets and algorithms are returned.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-hashpower-orders-summaries
   */
  async getOrderSummaries(market = undefined, algorithm = undefined) {
    const query = this.api.buildQuery([
      { key: "algorithm", value: algorithm },
      { key: "market", value: market },
    ]);

    var url = `/main/api/v2/hashpower/orders/summaries`;
    return await this.api.getRequest(url + query);
  }

  /**
   * Get accepted and rejected speed from pools and rigs, rig count and paying price for selected market and algorithm.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-hashpower-orders-summary
   */
  async getOrderSummary(market, algorithm) {
    const query = this.api.buildQuery([
      { key: "algorithm", value: algorithm },
      { key: "market", value: market },
    ]);

    var url = `/main/api/v2/hashpower/orders/summary`;
    return await this.api.getRequest(url + query);
  }

  /**
   * Whole history for the selected algorithm.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-public-algo-history
   */
  async getAlgoHistory(algorithm) {
    const query = this.api.buildQuery([{ key: "algorithm", value: algorithm }]);

    var url = `/main/api/v2/public/algo/history`;
    return await this.api.getRequest(url + query);
  }

  /**
   * Information for each enabled algorithm needed for buying hashpower.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-public-buy-info
   */
  async getBuyInfo() {
    var url = `/main/api/v2/public/buy/info`;
    return await this.api.getRequest(url);
  }

  /**
   * Get all hashpower orders. Request parameter work as filter to fine tune the result. The result is paged, when needed.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-public-orders
   */
  async getOrders(
    algorithm = undefined,
    market = undefined,
    op = undefined,
    timestamp = undefined,
    page = 0,
    size = 100
  ) {
    const query = this.api.buildQuery([
      { key: "algorithm", value: algorithm },
      { key: "market", value: market },
      { key: "op", value: op },
      { key: "timestamp", value: timestamp },
      { key: "page", value: page },
      { key: "size", value: size },
    ]);

    var url = `/main/api/v2/public/orders`;
    return await this.api.getRequest(url + query);
  }

  /**
   * Get information about speed and price for each enabled algorithm.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-public-simplemultialgo-info
   */
  async getSimpleStatus() {
    var url = `/main/api/v2/public/simplemultialgo/info`;
    return await this.api.getRequest(url);
  }

  /**
   * Get average price and hashpower speed for all enabled algorithms in average for past 24 hours.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-public-stats-global-24h
   */
  async getStats24h() {
    var url = `/main/api/v2/public/stats/global/24h`;
    return await this.api.getRequest(url);
  }

  /**
   * Get current price and hashpower speed for all enabled algorithms in average for last 5 minutes.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-public-stats-global-current
   */
  async getStatsCurrent() {
    var url = `/main/api/v2/public/stats/global/current`;
    return await this.api.getRequest(url);
  }
}

class ExchangePublic {
  constructor(api) {
    this.api = api;
  }

  /**
   * Get candlesticks for specified resolution.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-exchange-api-v2-info-candlesticks
   */
  async getCandlesticks(
    market,
    to = undefined,
    from = undefined,
    countBack = undefined,
    resolution = 1
  ) {
    const date = new Date();

    function seconds_since_epoch(d) {
      return Math.floor(d / 1);
    }

    if (to == undefined) to = seconds_since_epoch(date);

    const query = this.api.buildQuery([
      { key: "market", value: market },
      { key: "to", value: to },
      { key: "from", value: from },
      { key: "countBack", value: countBack },
      { key: "resolution", value: resolution },
    ]);

    var url = `/exchange/api/v2/info/candlesticks`;
    return await this.api.getRequest(url + query);
  }

  /**
   * Get statistics for all markets.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-exchange-api-v2-info-marketStats
   */
  async getMarketStats() {
    var url = `/exchange/api/v2/info/marketStats`;
    return await this.api.getRequest(url);
  }

  /**
   * Get list of last prices for all markets.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-exchange-api-v2-info-prices
   */
  async getPrices() {
    var url = `/exchange/api/v2/info/prices`;
    return await this.api.getRequest(url);
  }

  /**
   * Get detailed exchange status information for each market.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-exchange-api-v2-info-status
   */
  async getExchangeStatus() {
    var url = `/exchange/api/v2/info/status`;
    return await this.api.getRequest(url);
  }

  /**
   * Get trades for specific market. Limit, sort direction and timestamp can be optionally selected.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-exchange-api-v2-info-trades
   */
  async getTrades(
    market,
    sortDirection = "DESC",
    limit = 25,
    timestamp = undefined
  ) {
    const query = this.api.buildQuery([
      { key: "market", value: market },
      { key: "sortDirection", value: sortDirection },
      { key: "limit", value: limit },
      { key: "timestamp", value: timestamp },
    ]);

    var url = `/exchange/api/v2/info/trades`;
    return await this.api.getRequest(url + query);
  }

  /**
   * Get a list of asks and bids. Limit determines the size of asks and bids lists.
   * @permission none
   * @description https://www.nicehash.com/docs/rest/get-exchange-api-v2-orderbook
   */
  async getOrderbook(market, limit = 25) {
    const query = this.api.buildQuery([
      { key: "market", value: market },
      { key: "limit", value: limit },
    ]);

    var url = `/exchange/api/v2/orderbook`;
    return await this.api.getRequest(url + query);
  }
}

module.exports = Api;
