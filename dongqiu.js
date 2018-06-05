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
const reptileUrl = "https://www.dongqiudi.com";
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
  $("#news_list ol li").each(function(i, elem) {
    console.log(elem);
    let _this = $(elem);
    data.push({
      id: i,
      avatar: _this.find(".pc_count img").attr("href"),
      title: replaceText(_this.find("h2").text())
    });
  });
  console.log(data);
  fs.writeFile(
    __dirname + "/dongqiudi.json",
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
