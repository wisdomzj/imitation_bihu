const tools = {
    formatDate(time, format = "YY-MM-DD hh:mm:ss") {
        let date = new Date(time);
        let year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            hour = date.getHours(),
            min = date.getMinutes(),
            sec = date.getSeconds();
        let preArr = Array.apply(null, Array(10)).map(function (el, index) {
            return "0" + index;
        });
        let newTime = format.replace(/YY/g, year)
            .replace(/MM/g, preArr[month] || month)
            .replace(/DD/g, preArr[day] || day)
            .replace(/hh/g, preArr[hour] || hour)
            .replace(/mm/g, preArr[min] || min)
            .replace(/ss/g, preArr[sec] || sec);
        return newTime;
    }
}

module.exports = tools