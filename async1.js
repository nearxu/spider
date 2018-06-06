var async = require("async");

var count = 0;
var fetchUrl = function(url, callback) {
  var delay = parseInt((Math.random() * 10000000) % 2000, 10);
  count++;
  console.log(
    "现在的并发数是：",
    count,
    "正在住区的是URL:",
    url,
    "耗时",
    delay
  );
  setTimeout(function() {
    count--;
    callback(null, url + "html content");
  });
};

var urls = [];
for (var i = 0; i < 30; i++) {
  urls.push("http://datasource_" + i);
}

function start() {
  async.mapLimit(
    urls,
    5,
    function(url, callback) {
      fetchUrl(url, callback);
    },
    function(err, result) {
      console.log("final :");
      console.log(result, "result");
    }
  );
}

start();
