const httpClient = require("../utils/httpClient.js");

module.exports = class FOFASearcher {
  constructor(address, email, api_key) {
    this.address = address;
    this.email = email;
    this.api_key = api_key;
    this.http = httpClient.create({
      baseURL: this.address,
      headers: {},
    });
  }

  async getMy() {
    let self = this;
    let params = { email: self.email, key: self.api_key };
    let response = await self.http.get("/api/v1/info/my", { params: params });
    return response.data;
  }

  async searchAll(
    query,
    options = {
      page: 1,
      size: 1000,
      fields: "host,ip,port,protocol,country_name,fid",
      full: false,
    }
  ) {
    let self = this;
    let params = {
      qbase64: btoa(query),
      page: options.page || 1,
      size: options.size || 1000,
      fields: options.fields || "host,ip,port,protocol,country_name,fid",
      full: options.full || false,
      email: self.email,
      key: self.api_key,
    };
    let response = await self.http.get("/api/v1/search/all", {
      params: params,
    });
    return response.data;
  }
};
