// common.js
// 样例: const common = require("./utils/common.js")
// 优化版的常用函数
"use strict";

const fs = require("fs");
const path = require("path");
const util = require("util");
const child_process = require("child_process");

let common = {};

common.isPrimitive = function (arg) {
  return arg === null || (typeof arg !== "object" && typeof arg !== "function");
};

common.isBool = function (arg) {
  return typeof arg === "boolean";
};

common.isNull = function (arg) {
  return arg === null;
};

common.isUndefined = function (arg) {
  return arg === undefined;
};

common.isNumber = function (arg) {
  return typeof arg === "number";
};

common.isString = function (arg) {
  return typeof arg === "string";
};

common.isSymbol = function (arg) {
  return typeof arg === "symbol";
};

common.isArray = function (arg) {
  Array.isArray =
    Array.isArray ||
    function (arg) {
      return Object.prototype.toString.call(arg) === "[object Array]";
    };
  return Array.isArray(arg);
};

common.isObject = function (arg) {
  return arg !== null && typeof arg === "object";
};

common.isFunction = function (arg) {
  return typeof arg === "function";
};

common.isHave = function (arg) {
  if (common.isArray(arg) && arg.length < 1) {
    return false;
  } else if (common.isObject(arg) && JSON.stringify(arg) === "{}") {
    return false;
  }
  if (common.isNull(arg) || common.isUndefined(arg)) {
    return false;
  }
  return true;
};

common.objectKeys = function (arg) {
  Object.keys =
    Object.keys ||
    function (data) {
      if (!common.isObject(data)) {
        throw "'arg' is not object.";
        return;
      }
      let ret = [];
      for (const key in data) {
        ret.push(key);
      }
      return ret;
    };
  return Object.keys(arg);
};

common.objectValues = function (arg) {
  Object.values =
    Object.values ||
    function (data) {
      if (!common.isObject(data)) {
        throw "'arg' is not object.";
        return;
      }
      let ret = [];
      for (const key in data) {
        ret.push(common.deepClone(data[key]));
      }
      return ret;
    };
  return Object.values(arg);
};

common.deepClone = function (obj) {
  window.structuredClone =
    window.structuredClone ||
    function (arg) {
      if (!common.isObject(arg)) return arg;
      let n_obj = arg instanceof Array ? [] : {};
      for (const key in arg) {
        if (common.isObject(arg)) {
          n_obj[key] = common.deepClone(arg[key]);
        } else {
          n_obj[key] = arg[key];
        }
      }
      return n_obj;
    };
  return window.structuredClone(obj);
};

common.objectUpdate = function (target, source) {
  // Object.assign 有点捞，如下：
  // t1 = {a: {b: 1}, c: 2};t2 = {a: {c: 2}, d: 33};Object.assign(t1, t2) = {a: {c: 2}, c: 2, d: 33} ，会出现 t1.a.b 没了
  if (!common.isObject(target) || !common.isObject(source)) return;
  for (const key in source) {
    if (common.isObject(target[key]) && common.isObject(source[key])) {
      target[key] = common.objectUpdate(target[key], source[key]);
      continue;
    }
    target[key] = common.deepClone(source[key]);
  }
  return target;
};

common.stripLeft = function (str, char = "\\s") {
  return str.replace(new RegExp(`^${char}*`), "");
};

common.stripRight = function (str, char = "\\s") {
  return str.replace(new RegExp(`${char}*$`), "");
};

common.strip = function (str, char = "\\s") {
  return common.stripLeft(common.stripRight(str, char), char);
};

common.isDir = function (dirname) {
  if (fs.existsSync(dirname)) {
    let filestat = fs.statSync(dirname);
    if (filestat.isDirectory()) {
      return true;
    }
  }
  return false;
};

common.mkdirs = function (dirname) {
  if (fs.existsSync(dirname) && fs.statSync(dirname).isDirectory()) {
    return dirname;
  }

  let par_dir = path.dirname(dirname);
  if (!fs.existsSync(par_dir) || !fs.statSync(par_dir).isDirectory()) {
    common.mkdirs(par_dir);
  }
  fs.mkdirSync(dirname);
  return dirname;
};

