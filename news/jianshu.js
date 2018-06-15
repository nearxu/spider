var cheerio = require("cheerio"),
  superagent = require("superagent"),
  express = require("express"),
  async = require("async"),
  url = require("url");

var cnodeUrl = "http://www.jianshu.com/";

superagent.get(cnodeUrl).end(function(err, res) {
  if (err) console.log(err);
  let lists = [];
  var $ = cheerio.load(res.text);
  $("#list-container .note-list li").each(function(idx, element) {
    var _this = $(element);
    lists.push({
      id: _this.attr("data-note-id")
    });
  });
  console.log(lists, "lists");
});
