var cheerio = require("cheerio"),
  superagent = require("superagent"),
  express = require("express"),
  async = require("async"),
  url = require("url");

var cnodeUrl = "http://cnodejs.org/?tab=all&page=";
var topicUrls = [];
var pageNum = [];
for (let i = 2; i < 40; i++) {
  pageNum[i - 2] = i;
}
// mongoose
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var DB_URL = "mongodb://localhost:27017/cnode";
var db = mongoose.createConnection(DB_URL);
db.on("connected", function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("db connected success");
  }
});

var Schema = mongoose.Schema;
var nodeSchema = new Schema({
  title: String,
  href: String,
  comment: String
});

var nodeModel = db.model("nodeModel", nodeSchema);

function saveNode(list) {
  nodeModel.insertMany(list, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("插入成功");
    }
  });
}

var params = {
  page: pageNum
};
superagent
  .get(cnodeUrl)
  .query(params)
  .end(function(err, ele) {
    if (err) console.log(err);
    var $ = cheerio.load(ele.text);
    $("#topic_list .topic_title").each(function(idx, element) {
      var $element = $(element);
      var href = url.resolve(cnodeUrl, $element.attr("href"));
      topicUrls.push(href);
    });
    console.log(topicUrls, "topicurls");
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
            title: $(".topic_full_title")
              .text()
              .trim(),
            href: url,
            comment: $(".reply_content")
              .eq(0)
              .text()
              .trim()
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
