var cheerio = require("cheerio");
var fs = require("fs");
var async = require("async");
var superagent = require("superagent");
var request = require("request");

var website = "https://so.gushiwen.org/guwen/book_8.aspx";

var bookUrl = [];
var bookChapter = [];
var bookName = "";
var book;
var origin = "http://so.gushiwen.org";

function getUrl(website) {
  request(website, function(err, response, body) {
    if (err) {
      console.log(err);
    }
    if (response && response.statusCode == 200) {
      var $ = cheerio.load(body);
      bookName = $(".cont h1").text();
      $(".bookcont").map(function(i, el) {
        var $me, item;
        $me = $(this);
        item = {
          chapter: $(el)
            .find("strong")
            .text(),
          list: getListUrl($, el),
          content: ""
        };

        bookUrl.push(item);
        console.log(bookUrl, "bookUrl");
      });
    }
  });
}

// 批量获取详细的篇幅 文章的url
function getListUrl($, selector) {
  var arr = [];
  $(selector)
    .find("a")
    .map(function(i, el) {
      var obj = {
        title: $(el).text(),
        url: origin + $(el).attr("href")
      };
      arr.push(obj);
    });
  return arr;
}

getUrl(website);
