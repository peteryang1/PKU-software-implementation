var _that = null;
var categories = {};
let app = getApp();
var strFloor = "楼层";
var strRoute = "导览路线";
function init(that) {
  _that = that;
  _that.setData({
    open: false,
    // mark 是指原点x轴坐标
    mark: 0,
    // newmark 是指移动的最新点的x轴坐标 
    newmark: 0,
    istoright: true,
  });
  requestCategories();
}

function requestCategories() {
  categories[strFloor] = [];
  Object.keys(app.globalData.floors).forEach(function (idx) {
    categories[strFloor].push({ value: idx, selected: false });
  });
  categories[strFloor][0].selected = true;
  categories[strRoute] = [];
  categories[strRoute].push({ value: '路线', selected: true });
  _that.setData({ categoryList: categories });
}

// 点击左上角小图标事件
function tap_ch() {
  if (_that.data.open) {
    _that.setData({
      open: false
    });
  } else {
    _that.setData({
      open: true
    });
  }
}

function selectFromCat(event) {
  var key = event.target.dataset.key;
  var value = event.target.dataset.value;
  if (key === strFloor) {
    var same = false;
    categories[key].forEach(function (item) {
      if (item.value === value && item.selected === true) same = true;
      item.selected = false;
    });
    categories[key].forEach(function (item) {
      if (item.value === value) { item.selected = true; }
    });
    if (same === true) return;
    app.globalData.currentFloor = value;
    _that.reFreshTheQQMap();
  }
  else if (key === strRoute) {
    if (categories[key][0].selected == true) {
      categories[key][0].selected = false;
      _that.setData({
        polyline: null,
      })
      app.globalData.showRoute = false;
    }
    else {
      categories[key][0].selected = true;
      _that.setData({
        polyline: app.globalData.floors[app.globalData.currentFloor].Polylines,
      })
      app.globalData.showRoute = true;
    }
  }
  _that.setData({ categoryList: categories });
}

function close() {
  _that.setData({
    open: false
  });
}

module.exports = {
  init: init,
  tap_ch: tap_ch,
  requestCategories: requestCategories,
  selectFromCat: selectFromCat,
  close: close
}