const obj = require("./cnode.json");
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
// react
// { len : 100 ,type:'js',views:1000}
const keyArr = ["react", "vue", "angular", "node", "react-native", "小程序"];

const totalArr = titleSort.reduce((pre, cur) => {
  const arr = pre.concat();
  const existIndex = keyArr.filter(m => cur.title.indexOf(m) > -1);
  if (existIndex.length) {
    arr.push({
      type: existIndex[0],
      views: cur.views,
      comment: cur.comment
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

function summaryNum(arr, type) {
  return arr.reduce((pre, cur) => {
    let num = pre;
    num = num + parseInt(cur[type]);
    return num;
  }, 0);
}

const sumArr = typeArr.map(m => {
  const sumViews = summaryNum(m.lists, "views");
  const sumComment = summaryNum(m.lists, "comment");
  const averageViews = parseInt(sumViews / m.lists.length);
  return {
    type: m.type,
    len: m.lists.length,
    views: sumViews,
    comment: sumComment,
    averageViews: averageViews
  };
});

// 最后的统计结果
// [ { type: 'node',
//     len: 56,
//     views: 38588,
//     comment: 322,
//     averageViews: 689 },
//   { type: 'vue',
//     len: 7,
//     views: 15581,
//     comment: 56,
//     averageViews: 2225 },
//   { type: '小程序',
//     len: 8,
//     views: 4490,
//     comment: 39,
//     averageViews: 561 },
//   { type: 'react',
//     len: 5,
//     views: 1954,
//     comment: 11,
//     averageViews: 390 },
//   { type: 'angular',
//     len: 3,
//     views: 1268,
//     comment: 9,
//     averageViews: 422 } ] 'sum'


// [ { type: 'node',
//     len: 50,
//     views: 56824,
//     comment: 387,
//     averageViews: 1136 },
//   { type: 'vue',
//     len: 9,
//     views: 12771,
//     comment: 64,
//     averageViews: 1419 },
//   { type: 'react',
//     len: 10,
//     views: 6783,
//     comment: 70,
//     averageViews: 678 },
//   { type: '小程序',
//     len: 5,
//     views: 2657,
//     comment: 15,
//     averageViews: 531 } ] 'sum'


[{
  type: 'node',
  len: 62,
  views: 56364,
  comment: 452,
  averageViews: 909
},
{
  type: '小程序',
  len: 4,
  views: 4144,
  comment: 16,
  averageViews: 1036
},
{
  type: 'react',
  len: 7,
  views: 6226,
  comment: 75,
  averageViews: 889
},
{
  type: 'vue',
  len: 9,
  views: 4162,
  comment: 20,
  averageViews: 462
},
{
  type: 'angular',
  len: 1,
  views: 380,
  comment: 0,
  averageViews: 380
}] 'sum'

console.log(sumArr, "sum");
