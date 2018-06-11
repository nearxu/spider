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

let topicUrls = [];

function getData(url) {
  superagent
    .get(reptileUrl)
    .query(params)
    .end(function(err, res) {
      if (err) console.log(err);
      var data = JSON.parse(res.text).data; // 服务端渲染爬不出来
      data.forEach(function(elem) {
        topicUrls.push(elem);
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
            var content = JSON.parse(res.text).data;
            callback(null, content);
          });
        },
        function(err, result) {
          console.log(result, "result");
          fs.writeFile(
            __dirname + "/article.json",
            JSON.stringify({
              status: 0,
              data: result
            }),
            function(err) {
              if (err) console.log(err);
              console.log("写入完成");
            }
          );
        }
      );
    });
}
