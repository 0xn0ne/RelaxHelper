const common = require("../utils/common.js");
const path = require("path");

module.exports = class Data {
  constructor(config_path) {
    this.config_path = config_path;

    // 默认的配置
    this.menus = {
      exportPanel: { name: "导出", isactive: true },
      scanPanel: { name: "扫描", isactive: false },
      searchPanel: { name: "搜索", isactive: false },
    };
    this.eprtUtil = {
      ip: { label: "IP", isable: false, ischecked: true },
      mac: { label: "MAC", isable: true, ischecked: false },
      os: { label: "操作系统", isable: true, ischecked: false },
      hostname: { label: "主机名", isable: true, ischecked: false },
      tags: { label: "标签", isable: true, ischecked: false },
      port: { label: "端口", isable: false, ischecked: true },
      protocol: { label: "应用协议", isable: true, ischecked: false },
      baseprotocol: { label: "传输协议", isable: true, ischecked: false },
    };
    this.scanUtil = {
      awvs: { label: "AWVS", isable: false, ischecked: false },
      fscan: { label: "FSCAN", isable: false, ischecked: false },
    };
    this.srchUtil = {
      fofa: {
        key: "full",
        label: "仅一年内数据",
        isable: true,
        ischecked: true,
      },
    };
    this.checkFscan = {
      np: { label: "禁存活探测", isable: true, ischecked: false },
      nopoc: { label: "禁用POC", isable: true, ischecked: false },
    };
    this.inputFscan = {
      userf: {
        label: "用户字典",
        isable: true,
        ischecked: false,
        value: "",
        placeholder: "/Users/Username/Document/username.txt",
      },
      pwdf: {
        label: "密码字典",
        isable: true,
        ischecked: false,
        value: "",
        placeholder: "/Users/Username/Document/password.txt",
      },
      proxy: {
        label: "代理设置",
        isable: true,
        ischecked: false,
        value: "",
        placeholder: "http://127.0.0.1:8080 or socks5://127.0.0.1:1080",
        default: "http://127.0.0.1:8080",
      },
      t: {
        label: "扫描线程",
        isable: true,
        ischecked: false,
        value: "",
        placeholder: "600",
        default: "600",
      },
      // 参考：
      // https://github.com/shadow1ng/fscan/blob/4908720acbbb4bdd369a8bfa92c7b73b0ca893cf/common/flag.go#L36，Flag函数
      // https://github.com/shadow1ng/fscan/blob/38e48ba4205196e042db8f832a7789b76ee61c5e/Plugins/scanner.go#L13，Scan函数
      // https://github.com/shadow1ng/fscan/blob/38e48ba4205196e042db8f832a7789b76ee61c5e/common/config.go#L17，PORTList变量
      // 扫描模块是使用 Scantype 判断，可用模块为：all|ftp|ssh|findnet|netbios|smb|mssql|oracle|mysql|rdp|psql|redis|fcgi|mem|mgo|ms17010|cve20200796|web|icmp|webonly|portscan
      m: {
        label: "扫描模块",
        isable: true,
        ischecked: false,
        value: "",
        placeholder:
          "all|ftp|ssh|findnet|netbios|smb|mssql|oracle|mysql|rdp|psql|redis|fcgi|mem|mgo|ms17010|cve20200796|web|icmp|webonly|portscan",
        default: "all",
      },
    };
    this.cache = {
      awvs: {
        targs_infos: {},
        progress: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      },
      fscan: {
        targs_infos: {},
        progress: 0,
        vulnum: 0,
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
    };

    // 加载保存的配置
    this.readConfig();
  }

  saveConfig() {
    let save_data = {};
    for (const key in this) {
      if (common.isObject(this[key])) {
        save_data[key] = this[key];
      }
    }
    let dirnames = this.config_path.split(path.sep);
    let dirname = dirnames.slice(0, dirnames.length - 1).join(path.sep);

    common.mkdirs(dirname);
    common.fileWrite(this.config_path, JSON.stringify(save_data));
    return true;
  }

  readConfig() {
    let config_content = common.fileRead(this.config_path);
    let config_object = {};
    if (config_content) {
      config_object = JSON.parse(config_content);
    }
    for (const key in config_object) {
      common.objectUpdate(this[key], config_object[key]);
    }
  }
};
