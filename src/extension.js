const httpClient = require("./utils/httpClient.js");
const common = require("./utils/common.js");

const fs = require("fs");
const path = require("path");

function init_class({
  awvs_address,
  awvs_api_key,
  fofa_address,
  fofa_email,
  fofa_api_key,
}) {
  class Utils {
    constructor() {
      let self = this;
      self.http = httpClient.create({ headers: {} });
      self.fs = fs;
      self.path = path;
      for (let key in common) {
        self[key] = common[key];
      }

      let t_path = common
        .stripRight(__dirname, self.path.sep)
        .split(self.path.sep);
      self.pathlist = { root: t_path.slice(0, -1).join(self.path.sep) };
      self.pathlist.data = self.path.join(self.pathlist.root, "datadir");
      self.pathlist.cache = self.path.join(self.pathlist.root, "cache");
      self.pathlist.config = self.path.join(self.pathlist.cache, "config.json");
      for (let key in self.pathlist) {
        let t_path = self.pathlist[key].split(self.path.sep);
        let filename = t_path[t_path.length - 1];
        if (filename.split(".").length > 1) {
          continue;
        }
        if (!common.isDir(self.pathlist[key])) {
          fs.mkdirSync(self.pathlist[key]);
        }
      }

      let content = common.fileRead(self.pathlist.config);
      let raw_config = {};
      if (content) {
        raw_config = JSON.parse(content);
      }
      self.config = common.objectUpdate(
        {
          menus: {
            exportPanel: { name: "导出", isactive: true },
            scanPanel: { name: "扫描", isactive: false },
            searchPanel: { name: "搜索", isactive: false },
          },
          exportColumns: {
            ip: { label: "IP", ischecked: true },
            mac: { label: "MAC", ischecked: false },
            os: { label: "操作系统", ischecked: false },
            hostname: { label: "主机名", ischecked: false },
            tags: { label: "标签", ischecked: false },
            port: { label: "端口", ischecked: true },
            protocol: { label: "应用协议", ischecked: false },
            baseprotocol: { label: "传输协议", ischecked: false },
          },
          scanColumns: {
            awvs: { label: "AWVS", isable: false, ischecked: false },
          },
          searchColumns: {
            fofa: {
              key: "full",
              label: "仅一年内数据",
              isable: true,
              ischecked: true,
            },
          },
          cache: {
            awvs: {
              target_infos: {},
              progress: 0,
              high: 0,
              medium: 0,
              low: 0,
              info: 0,
            },
            fofa: {
              query: "",
              results: [],
              resultsSelected: [],
              pageSizeList: [10, 20, 50, 100, 200, 500, 1000, 2000],
              pageSize: 50,
              pageCurr: 1,
              pageList: [],
              pageTotal: [],
            },
          },
        },
        raw_config
      );

      content = common.fileRead(
        self.path.join(self.pathlist.cache, "awvs_cache.json")
      );
      if (content) {
        self.config.cache.awvs = common.objectUpdate(
          self.config.cache.awvs,
          JSON.parse(content)
        );
      }

      self.config.exportColumns.ip.ischecked = true;
      self.config.exportColumns.port.ischecked = true;

      self.awvs = new AWVSScanner(awvs_address, awvs_api_key);
      self.fofa = new FOFASearcher(fofa_address, fofa_email, fofa_api_key);
    }
    async isAbleChecker(system_name) {
      let self = this;
      let config = goby.getConfiguration();
      system_name = system_name.toLowerCase();
      if (system_name === "awvs") {
        // 调用后检查 config.scanColumns.awvs.isable 的值
        let awvs_api_key = config["AWVS API KEY"].default.trim();
        let awvs_address = config["AWVS ADDRESS"].default.trim();
        self.awvs = new AWVSScanner(awvs_address, awvs_api_key);
        if (!self.awvs.address || !self.awvs.headers["x-auth"]) {
          self.config.scanColumns.awvs.isable = false;
          self.config.scanColumns.awvs.ischecked = false;
          console.log("无法检测到AWVS，请配置正确的API密钥、API地址");
          return false;
        }

        let ret = await self.awvs.getMe();
        if (!ret.enabled) {
          self.config.scanColumns.awvs.isable = false;
          self.config.scanColumns.awvs.ischecked = false;
          console.log("无法检测到AWVS，请确认AWVS可正常连接再尝试");
          return false;
        }
        self.config.scanColumns.awvs.isable = true;
      }
      if (system_name === "fofa") {
        let fofa_address = config["FOFA ADDRESS"].default.trim();
        let fofa_api_key = config["FOFA API KEY"].default.trim();
        let fofa_email = config["FOFA EMAIL"].default.trim();
        self.awvs = new FOFASearcher(fofa_address, fofa_email, fofa_api_key);
        self.config.searchColumns.fofa.isable = true;
      }
    }
  }

  class AWVSScanner {
    constructor(address, api_key) {
      this.address = address;
      this.headers = {
        "x-auth": api_key,
        // "content-type": "application/json",
      };
      this.http = httpClient.create({
        baseURL: this.address,
        headers: this.headers,
      });
    }

    async getMe() {
      let response = await this.http.get("/api/v1/me");
      return response.data;
    }

    async getInfo() {
      let response = await this.http.get("/api/v1/info");
      return response.data;
      // 返回信息样例
      // {"acumonitor":false,"build_number":"200217097","license":{"access":true,"activated":true,"email":"test@test.com","error":null,"expired":false,"expires":"false","features":["pause_resume","compliance_reports","target_business_criticality","network_scans","export_waf","updates","multi_user","offline_activations","multi_engine","api_key","target_groups","trending_graphs","vuln_retest","scanning_profiles","continuous_scans","bug_tracking_integration","acumonitor"],"grace_period_end":null,"license_key":"Cracked-By-nszy007-Funning","limits":{"demo_targets":5,"standard_targets":999999,"engines":999999,"users":null},"maintenance_expired":false,"maintenance_expires":"2099-10-01T20:17:52","product_code":"AOPENT"},"licensing_extra":{"extra_std_target_count":0,"extra_user_count":0,"can_create_new_std_target":true,"can_create_new_demo_target":true,"can_create_new_user":true,"target_deletion_allowance":2,"unique_std_target_count":19,"unique_net_target_count":0,"user_count":1},"major_version":"13","max_network_scan_time":2880,"max_web_scan_time":2880,"minor_version":"0","update_info":{"build_number":"-","major_version":"12","minor_version":"-","new_update":false,"update_status":"none"}}
      //     }
      //   );
    }

    // 打算弃用，统一使用 postTargets
    async postTarget(
      address,
      options = {
        description: "RelaxHelper Task",
        type: "default",
        criticality: 10,
      }
    ) {
      options.description = options.description || "RelaxHelper Task";
      options.type = options.type || "default";
      options.criticality = options.criticality || 10;

      let args = common.deepClone(options);
      args.address = address;
      let response = await this.http.post("/api/v1/targets", args);
      return response.data;
    }

    async getTargets(
      options = {
        start: 0,
        limit: 100,
        query: "",
      }
    ) {
      // limit: 100 > limit > 1
      let ret = {};
      let last_number = options.limit || 100;
      let times = 0;
      if (last_number < 0) {
        let response = await this.http.get("/api/v1/targets", {
          params: { c: 0, l: 3 },
        });
        last_number = response.data.pagination.count;
      }
      let start = options.start || 0;
      while (last_number > 0) {
        let arg_limit = last_number;
        if (last_number > 100) {
          arg_limit = 100;
          last_number -= 100;
        } else {
          last_number = 0;
        }
        let args = { c: start, l: arg_limit, q: options.query || "" };
        let response = await this.http.get("/api/v1/targets", { params: args });
        if (times < 1) {
          ret = response.data;
        } else {
          ret.targets = ret.targets.concat(response.data.targets);
        }
        start += 100;
        times += 1;
      }
      return ret;
    }

    async postTargets(targets, options = { description: "RelaxHelper Task" }) {
      // targets: {"targets":[{"address":"http://127.0.0.1/login","description":"","type":"default","criticality":10}],"groups":["497f6eca-6276-4993-bfeb-53cbbbba6f08"]}
      // targets: {"targets":[{"address":"http://127.0.0.1/login"}]}
      // targets: ["http://127.0.0.1/login"]
      // targets: "http://127.0.0.1/login"
      let self = this;
      let ret = [];
      let t_targets = [];
      if (common.isArray(targets)) {
        if (targets.length < 1) {
          console.warn({
            code: 500,
            message: "传入参数为空",
            api: "POST:/targets/add",
          });
          return [];
        }
        if (common.isString(targets[0])) {
          for (target of targets) {
            t_targets.push({
              address: target,
              description: options.description || "RelaxHelper Task",
            });
          }
        } else {
          t_targets = targets;
        }
      } else if (common.isString(targets)) {
        t_targets = [{ address: targets }];
      } else {
        t_targets = targets.targets;
      }
      // 返回数据：{"targets":[{"address":"http://127.0.0.1/#/login","criticality":10,"description":"","fqdn":"127.0.0.1","type":"default","domain":"111.12.27.236","target_id":"d5f96b2a-b622-49de-997c-b81e1af18818","target_type":null}]}
      let times = 0;
      while (t_targets.length > 0) {
        let args = { targets: [] };
        if (t_targets.length >= 500) {
          args.targets = t_targets.slice(0, 500);
          t_targets = t_targets.slice(500);
        } else {
          args.targets = t_targets;
          t_targets = [];
        }
        let response = await self.http.post("/api/v1/targets/add", args);
        if (times < 1) {
          ret = response.data;
        } else {
          ret.targets = ret.targets.concat(response.data.targets);
        }
        times += 1;
      }
      return ret;
    }

    async deleteTargets(target_id_list) {
      // target_id_list: {"target_id_list":["497f6eca-6276-4993-bfeb-53cbbbba6f08"]}
      // target_id_list: ["497f6eca-6276-4993-bfeb-53cbbbba6f08"]
      let ret;
      let args = { target_id_list: [] };
      let t_target_id_list = [];
      if (common.isArray(target_id_list)) {
        if (target_id_list.length < 1) {
          console.warn({
            code: 500,
            message: "传入参数为空",
            api: "DELETE:/targets",
          });
          return ret;
        }
        t_target_id_list = target_id_list;
      } else if (common.isString(target_id_list)) {
        t_target_id_list.push(target_id_list);
      } else {
        args = target_id_list;
        t_target_id_list = target_id_list.target_id_list;
      }
      while (t_target_id_list.length > 0) {
        if (t_target_id_list.length >= 100) {
          args.target_id_list = t_target_id_list.slice(0, 100);
          t_target_id_list = t_target_id_list.slice(100);
        } else {
          args.target_id_list = t_target_id_list;
          t_target_id_list = [];
        }
        let response = await this.http.post("/api/v1/targets/delete", args);
      }
      return "";
    }

    async postScans(
      target_id_list,
      options = {
        profile_id: "11111111-1111-1111-1111-111111111111",
      }
    ) {
      // target: {"target_id":"d3bcdc92-4191-401b-ad0c-42056c6efab9","profile_id":"bfcb6779-b1f9-41fc-92d7-88f8bc1d12e8","report_template_id":"e89ef7db-4101-4c97-b7ab-9249efd2d3cd","schedule":{"disable":true,"time_sensitive":true,"history_limit":10,"start_date":"string","recurrence":"string","triggerable":false},"max_scan_time":0,"incremental":false}
      let args = {
        target_id: "",
        profile_id:
          options.profile_id || "11111111-1111-1111-1111-111111111111",
        schedule: {},
      };
      let ret = [];
      if (common.isArray(target_id_list)) {
        if (target_id_list.length < 1) {
          console.warn({
            code: 500,
            message: "传入参数为空",
            api: "POST:/scans",
          });
          return ret;
        }
        for (const target_id of target_id_list) {
          args.target_id = target_id;
          let response = await this.http.post("/api/v1/scans", args);
          ret.push(response.data);
        }
      } else {
        args.target_id = target_id_list;
        let response = await this.http.post("/api/v1/scans", args);
        ret.push(response.data);
      }
      // 返回数据：
      // {"profile_id":"11111111-1111-1111-1111-111111111111","schedule":{"disable":false,"start_date":null,"time_sensitive":false,"triggerable":false},"target_id":"9b62cbf1-7a01-424d-a9db-19cc85ecd515","incremental":false,"max_scan_time":0,"ui_session_id":null,"scan_id":"8382e10b-8d33-42ee-89ce-6bcc81fe66d1"}
      return ret;
    }

    async getScan(scan_id) {
      let response = await this.http.get("/api/v1/scans" + scan_id);
      let ret = response.data;
      return ret;
    }

    async getScans(
      options = {
        start: 0,
        limit: 100,
        query: "",
      }
    ) {
      // limit: 100 > limit > 1
      let ret = {};
      let last_number = options.limit || 100;
      let times = 0;
      if (last_number < 0) {
        let response = await this.http.get("/api/v1/scans", {
          params: { c: 0, l: 3 },
        });
        last_number = response.data.pagination.count;
      }
      let start = options.start || 0;
      while (last_number > 0) {
        let arg_limit = last_number;
        if (last_number > 100) {
          arg_limit = 100;
          last_number -= 100;
        } else {
          last_number = 0;
        }
        let args = { c: start, l: arg_limit, q: options.query || "" };
        let response = await this.http.get("/api/v1/scans", { params: args });
        if (times < 1) {
          ret = response.data;
        } else {
          ret.scans = ret.scans.concat(response.data.scans);
        }
        start += 100;
        times += 1;
      }
      return ret;
    }

    async getResult(scan_id, result_id) {
      let response = await this.http.get(
        `/api/v1/scans/${scan_id}/results/${result_id}/statistics`
      );
      let ret = response.data;
      return ret;
    }

    async getResults(scan_result_id_list) {
      let ret = [];
      for (const value of scan_result_id_list) {
        let response = await this.getScan(value.scan_id);
        response = await this.http.get(
          `/api/v1/scans/${value.scan_id}/results/${response.current_session.scan_session_id}/statistics`
        );
        ret.push(response.data);
      }
      return ret;
    }

    async autoScans(targets, options = { target_infos: {} }) {
      let self = this;
      let ret = options.target_infos || {};

      let n_targets = [];
      let target_id_list = [];
      for (const target of targets) {
        if (!ret[target]) {
          n_targets.push(target);
          continue;
        }
        target_id_list.push(ret[target].target_id);
      }

      if (!common.isHave(n_targets)) {
        return ret;
      }

      let response = await self.postTargets(n_targets);
      for (const target of response.targets) {
        target_id_list.push(target.target_id);
        let info = {
          target_id: target.target_id,
          scan_id: "",
          result_id: "",
          progress: 0,
        };
        ret[target.address] = info;
      }
      response = await self.postScans(target_id_list);

      let keys = common.objectKeys(ret);
      for (const [index, scan] of response.entries()) {
        ret[keys[index]].scan_id = scan.scan_id;
      }
      return ret;
    }
  }

  class FOFASearcher {
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
  }

  return new Utils();
}

