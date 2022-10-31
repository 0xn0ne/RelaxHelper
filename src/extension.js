const Utils = require(__dirname + "/class/utils.js");
const Data = require(__dirname + "/class/data.js");
const AWVSScanner = require(__dirname + "/class/awvsScanner.js");
const FscanScanner = require(__dirname + "/class/fscanScanner.js");
const FOFASearcher = require(__dirname + "/class/fofaScanner.js");

const rGoby = require(__dirname + "/utils/relaxGoby.js");

let GlbCfg = {};

function init_class({
  awvs_address,
  awvs_api_key,
  fscan_path,
  fofa_address,
  fofa_email,
  fofa_api_key,
}) {
  window.rUtils = new Utils();
  window.rData = new Data(window.rUtils.paths.config_file);
  window.rAwvs = new AWVSScanner(awvs_address, awvs_api_key);
  window.rFscan = new FscanScanner(fscan_path, window.rUtils.paths.cache);
  window.rFofa = new FOFASearcher(fofa_address, fofa_email, fofa_api_key);
}

async function activate(content) {
  window.rGoby = rGoby;
  GlbCfg = await rGoby.getConfig();
  let awvs_api_key = GlbCfg["AWVS API KEY"].default;
  let awvs_address = GlbCfg["AWVS ADDRESS"].default;
  let fscan_path = GlbCfg["FSCAN PATH"].default;
  let fofa_address = GlbCfg["FOFA ADDRESS"].default;
  let fofa_api_key = GlbCfg["FOFA API KEY"].default;
  let fofa_email = GlbCfg["FOFA EMAIL"].default;
  // // if (!awvs_api_key) {
  // //     goby.showInformationMessage('请配置 AWVS API KEY');
  // //     goby.showConfigurationDia();
  // //     return;
  // // }
  // // if (!awvs_address) {
  // //     goby.showInformationMessage('请配置 AWVS ADDRESS');
  // //     goby.showConfigurationDia();
  // //     return;
  // // }

  init_class({
    awvs_address: awvs_address,
    awvs_api_key: awvs_api_key,
    fscan_path: fscan_path,
    fofa_address: fofa_address,
    fofa_api_key: fofa_api_key,
    fofa_email: fofa_email,
  });

  // 命令行类工具运行监测，运行过程中监测太耗时，命令行类统一放到这里
  window.rFscan = new FscanScanner(fscan_path);
  window.rData.scanUtil.fscan.isable = await rFscan.isAble();
  if (!window.rData.scanUtil.fscan.isable) {
    console.log("无法检测到 FSCAN，请确认 FSCAN 配置正确且可正常使用后再尝试");
  }

  // goby.registerCommand("relax_scan", function (content) {
  //   goby.getAsset(goby.getTaskId(), function (data) {
  //     console.log("datainfo:", data);
  //   });

  //   console.log(content);
  //   console.log(__dirname);
  //   console.log(goby.getLang());

  //   goby.showInformationMessage("relax helper loading completed!");
  // });

  rGoby.regCmd("relax_menu", function () {
    let path = __dirname + "/index.html";
    rGoby.makeIframe(
      path,
      "Relax 助手菜单",
      Math.ceil(document.documentElement.clientWidth / 1.5),
      Math.ceil(document.documentElement.clientHeight)
    );
  });
}

exports.activate = activate;
