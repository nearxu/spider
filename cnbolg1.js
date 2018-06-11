var cheerio = require("cheerio"),
  superagent = require("superagent"),
  express = require("express"),
  async = require("async"),
  url = require("url");

// var pageNum = [];
// for (let i = 2; i < 40; i++) {
//   pageNum[i - 2] = i;
// }

// var cnodeUrl = "https://www.cnblogs.com/?CategoryId=808#p=";
var cnodeUrl = [];
for (var i = 1; i <= 10; i++) {
  cnodeUrl.push("https://www.cnblogs.com/?CategoryId=808#p" + i);
}

var topicUrls = [];
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
  comment: String,
  star: String
  //   readed: String
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

function replaceText(text) {
  return text.replace(/\n/g, "").replace(/\s/g, "");
}

// var params = {
//   p: pageNum
// };
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
      // saveNode(result);
    }
  );
});
