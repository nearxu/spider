const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const async = require("async");
const mongoose = require("mongoose");
const q = require('q');

var book = {}
var bookName = '';
var bookChapter = [];
var bookUrl = []
var origin = 'http://so.gushiwen.org';
var website = 'http://so.gushiwen.org/guwen/book_5.aspx';
let arr = [
    {
        bookUrl: 'http://so.gushiwen.org/guwen/book_62.aspx',
        dbName: 'guwenbook39',
        bookName: '贞观政要'
    }
]
mongoose.Promise = q.Promise;
let conno = mongoose.connect('mongodb://localhost:27017/test3up');
mongoose.connection.on('connected', function () {
    console.log("数据库 连接成功");
})
//建立一级书目，与数据库的映射关系
var bookMap = mongoose.Schema({
    dbName: String,
    bookName: String,
    bookUrl: String,
    bookDetail: String,
})

//具体书内容表
var bookItem = mongoose.Schema({
    name: String,
    author: String,
    chapter: String,

    content: String,
    title: String,
    translator: String,
    translate: String,
    originUrl: String,
})

var chapterItem = mongoose.model('chapterItem', bookItem);
let bookListModel = mongoose.model('bookList', bookMap);
var origin = 'http://so.gushiwen.org';
var website = 'http://so.gushiwen.org/guwen/book_5.aspx';

bookListModel.find({}, function (err, data) {
    if (err) {
        console.log('查询失败');
        return
    }
    console.log('当前需要爬取 ' + data.length + ' 项');
    bookList(arr);
});

// 替换为本正则匹配
let replaceFront = {
    reg: /<p.*?>/g,
    replace: ''
};
let replaceEnd = {
    reg: /<\/p.*?>/g,
    replace: '<br/>'
}

let replaceStr = function (str, reg, replace) {
    if (!str) {
        return
    }
    return reg(str, replaceFront.reg, replaceFront.replace, curChapter[1]).replace(replaceEnd.reg, replaceEnd.replace)

}

let noResourceNotice = function (url, title, detail) {
    console.log('当前项：' + title + '  ' + detail + '  url :' + url);
    return ''
}

//正则替换
let reg = function (str, reg, replace, flag) {
    if (!str) {
        console.log(flag + ' 项没有数据')
        return
    } else {
        return str.replace(reg, replace)
    }

}

function bookList(data) {
    async.mapLimit(data, 1, function (series, callback) {
        console.log('主线程开始爬取  ' + series.bookName + '----------');
        getBookData(series.bookUrl, series.bookName, callback)
    }, function (err, result) {
        if (err) {
            console.log(err);
        }
        console.log('数据爬去完毕！')
        getAllBookList(result)
    })
}

function getAllBookList(arr) {
    arr.forEach(function (item, index) {
        item.forEach(function (obj, i) {
            saveDB(obj)
        })
    })
}

function saveDB(obj) {
    let dbModel = new bookListModel(obj);
    dbModel.save(function (err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(obj.bookName + '  数目一级内容保存到数据库成功!')
    })
}

function getBookData(url, name, callback) {
    console.log('init :--------当前爬取: ' + url + '保存db:')
    getBookUrl(url)
}

function getBookUrl(url) {
    request(url, function (err, response, body) {
        let $, bookUrl = [], bookChapter = [];
        if (err) {
            console.log(err);
        }
        if (response && response.statusCode == 200) {
            $ = cheerio.load(body, { decodeEntities: false });
            bookName = $('.cont h1').text();
            $('.bookcont').map(function (i, el) {
                let $me, item;
                $me = $(this);
                item = {
                    chapter: $(el).find('strong').text(),
                    list: getListUrl($, el),
                    content: ''
                }

                bookUrl.push(item)

            })

        }
        book = {
            name: bookName,
            author: '',
            chapterUrl: bookUrl
        }
        getChapter(book)
    })
}

function getListUrl($, selector) {
    let arr = [];
    $(selector).find('a').map(function (i, el) {
        let obj = {
            title: $(el).text(),
            url: origin + $(el).attr('href')
        }
        arr.push(obj)
    })
    return arr;
}

function getChapter(obj) {
    let curBookArr = [];
    let len = obj.chapterUrl.length;
    obj.chapterUrl.forEach(function (item, i) {
        async.mapLimit(item.list, 1, function (series, callback) {
            getArticle(series, callback)
        }, function (err, result) {
            if (err) {
                console.log(err.bookName + '数据抓取失败，现在跳出本章节数据循环，进入下一章节抓取----------')
            }
            curBookArr = curBookArr.concat(result);
            // console.log(curBookArr, 'curbookarr');
            saveCategory(curBookArr);
        })
    })
}

function saveCategory(book) {
    book.forEach(function (item, index) {
        var obj = {
            name: item.name,
            author: item.author,
            chapter: item.chapter,
            content: '',
            title: item.title,
            content: item.content
        }
        var bookListModel = new chapterItem(obj);
        bookListModel.save(function (err) {
            if (err) {
                console.log(err);
                return;
            }
            console.log(item.chapter + '' + item.title + '  保存到数据库成功!')
        })
    })
}

function getArticle(series, callback) {
    request(series.url, function (err, response, body) {
        if (err) {
            console.log('抓取数据失败')
        }
        let $ = cheerio.load(body, { decodeEntities: false });
        //获取当前二级标题和三级标题
        let curChapter = $('.cont').find('h1').html() ? $('.cont').find('h1').html().replace(/<[^>].*>/g, '').trim() : '';

        curChapter = curChapter.split('·');
        let obj = {
            name: book.name,
            author: $('.source a').text(),
            chapter: curChapter[0],
            title: !!curChapter[1] ? curChapter[1] : '',
            translator: $('.right .source span').eq(1).text(),
            content: $('.contson').html() ? reg($('.contson').html(), replaceFront.reg, replaceFront.replace, curChapter[1]).replace(replaceEnd.reg, replaceEnd.replace) : noResourceNotice(series.url, curChapter, '没有内容'),
            translate: $('.shisoncont').html() ? reg($('.shisoncont').html(), replaceFront.reg, replaceFront.replace).replace(replaceEnd.reg, replaceEnd.replace).replace(/<[^>|^br].*?>/g, '') : noResourceNotice(series.url, curChapter, ' 没有翻译'),
            originUrl: series.url
        }
        console.log(bookName + ' ' + curChapter[0] + '     数据抓取完毕 ！')
        callback(null, obj)
    })
}


