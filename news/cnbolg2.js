// https://x-front-team.github.io/2017/01/11/nodejs%E7%88%AC%E8%99%AB/

var cheerio = require("cheerio"),
  superagent = require("superagent"),
  express = require("express"),
  async = require("async"),
  url = require("url");
eventproxy = require("eventproxy");

var ep = new eventproxy();
const fs = require("fs");

var cnodeUrl = "https://www.cnblogs.com/?CategoryId=909#p";
var topicUrls = [];
function replaceText(text) {
  return text.replace(/\n/g, "").replace(/\s/g, "");
}

function getUrl(cnodeUrl) {
  superagent.get(cnodeUrl).end(function(err, ele) {
    if (err) console.log(err);
    var $ = cheerio.load(ele.text);
    $("#post_list .post_item").each(function(idx, elem) {
      var $elem = $(elem);
      var href = replaceText(
        $elem.find(".post_item_body .titlelnk").attr("href")
      );
      //   var titles = replaceText($elem.find(".post_item_body .titlelnk").text());
      var readed = replaceText($elem.find(".article_view a").text());
      //   var star = replaceText($elem.find(".diggit .diggnum").text());
      topicUrls.push(href);
    });
    console.log(topicUrls, topicUrls.length, "topicurls");
    async.mapLimit(
      topicUrls,
      5,
      function(url, callback) {
        console.time("耗时");
        superagent.get(url).end(function(err, res) {
          if (err) {
            console.error(err);
          }
          console.log(url + 1);
          var $ = cheerio.load(res.text);
          var content = {
            href: url,
            title: $("#cb_post_title_url").text(),
            star: replaceText($(".diggit .diggnum").text())
            // readed: replaceText($elem.find(".diggit .diggnum").text())
          };
          callback(null, content);
        });
      },
      function(err, result) {
        console.error(err);
        console.log(result, "err fun");
        saveNode(result);
      }
    );
  });
}

function saveNode(data) {
  // 生成数据
  // 写入数据, 文件不存在会自动创建
  fs.writeFile(
    __dirname + "/cnbolg2.json",
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

var urls = [];

for (let i = 2; i < 10; i++) {
  urls[i - 2] = cnodeUrl + i;
}
console.log(urls, "urls");
urls.forEach(function(url) {
  getUrl(url);
});
