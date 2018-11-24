// let a = [[[0, 1], [2, 3]], [[4, 5], [6, 7]]];

const deepFlat = (lists) => [].concat(...lists.map(m => Array.isArray(m) ? deepFlat(m) : m))
const listSort = (arr, type) => arr.sort((a, b) => parseInt(b[type]) - parseInt(a[type]));

const titles = ["react", "vue", "angular", "node", "react-native", "小程序"];
const keyArr = (arr, titles) => titles.map(m => arr.filter(item => item.title.indexOf(m) > -1));

const statis = keys => {
    return keys.map((m, i) => {
        if (m.length) {
            const sumCom = m.reduce((pre, cur) => {
                return pre + parseInt(cur.comment)
            }, 0)
            const sumViews = m.reduce((pre, cur) => pre + parseInt(cur.views), 0);
            return {
                title: titles[i],
                len: m.length,
                comment: sumCom,
                views: sumViews
            }
        } else {
            return {
                title: titles[i],
                len: 0,
                comment: 0,
                views: 0
            }
        }
    })
}

module.exports =
    function formatData(data) {
        const flat = deepFlat(data);
        const sortArr = listSort(flat);
        const keys = keyArr(sortArr, titles);
        const statisArr = statis(keys)
        return statisArr;

    }