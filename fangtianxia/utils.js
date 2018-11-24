const randomRang = (min, max, nums) => {
    // var crateNum = Math.floor(Math.random() * (max - min) + min);
    let arr = [];
    // for (let i = 0; i <= num; i++) {
    //     arr.push(Math.floor(Math.random() * (max - min) + min))
    // }
    while (arr.length < nums) {
        let num = Math.floor(Math.random() * (max - min) + min);
        if (!arr.includes(num)) {
            arr.push(num);
        }
    }
    return arr.sort((a, b) => a - b);
}

console.log(randomRang(1, 12, 10))