let gobyAsync = {};

gobyAsync.regCmd = async function (name, handler) {
  return new Promise((resolve) => {
    goby.registerCommand(name, () => {
      handler();
      resolve();
    });
  });
};

gobyAsync.getLang = async function () {
  return goby.getLang();
};

gobyAsync.getTaskId = async function () {
  return goby.getTaskId();
};

gobyAsync.getConfig = async function () {
  return goby.getConfiguration();
};

gobyAsync.getAsset = async function (taskid) {
  taskid = taskid || goby.getTaskId();
  if (!taskid) {
    console.warn('"taskid" is empty.');
    return;
  }
  let taskinfos;
  await new Promise((resolve) => {
    goby.getAsset(taskid, function (data) {
      taskinfos = data;
      resolve();
    });
  });
  return taskinfos;
};

gobyAsync.msgtype = { inf: "inf", wrn: "wrn", err: "err", suc: "suc" };

gobyAsync.showMsg = async function (msg, msg_type = "inf") {
  if (msg_type.toLocaleLowerCase() === "wrn") {
    goby.showInformationMessage(msg);
  } else if (msg_type.toLocaleLowerCase() === "err") {
    goby.showWarningMessage(msg);
  } else if (msg_type.toLocaleLowerCase() === "suc") {
    goby.showErrorMessage(msg);
  } else {
    goby.showSuccessMessage(msg);
  }
};

gobyAsync.addScanIps = async function (ips, type = 0) {
  goby.addScanIps(ips, type);
};

gobyAsync.addScanPorts = async function (ports, type = 0) {
  goby.addScanPorts(ports, type);
};
