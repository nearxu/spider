const superagent = require("superagent");
const cheerio = require("cheerio");
const async = require("async");
var url = require("url");
const fs = require("fs");
const reptileUrl = "http://www.dongqiudi.com/archives/1?page=";

let topicUrls = [];

function getData(reptileUrl) {
  superagent.get(reptileUrl).end(function(err, res) {
    if (err) console.log(err);
    var content = JSON.parse(res.text).data;
    topicUrls.push(content);
    console.log(topicUrls, topicUrls.length, "topicurl");
    saveNode(topicUrls);
  });
}

for (let i = 2; i < 10; i++) {
  getData(reptileUrl + i);
}

function saveNode(result) {
  fs.writeFile(
    __dirname + "/qonqiu1.json",
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