common.fileRead = function (filename, options = { encoding: "utf-8" }) {
  // 因为 readFile 是异步的，使用 readFileSync 才可以拿到数据
  let ret;
  try {
    ret = fs.readFileSync(filename, options);
    console.log("读取文件成功，文件为：" + filename);
  } catch (err) {
    console.warn(err);
  }
  return ret;
};

common.fileWrite = function (
  filename,
  content,
  options,
  handler = function (err) {
    if (err) throw err;
    console.log("保存文件成功，保存为：" + filename);
  }
) {
  fs.writeFile(filename, content, options, handler);
};

common.genCSVText = function (data, headers = []) {
  if (!common.isHave(data)) {
    throw "'data' is empty!";
  }
  let in_gen_headers = function (_data) {
    return Object.keys(_data[0]);
  };

  headers = common.isHave(headers) ? headers : in_gen_headers(data);
  headers = headers.join(",") + "\n";
  let content = "";
  for (const item of data) {
    let t_content = "";
    for (const iter of Object.values(item)) {
      if (common.isNumber(iter)) {
        t_content += `${iter},`;
      } else {
        t_content += `"${iter.replace('"', '""')}",`;
      }
    }
    content += t_content.substring(0, t_content.length - 1) + "\n";
  }

  return headers.concat(content);
};

common.walk = function (dir_path, filters = [], result_save = {}) {
  if (!result_save[dir_path]) {
    result_save[dir_path] = [];
  }

  fs.readdirSync(dir_path, { withFileTypes: true }).forEach(function (ent) {
    let t_path = path.join(dir_path, ent.name);
    let is_drop = false;

    if (filters.length > 0) {
      for (const filter of filters) {
        if (filter.test(t_path)) {
          is_drop = true;
          break;
        }
      }
      if (is_drop) {
        return;
      }
    }

    if (ent.isFile()) {
      result_save[dir_path].push(t_path);
    } else if (ent.isDirectory()) {
      result_save[t_path] = [];
      common.walk(t_path, filters, result_save);
    }
  });
  return result_save;
};

common.timeFormat = function (fmt, date = new Date()) {
  let ret;
  const opt = {
    "%y": (date.getFullYear() % 100).toString(), // 两位年份
    "%Y": date.getFullYear().toString(), // 年
    "%m": (date.getMonth() + 1).toString(), // 月
    "%d": date.getDate().toString(), // 日
    "%H": date.getHours().toString(), // 时
    "%M": date.getMinutes().toString(), // 分
    "%S": date.getSeconds().toString(), // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (const k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
      );
    }
  }
  return fmt;
};

common.sleep = function (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
};

common.exec = async function (command, options = { is_ret_text: false }) {
  let ret;
  console.log(`execute command: "${command}"`);
  ret = await util.promisify(child_process.exec)(command, options);
  if (options.is_ret_text) {
    ret = ret.stdout + "\n" + ret.stderr;
    console.log(`finish command: "${command}", return: ${ret.slice(0, 24)}`);
  } else {
    console.log(`finish command: "${command}", return: ${ret}`);
  }
  return ret;
};

common.genPageList = function (cur_page, totle_page, list_len = 5) {
  if (list_len < 3) {
    list_len = 3;
  }
  let mid_page = Math.floor(list_len / 2);
  let start_num = cur_page - mid_page;
  let end_num = cur_page + mid_page;
  if (start_num < 1 || totle_page < list_len) {
    start_num = 1;
  } else if (end_num > totle_page) {
    start_num = totle_page - list_len + 1;
  }

  let page_list = [];
  for (const index = start_num; index <= totle_page; index++) {
    page_list.push(index);
    if (page_list.length >= list_len) {
      break;
    }
  }
  return page_list;
};

module.exports = common;
