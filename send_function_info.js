/* eslint-disable */

/**
 * 被插桩的代码用 npm run 启动的时候才需要这句，否则需要屏蔽掉这句
 */
const axios = require("axios");

const callLogs = [];
let loggingEnabled = true; // 添加一个标志变量来控制日志记录是否启用

function sendLogs() {
  // 打印日志，说明正在发送日志
  console.log("正在发送日志");
  if (callLogs.length !== 0) {
    axios
      .post("http://localhost:8087/log", callLogs, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        callLogs.length = 0;
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  return true;
}

// 设置全局变量
global.sendLogs = sendLogs;

// 如果想定时发送而不是在chrome的控制台调用sendLogs发送，就打开这个函数
// setInterval(sendLogs, 3000);

// 定时查看日志数量 -- 测试
setInterval(getLogLength, 3000);

/**
 * 最大日志数，超过这个数就发送日志，卡死了就改大一点
 */
const maxLogs = 5000000;

function addLog(log, log_, args, targetString) {
  // 如果日志记录未启用,则直接返回
  if (!loggingEnabled) {
    return;
  }

  // 判断目标字符串是否是空字符串
  if (targetString !== "") {
    // 保存原始的堆栈跟踪限制
    let originalStackTraceLimit = Error.stackTraceLimit;

    // 设置无穷大的堆栈跟踪限制
    Error.stackTraceLimit = Infinity;
    for (let i = 0; i < args.length; i++) {
      if (typeof args[i] === "string") {
        // 判断参数是否时目标字符串
        if (args[i].includes(targetString)) {
          // 获取调用栈
          var stack = new Error().stack;
          // 删除调用栈前两行，第一行是error标识，第二行是addLog
          stack = stack.split("\n").slice(2).join("\n");
          // 打印调用栈
          console.log(
            "stack : \n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n" +
              stack +
              "\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
          );
        }
      }
    }
    // 恢复原始的堆栈跟踪限制
    Error.stackTraceLimit = originalStackTraceLimit;
  }

  //  // 打印原始日志 --测试
  //  console.log(log_);

  // log_analysis后台有去重的操作，所以这里不需要去重，前端少做点事
  callLogs.push(log);
  if (callLogs.length > maxLogs) {
    sendLogs();
  }
}

// 查看日志数量
function getLogLength() {
  // 打印当前日志数量 -- 测试
  console.log("当前日志数量：" + callLogs.length);

  return callLogs.length;
}

// 设置全局变量
global.getLogLength = getLogLength;

// 清空日志
function clearLog() {
  callLogs.length = 0;
  console.log("日志已清空。");
}

// 设置全局变量
global.clearLog = clearLog;

// 定义一个变量来存储定时器的ID
let logIntervalID;

// 开启定时器的函数；离开devtool进入界面时就会触发一些函数，这些函数并不是期望中要记录的函数，但是又没办法回到devtool中调用clearLog清空，这时候
// 可以启动定时器，每隔一段时间就清空一次日志，这样就可以避免记录一些不必要的函数；当真正需要发送日志的时候，可以调用stopInterval停止定时器
// 还有一种更简单的方法，对于不期望的函数就不要插桩，但是这样就会漏掉一些函数，所以还是用定时器的方法比较好，除非是非常明确的知道哪些函数不需要插桩
function startInterval() {
  // 防止多个定时器同时运行
  if (logIntervalID == null) {
    console.log("定时发送启动，每10秒执行一次clearLog函数。");
    logIntervalID = setInterval(clearLog, 10000);
  }
}

// 停止定时器的函数
function stopInterval() {
  if (logIntervalID != null) {
    console.log("定时发送停止。");
    clearInterval(logIntervalID);
    logIntervalID = null;
  }
}

// 把控制函数暴露给全局对象
global.startInterval = startInterval;
global.stopInterval = stopInterval;

// 添加stopLog函数
function stopLog() {
  loggingEnabled = false;
  console.log("日志记录已暂停。");
}

// 设置全局变量
global.stopLog = stopLog;

// 添加startLog函数
function startLog() {
  loggingEnabled = true;
  console.log("日志记录已启动。");
}

// 设置全局变量
global.startLog = startLog;

// 添加refreshPage函数
function refreshPage() {
  console.log("正在刷新当前页面...");
  window.location.reload();
}

// 设置全局变量
global.refreshPage = refreshPage;

// 导出addLog函数
module.exports = {
  addLog,
};
