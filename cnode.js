var cheerio = require("cheerio"),
  superagent = require("superagent"),
  express = require("express"),
  async = require("async"),
  url = require("url");
var cnodeUrl = "http://cnodejs.org/";

function analyze(page) {
  var $ = cheerio.load(page);
  return {
    title: $(".topic_full_title")
      .text()
      .trim(),
    comment1: $(".reply_content")
      .eq(0)
      .text()
      .trim()
  };
}

function fetchUrl(url, callback) {
  superagent.get(url).end(function(err, res) {
    var page = res.text;

    var postTime = analyze(page);

    callback(null, postTime);
  });
}

// start
var app = express();

app.get("/", function(req, res, next) {
  superagent.get(cnodeUrl).end(function(err, sres) {
    if (err) {
      return console.error(err);
    }
    var topicUrls = [];
    var $ = cheerio.load(sres.text);
    $("#topic_list .topic_title").each(function(idx, element) {
      var $element = $(element);
      var href = url.resolve(cnodeUrl, $element.attr("href"));
      topicUrls.push(href);
    });

    async.mapLimit(
      topicUrls,
      5,
      function(url, callback) {
        fetchUrl(url, callback);
      },
      function(err, result) {
        res.send(result);
      }
    );
  });
});

// listen
app.listen(3000, function() {
  console.log("app is listening at port 3000");
});
