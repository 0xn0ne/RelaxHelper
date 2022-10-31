const httpClient = require("../utils/httpClient.js");
const common = require("../utils/common.js");
const fs = require("fs");
const path = require("path");
const AWVSScanner = require("./awvsScanner.js");
const FOFASearcher = require("./fofaScanner.js");

module.exports = class Utils {
  constructor() {
    this.http = httpClient.create({ headers: {} });
    this.fs = fs;
    this.path = path;
    for (let key in common) {
      this[key] = common[key];
    }

    let t_path = common
      .stripRight(__dirname, this.path.sep)
      .split(this.path.sep);
    this.paths = { root: t_path.slice(0, -2).join(this.path.sep) };
    this.paths.data = this.path.join(this.paths.root, "datadir");
    this.paths.cache = this.path.join(this.paths.root, ".cache");
    this.paths.config_file = this.path.join(this.paths.cache, "config.json");
    for (let key in this.paths) {
      let t_path = this.paths[key].split(this.path.sep);
      let filename = t_path[t_path.length - 1];
      if (filename.split(".").length > 1) {
        continue;
      }
      if (!common.isDir(this.paths[key])) {
        fs.mkdirSync(this.paths[key]);
      }
    }
  }

  async isAbleChecker() {
    let GlbCfg = await rGoby.getConfig();

    // awvs
    let awvs_api_key = GlbCfg["AWVS API KEY"].default;
    let awvs_address = GlbCfg["AWVS ADDRESS"].default;
    window.rAwvs = new AWVSScanner(awvs_address, awvs_api_key);
    window.rData.scanUtil.awvs.isable = await rAwvs.isAble();
    if (!window.rData.scanUtil.awvs.isable) {
      console.log("无法检测到 AWVS，请确认 AWVS 配置正确且可正常连接后再尝试");
    }

    // 由于调用命令行会占用 Electron 通信管道，Goby 运行会被阻塞，不在每次打开插件的时候都进行命令行类工具的检测
    // // fscan
    // let fscan_path = GlbCfg["FSCAN PATH"].default;
    // window.rFscan = new FScanScanner(fscan_path);
    // window.rData.scanUtil.fscan.isable = await rFscan.isAble();
    // if (!window.rData.scanUtil.fscan.isable) {
    //   console.log(
    //     "无法检测到 FSCAN，请确认 FSCAN 配置正确且可正常使用后再尝试"
    //   );
    // }

    // fofa
    let fofa_address = GlbCfg["FOFA ADDRESS"].default;
    let fofa_api_key = GlbCfg["FOFA API KEY"].default;
    let fofa_email = GlbCfg["FOFA EMAIL"].default;
    window.rFofa = new FOFASearcher(fofa_address, fofa_email, fofa_api_key);
    window.rData.srchUtil.fofa.isable = true;
  }
};
