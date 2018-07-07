var cheerio = require("cheerio");
var fs = require("fs");
var async = require("async");
var superagent = require("superagent");
var request = require("request");
var mongoose = require("mongoose");
var q = require("q");

mongoose.Promise = q.Promise;
mongoose.connect("mongodb://localhost:27017/poems");
mongoose.connection.on("connected", function() {
  console.log("数据库 连接成功");
});

var poemItem = mongoose.Schema({
  content: String,
  author: String
});

var poemModel = mongoose.model("poemModel", poemItem);

var saveCurPage = function(list, callback) {
  list.forEach((item, index) => {
    saveMongo(item);
    if (index === list.length - 1) {
      console.log("当前数据保存完毕，开始抓取下一页...");
      callback(null, null);
    }
  });
};

var saveMongo = function(obj) {
  let dbModel = new poemModel(obj);
  dbModel.save(function(err) {
    if (err) {
      console.log(err);
      return;
    }
  });
};

var baseUrl = "https://so.gushiwen.org/mingju/default.aspx?p=";
var totalPages = 10;

// 获取一级书目信息
var init = function() {
  var pageUrlList = getPageUrlList(totalPages, baseUrl);
  getList(pageUrlList);
};

function getPageUrlList(count, baseUrl) {
  let pageUrlList = [];
  for (let i = 1; i < count; i++) {
    pageUrlList.push(baseUrl + i);
  }
  return pageUrlList;
}

function getList(pageUrlList) {
  async.mapLimit(
    pageUrlList,
    3,
    function(series, callback) {
      getCurPage(series, callback);
    },
    function(err, result) {
      if (err) {
        console.log(err);
        return;
      }
      console.log("-------狗日的 我擦 数据终于抓取完了 !------");
    }
  );
}

function getCurPage(pageUrl, callback) {
  request(pageUrl, function(err, response, body) {
    if (err) {
      console.log("err url" + bookUrl);
      callback(null, null);
      return;
    } else {
      $ = cheerio.load(body);
      let poems = [];
      // let curBookName = $(".sonspic h1").text();
      $(".sons .cont").each(function(index, el) {
        let $el = $(el);
        let obj = {
          content: replaceText(
            $el
              .find("a")
              .eq(0)
              .text()
          ),
          author: replaceText(
            $el
              .find("a")
              .eq(1)
              .text()
          )
        };
        poems.push(obj);
        if (index === $(".sons .cont").length - 1) {
          console.log("当前页面数据抓取完毕，开始保存...");
          saveCurPage(poems, callback);
        }
      });
    }
  });
}
function replaceText(text) {
  return text.replace(/\n/g, "").replace(/\s/g, "");
}

init();
