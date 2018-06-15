/**
 * 获取依赖
 * @type {*}
 */
const superagent = require("superagent");
const cheerio = require("cheerio");
const fs = require("fs");
/**
 * 定义请求地址
 * @type {*}
 */
const reptileUrl = "https://www.zhihu.com/";
/**
 * 处理空格和回车
 * @param text
 * @returns {string}
 */
function replaceText(text) {
  return text.replace(/\n/g, "").replace(/\s/g, "");
}
/**
 * 核心业务
 * 发请求，解析数据，生成数据
 */
superagent.get(reptileUrl).end(function(err, res) {
  // 抛错拦截
  if (err) {
    console.log(err);
  }
  // 解析数据
  let $ = cheerio.load(res.text);
  /**
   * 存放数据容器
   * @type {Array}
   */
  let data = [];
  // 获取数据
  $(".TopstoryMain .TopstoryItem").each(function(i, elem) {
    console.log(elem);
    let _this = $(elem);
    data.push({
      id: i,
      avatar: replaceText(_this.find(".ContentItem-title div a").text())
      // replies: replaceText(_this.find(".count_of_replies").text()),
      // visits: replaceText(_this.find(".count_of_visits").text()),
      // title: replaceText(
      //   _this.find(".topic_title_wrapper .topic_title").text()
      // ),
      // date: replaceText(_this.find(".last_time .last_active_time").text())
    });
    // data.push({
    //   id: _this.attr("data-note-id"),
    //   slug: _this
    //     .find(".title")
    //     .attr("href")
    //     .replace(/\/p\//, ""),
    //   author: {
    //     slug: _this
    //       .find(".avatar")
    //       .attr("href")
    //       .replace(/\/u\//, ""),
    //     avatar: _this.find(".avatar img").attr("src"),
    //     nickname: replaceText(_this.find(".blue-link").text()),
    //     sharedTime: _this.find(".time").attr("data-shared-at")
    //   },
    //   title: replaceText(_this.find(".title").text()),
    //   abstract: replaceText(_this.find(".abstract").text()),
    //   thumbnails: _this.find(".wrap-img img").attr("src"),
    //   collection_tag: replaceText(_this.find(".collection-tag").text()),
    //   reads_count:
    //     replaceText(
    //       _this
    //         .find(".ic-list-read")
    //         .parent()
    //         .text()
    //     ) * 1,
    //   comments_count:
    //     replaceText(
    //       _this
    //         .find(".ic-list-comments")
    //         .parent()
    //         .text()
    //     ) * 1,
    //   likes_count:
    //     replaceText(
    //       _this
    //         .find(".ic-list-like")
    //         .parent()
    //         .text()
    //     ) * 1
    // });
  });
  // 生成数据
  // 写入数据, 文件不存在会自动创建
  fs.writeFile(
    __dirname + "/article.json",
    JSON.stringify({
      status: 0,
      data: data
    }),
    function(err) {
      if (err) console.log(err);
      console.log("写入完成");
    }
  );
});
