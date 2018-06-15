var cheerio = require("cheerio");
var fs = require("fs");
var async = require("async");
var superagent = require("superagent");
var request = require("request");

function ToJson(data) {
  // 生成数据
  // 写入数据, 文件不存在会自动创建
  fs.writeFile(
    __dirname + "/dongqiu.json",
    JSON.stringify({
      status: 0,
      data: data
    }),
    function(err) {
      if (err) console.log(err);
      console.log("写入完成");
    }
  );
}

var baseUrl = "http://www.dongqiudi.com/?tab=1&page=";
var totalPage = 100;

var init = () => {
  let url = getPageUrl(totalPage, baseUrl);
  getTotalList(url);
};

init();

function replaceText(text) {
  return text.replace(/\n/g, "").replace(/\s/g, "");
}

function getPageUrl(count, url) {
  let pageUrlList = [];
  for (let i = 2; i < count; i++) {
    pageUrlList.push(url + i);
  }
  console.log(pageUrlList, "pageUrlList");

  return pageUrlList;
}

function getTotalList(urlList) {
  async.mapLimit(
    urlList,
    5,
    function(page, callback) {
      getCurPage(page, callback);
    },
    function(err, result) {
      if (err) {
        console.log(err);
        return;
      }
      ToJson(result);
      console.log(result, result.length, "result");
    }
  );
}

function getCurPage(page, callback) {
  request(page, function(err, response, body) {
    if (err) {
      callback(null, null);
    } else {
      $ = cheerio.load(body);
      let lists = [];
      $("#news_list ol li").each(function(i, el) {
        let $el = $(el);
        let content = {
          date: replaceText($el.find(".info .time").text()),
          title: replaceText($el.find(".pc_count").text()),
          contents: replaceText($el.find("p").text())
        };
        lists.push(content);
      });
      console.log(lists, "lists");
      callback(null, lists);
    }
  });
}
