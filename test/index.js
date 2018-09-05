const obj = require("../dongqiu.json");

const list = obj.data || [];
// 数据扁平化
const listLength = list.reduce((pre, cur) => {
  let arr = pre.concat();
  const hasDate = cur.filter(m => m.date);
  if (hasDate.length) {
    arr = [...arr, ...hasDate];
    console.log(arr);
  }
  return arr;
}, []);
console.log(listLength.length, "len");
