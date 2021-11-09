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
    this.key = apiKey;
    this.secret = apiSecret;
    this.org = orgId;
    this.localTimeDiff = null;
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
        "X-User-Agent": "NHNodeClient",
        "X-Time": timestamp,
        "X-Nonce": nonce,
        "X-User-Lang": this.locale,
        "X-Organization-Id": this.org,
        "X-Auth": getAuthHeader(
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
        ),
      },
      qs: query,
      body,
      json: true,
    };

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
      .then(() => this.post(url, body))
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

  ////*  MINER PRIVATE  *////

  /**
   * Getting mining address.
   * @permission VMDS
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-miningAddress
   */
  async getMiningAddress() {
    return await this.getRequest("/main/api/v2/mining/miningAddress");
  }

  /**
   * List mining algos with basic statistics for organization (and for rig id if specified).
   * @permission VMDS
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-algo-stats
   */
  async getRigStatsAlgo(rigid = undefined) {
    if (rigid)
      return await this.getRequest(
        "/main/api/v2/mining/algo/stats?rigId=" + rigid
      );
    else return await this.getRequest("/main/api/v2/mining/algo/stats");
  }

  /**
   * List of groups with list of rigs in the groups. When extendedResponse is set to true, response contains number of total and active devices for each rig and group.
   * @permission VMDS
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-groups-list
   */
  async getGroupsList(extendedResponse = false) {
    return await this.getRequest(
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
    return await this.getRequest(url);
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
    return await this.getRequest(url);
  }

  /**
   * Get mining rig detailed information for selected rig.
   * @permission VMDS
   * @description https://www.nicehash.com/docs/rest/get-main-api-v2-mining-rig2-rigId
   */
  async getRigInformation(rigid) {
    return await this.getRequest("/main/api/v2/mining/rig2/" + rigid);
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
    return await this.getRequest(
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
    return await this.getRequest(url);
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
    return await this.getRequest(url);
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
    return await this.getRequest(url);
  }

  //TODO: post status2
  /**
   * Update status for one or more rigs.
   * @param parameters group, rigId, deviceId, action, options
   * @permission MARI
   * @description https://www.nicehash.com/docs/rest/post-main-api-v2-mining-rigs-status2
   */
  async setRigs(parameters) {
    console.log(JSON.parse(parameters));
    return await this.postRequest(
      "/main/api/v2/mining/rigs/status2",
      JSON.parse(parameters)
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
    const query = this.buildQuery([
      { key: "size", value: size },
      { key: "page", value: page },
      { key: "path", value: path },
      { key: "sort", value: sort },
      { key: "system", value: system },
      { key: "status", value: status },
    ]);
    return await this.getRequest("/main/api/v2/mining/rigs2" + query);
  }
}

module.exports = Api;
