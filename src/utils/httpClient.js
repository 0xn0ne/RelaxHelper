// httpClient.js
// 样例: const httpClient = require("./utils/httpClient.js")
// 优化版的 axios 实例生成工具
"use strict";

const axios = require("axios");

let httpClient = {};

httpClient.create = function (
  options = {
    baseURL: "",
    headers: { "user-agent": "HTTPClient/0.1" },
    maxRedirects: 5,
    responseType: "json",
    timeout: 5000,
    // responseType 表示服务器响应的数据类型，可以是 arraybuffer/blob/document/json/text/stream，默认为 json
  }
) {
  let instance = axios.create(options);
  instance.defaults.timeout = options.timeout;

  instance.interceptors.request.use(
    // 请求拦截器
    (config) => {
      // 在发送请求之前做的处理
      //   if (config.method.toUpperCase() === "POST") {
      //     // 自动解析 POST BODY 部分为 JSON 字符串
      //     config.data = JSON.stringify(config.data);
      //     // 若是后端能直接处理 JSON 格式, 可以不用手动解析
      //   }

      //   if (localStorage.token) {
      //     // 若是有做鉴权 token, 就给头部带上 token 字段
      //     // 若是需要跨站点, 存放到 cookie 会好一点, 限制也没那么多, 有些浏览环境限制了 localstorage 的使用
      //     // 一些必要的数据写入本地, 优先从本地读取
      //     config.headers.token = localStorage.token;
      //   }
      return config;
    },
    (error) => {
      // error 的回调, 看错误处理的要求定义
      console.warn("by HTTPClient. request error:", error);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    // 响应拦截器
    (response) => {
      // 2xx 范围内的状态码都会触发该函数
      if (response.code && !response.data) {
        //对响应数据做些事
        return Promise.reject(response.data.error.message);
      }
      return response;
    },
    (error) => {
      // 非 2xx 范围的状态码都会触发该函数
      // 下面是接口回调的status, 因为做了一些错误页面, 所以出现对应的状态码都会指向对应的报错页面
      // if (!error.response) {
      //     router.push({
      //         path: "/error/502"
      //     });
      // } else if (error.response.status === 403) {
      //     router.push({
      //         path: "/error/403"
      //     });
      // } else if (error.response.status === 500) {
      //     router.push({
      //         path: "/error/500"
      //     });
      // } else if (error.response.status === 404) {
      //     router.push({
      //         path: "/error/404"
      //     });
      // }
      if (
        !error.response ||
        !error.response.status ||
        error.response.status < 400
      ) {
        return error;
      }
      // 返回 response 里的错误信息
      error.message = error.message || "unexpected error!";
      console.warn("by HTTPClient. response error:", error);

      // 下面是自动重试处理，可选对 instance.defaults.retryTimes 与 instance.defaults.retryDelay 进行配置
      let config = error.config;
      config.retryTimes = config.retryTimes || 3;
      config.retryDelay = config.retryDelay || 3000;
      config.__retryData = config.__retryData || {};

      if (
        !config.__retryData[config.url] ||
        new Date().getTime() - config.__retryData[config.url].lastTime >
          config.retryDelay + 600000
      ) {
        // 没有过该URL的重试记录或记录存在时间超过 10 分钟都会被重置
        config.__retryData[config.url] = {
          lastTime: new Date().getTime(),
          count: 0,
        };
      }
      config.__retryData[config.url].lastTime = new Date().getTime();
      if (config.__retryData[config.url].count >= config.retryTimes) {
        // 返回错误并退出自动重试
        config.__retryData[config.url].count = 0;
        return Promise.reject(error);
      }
      config.__retryData[config.url].count += 1;
      console.log(
        config.url + ", retry",
        config.__retryData[config.url].count,
        "times"
      );
      var backoff = new Promise(function (resolve) {
        setTimeout(function () {
          resolve();
        }, config.retryDelay);
      });
      // 返回重试请求
      return backoff.then(function () {
        return instance(config);
      });
    }
  );
  return instance;
};

module.exports = httpClient;
