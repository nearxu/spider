var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var async = require("async");
const mongoose = require('mongoose');
const q = require('q');

var origin = 'http://so.gushiwen.org';
var website = 'http://so.gushiwen.org/guwen/book_5.aspx';
var baseUrl = 'http://so.gushiwen.org/guwen/Default.aspx?p=';
var total = 1;
let options = {
    server: { poolSize: 5 }
}

mongoose.Promise = q.Promise;
let conno = mongoose.connect('mongodb://localhost:27017/test3');
mongoose.connection.on('connected', function () {
    console.log("数据库 连接成功");
})

// let conno = mongoose.createConnection('mongodb://47.52.115.169/guwen',options);
// mongoose.connection.on('connected',function(){
//     console.log('连接成功')
// })

let bookMap = mongoose.Schema({
    dbName: String,
    bookName: String,
    bookUrl: String,
    bookDetail: String,
})

let bookListModel = conno.model('booklists',bookMap);
// let bookList = new bookListModel();

init()
function init() {
    console.log('---------好戏开始，dang dang dang dang！--------')
    const pageUrlList = getPageUrlList(total, baseUrl);
    getBookList(pageUrlList);
}

function getPageUrlList(total, url) {
    let list = [];
    for (let i = 0; i <= total; i++) {
        list.push(baseUrl + i)
    }
    return list;
}

function getBookList(pageUrlList) {
    async.mapLimit(pageUrlList, 3, function (series, callback) {
        getCurPage(series, callback)
    }, function (err, result) {
        if (err) {
            console.log('------------异步执行出错!----------')
            return
        }
        getAllBookList(result);
    })
}

function getCurPage(bookUrl, callback) {
    request(bookUrl, function (err, response, body) {
        if (err) {
            console.log('当前链接发生错误，url地址为:' + bookUrl);
            callback(null, null)
            return
        } else {
            $ = cheerio.load(body, { decodeEntities: false });
            let curBookName = $('.sonspic h1').text();
            let curBookList = getCurPageBookList($, body);
            callback(null, curBookList)
        }
    })
}

function getCurPageBookList($, body) {
    let BookListDom = $('.sonspic .cont');
    let BookList = [];
    BookListDom.each(function (index, el) {
        let obj = {
            // dbName: getDBName(prefix),
            bookName: $(el).find('p b').text(), // 书名
            bookUrl: origin + $(el).find('p a').attr('href'), //书目链接
            bookDetail: $(el).find('p').eq(1).text().trim(),// 书籍介绍
            imageUrl: $(el).find('a img').attr('src'),//书籍图片地址
        }
        BookList.push(obj)
    })
    return BookList
}

function getAllBookList(arr) {
   arr.forEach(function(Item,index){
       Item.forEach(function(obj,index){
           saveDB(obj)
       })
   })
}

function saveDB(obj){
    let dbModel = new bookListModel(obj);
    dbModel.save(function(err){
        if(err){
            console.log(err);
            return ;
        }
        console.log(obj.bookName + '  数目一级内容保存到数据库成功!')
    })
}