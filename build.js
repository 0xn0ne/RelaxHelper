var JSZip = require("jszip");
var fs = require("fs");
var path = require("path");
var zip = new JSZip();

function walkSync(dir_path, filters = [], result_save = {}) {
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
      walkSync(t_path, filters, result_save);
    }
  });
  return result_save;
}

function readJson(filename, options = {}) {
  let ret;
  ret = JSON.parse(fs.readFileSync(filename, options));
  console.log("读取文件成功，文件为：" + filename);
  return ret;
}

function timeFormat(fmt, date = new Date()) {
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
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
      );
    }
  }
  return fmt;
}

let version = readJson("./package.json").version;
let files = walkSync("./", [
  /.git/,
  /\.history.*/,
  /cache.*/,
  /datadir.*/,
  /.*\.DS_Store.*/,
  /.*\.zip/,
  /.*\.key/,
]);

let dir_base_list = __dirname.split(path.sep);
let dir_base_str = dir_base_list[dir_base_list.length - 1];
let dir_base = zip.folder(dir_base_str);

for (const dirname in files) {
  // 打包文件夹里的文件
  let dir_curr;
  if (dirname === "." + path.sep) {
    dir_curr = dir_base;
  } else {
    dir_curr = dir_base.folder(dirname);
  }
  for (const filename of files[dirname]) {
    let name_list = filename.split(path.sep);

    dir_curr.file(name_list[name_list.length - 1], fs.readFileSync(filename));
  }
}

// 压缩
zip
  .generateAsync({
    // 压缩类型选择nodebuffer，在回调函数中会返回zip压缩包的Buffer的值，再利用fs保存至本地
    type: "nodebuffer",
  })
  .then(function (content) {
    let name_list = `${__dirname}-v${version}-${timeFormat(
      "%y%m%d"
    )}.zip`.split(path.sep);
    // 写入磁盘
    fs.writeFile(name_list[name_list.length - 1], content, function (err) {
      if (!err) {
        // 写入磁盘成功
        console.log("压缩成功");
      } else {
        console.log("压缩失败");
      }
    });
    let name_list_for_upload = `${__dirname}.zip`.split(path.sep);
    fs.writeFile(
      name_list_for_upload[name_list_for_upload.length - 1],
      content,
      function (err) {
        if (!err) {
          // 写入磁盘成功
          console.log("压缩成功");
        } else {
          console.log("压缩失败");
        }
      }
    );
  });
