var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var DB_URL = "mongodb://localhost:27017/cnode";
var db = mongoose.createConnection(DB_URL);
db.on("connected", function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("db connected success");
  }
});

var Schema = mongoose.Schema;
var nodeSchema = new Schema({
  title: String,
  href: String,
  comment: String
});

var nodeModel = db.model("nodeModel", nodeSchema);

module.exports = nodeModel;