async function activate(content) {
  let config = goby.getConfiguration();
  let awvs_api_key = config["AWVS API KEY"].default.trim();
  let awvs_address = config["AWVS ADDRESS"].default.trim();
  let fofa_address = config["FOFA ADDRESS"].default.trim();
  let fofa_api_key = config["FOFA API KEY"].default.trim();
  let fofa_email = config["FOFA EMAIL"].default.trim();
  // if (!awvs_api_key) {
  //     goby.showInformationMessage('请配置 AWVS API KEY');
  //     goby.showConfigurationDia();
  //     return;
  // }
  // if (!awvs_address) {
  //     goby.showInformationMessage('请配置 AWVS ADDRESS');
  //     goby.showConfigurationDia();
  //     return;
  // }

  window.utils = init_class({
    awvs_address: awvs_address,
    awvs_api_key: awvs_api_key,
    fofa_address: fofa_address,
    fofa_api_key: fofa_api_key,
    fofa_email: fofa_email,
  });
  window.utils;

  goby.registerCommand("relax_scan", function (content) {
    goby.getAsset(goby.getTaskId(), function (data) {
      console.log("datainfo:", data);
    });

    console.log(content);
    console.log(__dirname);
    console.log(goby.getLang());

    goby.showInformationMessage("relax helper loading completed!");
  });

  goby.registerCommand("relax_menu", function () {
    let path = __dirname + "/index.html";
    goby.showIframeDia(
      path,
      "Relax 助手菜单",
      Math.ceil(document.documentElement.clientWidth / 1.5),
      Math.ceil(document.documentElement.clientHeight / 2)
    );
  });

  // goby.registerCommand('relax_menu', function (content) {
  //     goby.showInformationMessage('hello, goby! this feature is not yet developed.');
  //     goby.showConfigurationDia();
  // });
}

exports.activate = activate;
