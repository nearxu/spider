const superagent = require("superagent");
const cheerio = require("cheerio");
const async = require("async");
var url = require("url");

const reptileUrl = "http://www.dongqiudi.com/archives/1?page=";

function replaceText(text) {
  return text.replace(/\n/g, "").replace(/\s/g, "");
}

var pageNum = [];
for (let i = 2; i < 40; i++) {
  pageNum[i - 2] = i;
}
var params = {
  page: pageNum
};

let topicUrls = [];

superagent
  .get(reptileUrl)
  .query(params)
  .end(function(err, res) {
    if (err) console.log(err);
    var $ = cheerio.load(JSON.parse(res.text)); // 服务端渲染爬不出来
    console.log($);
    $("#news_list ol li").each(function(i, elem) {
      var $elem = $(elem);
      var title = replaceText($elem.find("h2").text());
      //   var href = $elem.find("a").attr("href");
      var href = url.resolve(reptileUrl, $elem.attr("href"));
      console.log(href, "href");
      topicUrls.push(href);
    });
    console.log(topicUrls, "topicUrls");
    async.mapLimit(
      topicUrls,
      5,
      function(url, callback) {
        superagent.get(url).end(function(err, res) {
          if (err) {
            console.log(err);
          }
          var $ = cheerio.load(res.text);
          var content = {
            title: replaceText($(".detail h1")),
            date: replaceText($(".detail .time")),
            href: url
          };
          callback(null, content);
        });
      },
      function(err, result) {
        console.log(result, "result");
      }
    );
  });
