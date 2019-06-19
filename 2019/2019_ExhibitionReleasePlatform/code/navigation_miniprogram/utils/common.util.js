import objectUtil from './object.util'

const formatNumber = (n) => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatTime = (date) => {
  return formatDate(date) + ' ' + [
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  ].map(formatNumber).join(':')
}

const formatDate = (date) => {
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  ].map(formatNumber).join('-')
}

const $init = (page) => {
  page.$data = objectUtil.$copy(page.data, true)
}

const $digest = (page) => {
  let data = page.data
  let $data = page.$data
  let ready2set = {}

  for (let k in data) {
    if (!objectUtil.$isEqual(data[k], $data[k])) {
      ready2set[k] = data[k]
      $data[k] = objectUtil.$copy(data[k], true)
    }
  }

  if (Object.keys(ready2set).length) {
    page.setData(ready2set)
  }
}

function wxPromisify(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }

      obj.fail = function (res) {
        reject(res)
      }

      fn(obj)//执行函数，obj为传入函数的参数
    })
  }
}

module.exports = {
  formatDate,
  formatTime,
  $init,
  $digest,
  wxPromisify
}
