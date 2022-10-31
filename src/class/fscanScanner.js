const common = require("../utils/common.js");
const process = require("process");

module.exports = class FScanScanner {
  constructor(file_path) {
    this.file_path = file_path;
    this.cache_dir = window.rUtils.paths.cache;
    this.cmd_list = [];
  }

  async isAble() {
    if (await this.getVersion()) {
      return true;
    }
    return false;
  }

  async getVersion() {
    let ret = "";
    try {
      ret = await common.exec(`${this.file_path} --help`, {
        is_ret_text: true,
      });
    } catch (error) {
      console.log("fscan error:", error);
      return "";
    }
    ret = ret.match(/fscan version: (\d+\.\d+\.\d+)/i);
    if (!ret) {
      return "";
    }
    return ret[1];
  }

  genCmd(host, ports = [], output = "") {
    let cmd_list = [`${this.file_path}`];
    cmd_list.push(`-h ${host}`);

    if (common.isHave(ports)) {
      let ports_str = "";
      ports_str = ports.join(",");
      cmd_list.push("-p " + ports_str);
    }

    let check = window.rData.checkFscan;
    let input = window.rData.inputFscan;
    for (const key in check) {
      if (!check[key].isable || !check[key].ischecked) {
        continue;
      }
      cmd_list.push(`-${key}`);
    }
    for (const key in input) {
      let value = input[key].value || input[key].default;
      if (!input[key].isable || !input[key].ischecked || !value) {
        continue;
      }
      cmd_list.push(`-${key} ${value}`);
    }
    if (output) {
      cmd_list.push(`-o ${output}`);
    }
    return cmd_list.join(" ");
  }

  async addScan(host, ports = [], output = "") {
    let ret = "";
    let results_output = output + ".fscan";
    let console_output = `${output}_${host}.fscan`;
    let cmd = this.genCmd(host, ports, results_output);
    window.rData.cache.fscan.targs_infos[host] = {
      output: results_output,
      status: "scanning",
      progress: 0,
    };
    try {
      ret = await common.exec(cmd, {
        is_ret_text: true,
      });
    } catch (error) {
      console.log("fscan error:", error);
      window.rData.cache.fscan.targs_infos[host].status = "error";
      return "";
    }
    window.rData.cache.fscan.targs_infos[host].progress = 100;
    if (ret.match(/\[\*\] 扫描结束,耗时:.+/)) {
      window.rData.cache.fscan.targs_infos[host].status = "finish";
    } else {
      window.rData.cache.fscan.targs_infos[host].status = "error";
    }
    common.fileWrite(console_output, ret);
    return ret;
  }

  async addScanCmd(host, ports = [], output = "") {
    let results_output = output + ".fscan";
    let console_output = `${output}_${host}.fscan`;
    let cmd = this.genCmd(host, ports, results_output);
    window.rData.cache.fscan.targs_infos[host] = {
      results_output: results_output,
      console_output: console_output,
      status: "scanning",
      progress: 0,
    };

    cmd += ` > ${console_output}`;
    this.cmd_list.push(cmd);
  }

  async exeCmd() {
    let cmd_file =
      this.cache_dir +
      `/fscan_commands_${common.timeFormat("%Y%m%d_%H%M%S")}.cmd`;
    if (process.platform !== "win32") {
      cmd_file =
        this.cache_dir +
        `/fscan_commands_${common.timeFormat("%Y%m%d_%H%M%S")}.sh`;
    }
    common.fileWrite(cmd_file, this.cmd_list.join("\n"));
    try {
      if (process.platform !== "win32") {
        await common.exec(`chmod +x ${cmd_file}`, {
          is_ret_text: false,
        });
      }
      await common.exec(cmd_file, {
        is_ret_text: false,
      });
    } catch (error) {
      console.log("fscan error:", error);
      return "";
    }
  }
};
