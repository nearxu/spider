
const formatData = require('./formatData.js');
var cheerio = require("cheerio");
var fs = require("fs");
var async = require("async");
var superagent = require("superagent");
var request = require("request");

let urlsArray = []; //存放爬取网址
let pageUrls = []; //存放收集文章页面网站
const pageNum = 10; //要爬取文章的页数

function ToJson(data) {
  // 生成数据
  // 写入数据, 文件不存在会自动创建
  fs.writeFile(
    __dirname + "/cnode.json",
    JSON.stringify({
      status: 0,
      data: data
    }),
    function (err) {
      if (err) console.log(err);
      console.log("写入完成");
    }
  );
}

function replaceText(text) {
  return text.replace(/\n/g, "").replace(/\s/g, "");
}

function replaceTextToNum(text) {
  return text
    .replace(/\n/g, "")
    .replace(/\s/g, "")
    .replace(/[^0-9]+/g, "");
}

function getPageUrl() {
  let urlArr = [];
  for (var i = 1; i <= pageNum; i++) {
    urlArr.push("https://cnodejs.org/?tab=all&page=" + i);
  }
  return urlArr;
}

const init = () => {
  urlsArray = getPageUrl();
  getPageList(urlsArray);
};

function getPageList(urls) {
  async.mapLimit(
    urls,
    5,
    function (page, callback) {
      getCurrentPage(page, callback);
    },
    function (err, result) {
      if (err) {
        console.log(err);
        return;
      }
      // ToJson(result);
      console.log(formatData(result));
    }
  );
}

function getCurrentPage(page, callback) {
  request(page, function (err, response, body) {
    if (err) {
      callback(null, null);
    } else {
      $ = cheerio.load(body);
      let lists = [];
      console.log(`第${page}页抓取中`);
      $("#topic_list .cell").each(function (i, el) {
        let $el = $(el);
        let obj = {
          id: `${i}${Math.random()}`,
          title: replaceText($el.find(".topic_title").text()),
          comment: replaceTextToNum($el.find(".count_of_replies").text()),
          views: replaceTextToNum($el.find(".count_of_visits").text())
        };
        console.log(`数据${obj} 存入中 ......`);
        lists.push(obj);
      });
      callback(null, lists);
    }
  });
}

init();
