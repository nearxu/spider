const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var DB_URL = "mongodb://localhost:27017/sumCnode";

var db = mongoose.createConnection(DB_URL);

db.on("connected", function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("数据库连接成功");
  }
});

var Scheme = mongoose.Schema;
var sumSchema = new Scheme({
  type: String,
  len: Number,
  views: Number,
  comment: Number,
  aver: Number
});

var sum = db.model("sum", sumSchema);

function saveMongoData(obj) {
  var data = new sum(obj);
  data.save((err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`数据类型 ${obj.type}插入成功`);
    }
  });
}

function saveData(list) {
  list.forEach((item, index) => {
    saveMongoData(item);
    if (index === list.length - 1) {
      console.log("当前数据保存完成");
    }
  });
}

const totles = [
  {
    type: "node",
    len: 56,
    views: 38588,
    comment: 322,
    averageViews: 689
  },
  {
    type: "vue",
    len: 7,
    views: 15581,
    comment: 56,
    averageViews: 2225
  },
  {
    type: "小程序",
    len: 8,
    views: 4490,
    comment: 39,
    averageViews: 561
  },
  {
    type: "react",
    len: 5,
    views: 1954,
    comment: 11,
    averageViews: 390
  },
  {
    type: "angular",
    len: 3,
    views: 1268,
    comment: 9,
    averageViews: 422
  }
];

saveData(totles);
