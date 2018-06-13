var cheerio = require("cheerio");
var fs = require("fs");
var async = require("async");
var superagent = require("superagent");
var request = require("request");

//第三级 每个章节的内容

// var getUrl = require("./getBookListTwo");

// function asyncGetChapter(list) {
//   async.mapLimit(
//     list,
//     1,
//     (series, callback) => {
//       let doc = series._doc;
//       let bookInfo = {
//         dbName: doc.dbName,
//         bookName: doc.bookName,
//         author: doc.author
//       };
//       getChapterInfo(doc.bookUrl, bookInfo, callback);
//     },
//     (err, result) => {
//       if (err) {
//         console.log(err);
//       }
//       console.log(result);
//     }
//   );
// }
// 每一章的内容
var bookJson = {
  content: []
};
function getChapterInfo(url, bookInfo, callback) {
  request(url, function(err, response, body) {
    let $,
      bookUrl = [],
      bookChapter = [];
    if (err) {
      console.log(err);
    }
    if (response && response.statusCode == 200) {
      $ = cheerio.load(body);
      $ = cheerio.load(body, {
        decodeEntities: false
      });
      bookName = $(".cont h1").text();
      $(".bookcont").map(function(i, el) {
        let $me, item;
        $me = $(this);
        item = {
          chapter: $(el)
            .find("strong")
            .text(),
          list: getListUrlAndTitle($, el),
          content: ""
        };
        bookUrl.push(item);
      });
    }
    let sectionList = getSectionFromChapter(bookUrl, bookInfo);

    async.mapLimit(
      sectionList,
      3,
      function(series, callback) {
        getArticle(series, callback);
      },
      function(err, result) {
        console.log("-------数据抓取成功----------");
        console.log(
          "当前抓取第 " +
            bookJson.content.length +
            "项，总共 " +
            length +
            "项数据"
        );
        bookJson.content.push({ content: result });
      }
    );
  });
}

function replaceText(text) {
  return text.replace(/\n/g, "").replace(/\s/g, "");
}

// 替换为本正则匹配
var replaceFront = {
  reg: /<p.*?>/g,
  replace: ""
};
var replaceEnd = {
  reg: /<\/p.*?>/g,
  replace: "<br/>"
};

function getArticle(series, callback) {
  request(series.url, function(err, response, body) {
    if (err) {
      console.log(err);
    }
    var $ = cheerio.load(body);
    var contents = $(".contson p").map(function(i, el) {
      return replaceText($(el).text());
    });

    var obj = {
      name: "鬼谷子",
      content: contents,
      originUrl: series.url
    };
    callback(null, obj);
  });
}

/**
 * 获取一级章节内所有二级章节名 和对应url
 * @param {*} $
 * @param {*} selector
 */
const origin = "http://so.gushiwen.org";
function getListUrlAndTitle($, selector) {
  let arr = [];
  $(selector)
    .find("a")
    .map(function(i, el) {
      let obj = {
        title: $(el).text(),
        url: origin + $(el).attr("href")
      };
      arr.push(obj);
    });
  return arr;
}

// 遍历二级章节 返回文档 行数据
function getSectionFromChapter(chapterUrl = [], bookInfo) {
  let sectionArr = [];
  chapterUrl.map((item, index) => {
    let tempArr = item.list.map((childItem, index) => {
      return {
        chapter: item.chapter,
        section: childItem.title,
        url: childItem.url
        // dbName: bookInfo.dbName,
        // bookName: bookInfo.bookName,
        // author: bookInfo.author
      };
    });
    sectionArr = sectionArr.concat(tempArr);
  });
  return sectionArr;
}

var testUrl = "http://so.gushiwen.org/guwen/book_27.aspx";
getChapterInfo(testUrl);
