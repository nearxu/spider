var cheerio = require("cheerio");
var fs = require("fs");
var async = require("async");
var superagent = require("superagent");
var request = require("request");

var baseUrl = "http://so.gushiwen.org/guwen/Default.aspx?p=";
var totalPages = 5;

var init = function() {
  var pageUrlList = getPageUrlList(totalPages, baseUrl);
  getBookList(pageUrlList);
};

function getPageUrlList(count, baseUrl) {
  let pageUrlList = [];
  for (let i = 1; i < count; i++) {
    pageUrlList.push(baseUrl + i);
  }
  return pageUrlList;
}

function getBookList(pageUrlList) {
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
      getAllBookList(result);
    }
  );
}

// 当前页书籍一级目录
function getCurPage(bookUrl, callback) {
  console.log(bookUrl, "url");
  request(bookUrl, function(err, response, body) {
    if (err) {
      console.log("err url" + bookUrl);
      callback(null, null);
      return;
    } else {
      $ = cheerio.load(body);
      // let curBookName = $(".sonspic h1").text();
      let curBookList = getCurPageBookList($, body);
      callback(null, curBookList);
    }
  });
}

var count = 0;
var origin = "http://so.gushiwen.org";
var prefix = "guwenbook";
// 生成dbname
function getDBName(prefix) {
  return prefix + count++;
}

// 当页内容
function getCurPageBookList($, body) {
  let BookListDom = $(".sonspic .cont");
  let BookList = [];
  BookListDom.each(function(index, el) {
    let obj = {
      dbName: getDBName(prefix),
      bookName: $(el)
        .find("p b")
        .text(), // 书名
      bookUrl:
        origin +
        $(el)
          .find("p a")
          .attr("href"), //书目链接
      bookDetail: $(el)
        .find("p")
        .eq(1)
        .text()
        .trim() // 书籍介绍
    };
    BookList.push(obj);
  });
  console.log(BookList, "booklist");
  return BookList;
}

function getAllBookList(result) {
  console.log(result, "resutl");
}

init();
