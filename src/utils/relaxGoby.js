// relaxGoby.js
// 样例: const rGoby = require("./utils/relaxGoby.js")
// 优化 Goby 常用函数
// 官方文档：https://gobysec.net/doc#showConfigurationDia
"use strict";

let rGoby = {};

rGoby.regCmd = async function (name, handler) {
  return new Promise((resolve) => {
    goby.registerCommand(name, () => {
      handler();
      resolve();
    });
  });
};

rGoby.getLang = async function () {
  return goby.getLang();
};

rGoby.getTaskId = async function () {
  return goby.getTaskId();
};

rGoby.getConfig = async function () {
  let ret = goby.getConfiguration();
  for (const key in ret) {
    if (ret[key].default) {
      ret[key].default = ret[key].default.trim();
    }
  }
  return ret;
};

rGoby.getAsset = async function (taskid) {
  taskid = taskid || goby.getTaskId();
  if (!taskid) {
    console.warn('"taskid" is empty.');
    return {};
  }
  let ret;
  await new Promise((resolve) => {
    goby.getAsset(taskid, function (data) {
      ret = data;
      resolve();
    });
  });
  return ret.data;
};

rGoby.msgtype = { inf: "inf", wrn: "wrn", err: "err", suc: "suc" };

rGoby.showMsg = async function (msg, msg_type = "inf") {
  if (msg_type.toLocaleLowerCase() === "wrn") {
    goby.showWarningMessage(msg);
  } else if (msg_type.toLocaleLowerCase() === "err") {
    goby.showErrorMessage(msg);
  } else if (msg_type.toLocaleLowerCase() === "suc") {
    goby.showSuccessMessage(msg);
  } else {
    goby.showInformationMessage(msg);
  }
};

rGoby.showConfig = async function () {
  goby.showConfigurationDia();
};

rGoby.addScanIps = async function (ips, type = 0) {
  goby.addScanIps(ips, type);
};

rGoby.addScanPorts = async function (ports, type = 0) {
  goby.addScanPorts(ports, type);
};

rGoby.makeIframe = async function (url, title, width, height) {
  goby.showIframeDia(url, title, width, height);
};

rGoby.makePage = async function (url, background = false) {
  goby.showPage(url, background);
};

rGoby.openUrl = async function (url) {
  goby.openExternal(url);
};

module.exports = rGoby;
