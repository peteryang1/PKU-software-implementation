var SideViewJS = require("../../views/sideSliderView/sideSliderView.js")
const app = getApp();
var _that = null;

function init(that) {
  _that = that;
  _that.setData({
    markers: [],
    circles: [],
    polyline: [],
    polygons: [],
    controls: [
       {
         id: 0,
         iconPath: '../../images/Floors.png',
         position: {
           left: 5,
           top: 375,
           width: 50,
           height: 50
         },
         clickable: true
       },
      {
        id: 1,
        iconPath: '../../images/Filter.png',
        position: {
          left: 5,
          top: 15,
          width: 50,
          height: 50
        },
        clickable: true
      }
    ]
  })
}

function reFreshTheQQMap() {
  _that.setData({
    markers: app.globalData.floors[app.globalData.currentFloor].Markers,
    circles: app.globalData.floors[app.globalData.currentFloor].Circles,
    polygons: app.globalData.floors[app.globalData.currentFloor].Polygons,
    mapOn: true
  });
  if (app.globalData.showRoute === true)
    _that.setData({
      polyline: app.globalData.floors[app.globalData.currentFloor].Polylines
    });
  else
    _that.setData({
      polyline: null
    });
  if (app.globalData.floors[app.globalData.currentFloor].Markers == [])
    _that.setData({
      markers: null
    });
  else
    _that.setData({
      markers: app.globalData.floors[app.globalData.currentFloor].Markers
    });
}

function markertap(e) {
  var markerValue = app.globalData.markerValue[e.markerId];
  if (markerValue == -1) return;
  if (typeof markerValue == 'string') {

    //set detailed_page : global data
    getApp().globalData.detailed_page = markerValue;
    console.log(getApp().globalData.detailed_page)

    // TODO: 详情页
    console.log("详情页：" + markerValue);
    wx.navigateTo({
      url: '../D3web-view/d3web-view',
      //url: '../../pages/wx-parse/wx-parse',
    })
  }
  else {
    // TODO: 拿到活动ID还可以加feature
    console.log("活动" + markerValue);
  }
}

function controltap(e) {
  var _this = this;
  switch (e.controlId) {
    case 0:
      {
        /*
        wx.showActionSheet({
          itemList: Object.keys(app.globalData.floors),
          success(res) {
            app.globalData.currentFloor = Object.keys(app.globalData.floors)[res.tapIndex];
            _this.reFreshTheQQMap();
          }
        })
        */
        wx.navigateTo({
          url: '../../pages/acti-list/acti-list',
        })

        break;
      }
    case 1:
      {
        SideViewJS.tap_ch();
        break;
      }
  }
}
module.exports = {
  init: init,
  reFreshTheQQMap: reFreshTheQQMap,
  markertap: markertap,
  controltap: controltap
}