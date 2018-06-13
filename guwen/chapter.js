const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const async = require("async");
const q = require("q");
const logger = require("./log");
let getBookData = require("./getBookData");

// 根据一级书目进入书籍页面 抓取书籍页面章节信息和章节链接

// 遍历链接 发起并行抓取操作 这里设置并发为
function asyncGetChapter(list) {
  async.mapLimit(list, 1, (series, callback) => {
    let doc = series._doc;
    let bookInfo = {
      dbName: doc.dbName,
      bookName: doc.bookName,
      author: doc.author
    };
  });
}

function getChapterInfo(url, bookInfo, callback) {}
