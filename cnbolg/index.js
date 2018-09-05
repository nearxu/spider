var cheerio = require("cheerio");
var fs = require("fs");
var async = require("async");
var superagent = require("superagent");
var request = require("request");

let urlsArray = []; //存放爬取网址
let pageUrls = []; //存放收集文章页面网站
const pageNum = 200; //要爬取文章的页数

function ToJson(data) {
  // 生成数据
  // 写入数据, 文件不存在会自动创建
  fs.writeFile(
    __dirname + "/cn.json",
    JSON.stringify({
      status: 0,
      data: data
    }),
    function(err) {
      if (err) console.log(err);
      console.log("写入完成");
    }
  );
}

function replaceText(text) {
  return text.replace(/\n/g, "").replace(/\s/g, "");
}

function replaceTextToNum(text) {
  return text
    .replace(/\n/g, "")
    .replace(/\s/g, "")
    .replace(/[^0-9]+/g, "");
}

function getPageUrl() {
  let urlArr = [];
  for (var i = 1; i <= pageNum; i++) {
    urlArr.push(
      "http://www.cnblogs.com/?CategoryId=808&CategoryType=%22SiteHome%22&ItemListActionName=%22PostList%22&PageIndex=" +
        i +
        "&ParentCategoryId=0"
    );
  }
  return urlArr;
}

const init = () => {
  urlsArray = getPageUrl();
  getPageList(urlsArray);
};

function getPageList(urls) {
  async.mapLimit(
    urls,
    5,
    function(page, callback) {
      getCurrentPage(page, callback);
    },
    function(err, result) {
      if (err) {
        console.log(err);
        return;
      }
      ToJson(result);
    }
  );
}

function getCurrentPage(page, callback) {
  request(page, function(err, response, body) {
    if (err) {
      callback(null, null);
    } else {
      $ = cheerio.load(body);
      let lists = [];
      $("#post_list .post_item").each(function(i, el) {
        let $el = $(el);
        let obj = {
          id: `${i}${Math.random()}`,
          title: replaceText($el.find(".titlelnk").text()),
          comment: replaceTextToNum($el.find(".article_comment ").text()),
          views: replaceTextToNum($el.find(".article_view a").text())
        };
        lists.push(obj);
      });
      callback(null, lists);
    }
  });
}

init();
