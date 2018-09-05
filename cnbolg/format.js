const obj = require("./cn.json");
const lists = obj.data;

// 数据扁平化 list
const titleList = lists.reduce((pre, cur) => {
  let arr = pre.concat();
  let has = cur.filter(m => m.id);
  if (has.length) {
    arr = [...arr, ...has];
  }
  return arr;
}, []);

// 根据 comment view 排序 找出最热的话题
const titleSort = titleList.sort(
  (a, b) => parseInt(b.views) - parseInt(a.views)
);

console.log(titleSort, "titleSore", titleSort.length);

// 4000 条数据 根据关键字 进行分组匹配
// js python c java go ios android 如何 学习
// { len : 100 ,type:'js',views:1000}
const keyArr = ["js", "python", "java", "android", "ios", "go"];

const totalArr = titleSort.reduce((pre, cur) => {
  const arr = pre.concat();
  const existIndex = keyArr.filter(m => cur.title.indexOf(m) > -1);
  if (existIndex.length) {
    arr.push({
      type: existIndex[0],
      views: cur.views
    });
  }
  return arr;
}, []);

console.log(totalArr, "totalArr");

function getArrIndexByKey(arr, key, value) {
  let index = -1;
  arr.forEach((a, idx) => {
    if (a[key] === value) index = idx;
  });
  return index;
}

const typeArr = totalArr.reduce((pre, cur) => {
  let list = pre.concat();
  let existIndex = getArrIndexByKey(list, "type", cur.type);
  if (existIndex < 0) {
    list.push({
      type: cur.type,
      lists: [cur]
    });
  } else {
    list[existIndex].lists.push(cur);
  }
  return list;
}, []);

console.log(typeArr, "type");

const sumArr = typeArr.map(m => {
  const sum = m.lists.reduce((pre, cur) => {
    let num = pre;
    num = num + parseInt(cur.views);
    return num;
  }, 0);
  return {
    type: m.type,
    len: m.lists.length,
    views: sum
  };
});

// 最后的统计结果
// [ { type: 'java', len: 72, views: 36538 },
//   { type: 'js', len: 58, views: 19869 },
//   { type: 'go', len: 62, views: 22672 },
//   { type: 'ios', len: 1, views: 1120 },
//   { type: 'python', len: 84, views: 28073 },
//   { type: 'android', len: 3, views: 467 } ]

console.log(sumArr, "sum");
