const async = require("async");
var arr = [
  { name: "Jack", delay: 200 },
  { name: "Mike", delay: 100 },
  { name: "Freewind", delay: 300 },
  { name: "Test", delay: 50 },
  { name: "Jack1", delay: 200 },
  { name: "Mike1", delay: 100 },
  { name: "Freewind1", delay: 300 },
  { name: "Test1", delay: 50 },
  { name: "Jack2", delay: 200 },
  { name: "Mike2", delay: 100 },
  { name: "Freewin2", delay: 300 },
  { name: "Test2", delay: 50 }
];

async.mapLimit(
  arr,
  3,
  function(item, callback) {
    console.log("1.5 enter: " + item.name);
    setTimeout(function() {
      console.log("1.5 handle: " + item.name);
      if (item.name === "Jack") callback("myerr");
      else callback(null, item.name + "!!!");
    }, item.delay);
  },
  function(err, result) {
    console.log("1.5 err: ", err);
    console.log("1.5 result: ", result);
  }
);

// 1.5 enterJack
// 1.5 enterMike
// 1.5 handleMike
// 1.5 enterFreewind
// 1.5 handleJack
// 1.5 err myerr
// 1.5 result [ undefined, 'Mike!!!' ]
// 1.5 handleFreewind
