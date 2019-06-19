// pages/mainMap/mainMap.js

// TODO: 合这几个文件夹以及D3View
var ReadJsonJS = require("../../js/readFromJSON.js");
var QQMapViewJS = require("../../views/qqMapView/qqMapView.js");
var SideViewJS = require("../../views/sideSliderView/sideSliderView.js");
const app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchPage: false, 
    mapOn: false,

    map: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;
    QQMapViewJS.init(that);

    // request map
    that.getMap();
    
    ReadJsonJS.ReadJsonToGeoPage();
    SideViewJS.init(that);
    QQMapViewJS.reFreshTheQQMap();

  },

  getMap: function(){
    
    let that = this
    wx.request({
      url: getApp().globalData.url + '/api/get_map',
      data: {
        projectId: getApp().globalData.project_id,
        //openId: wx.getStorageSync('openid'),
      },
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {

        that.setData({
          map: res.data
        })
        
        // async
        getApp().globalData.map = that.data.map;
        ReadJsonJS.ReadJsonToGeoPage();
        SideViewJS.init(that);
        QQMapViewJS.reFreshTheQQMap();
      },
      fail: function (e) {
        console.log('网络出错');
      }
    })
  },


  tapCat(event) { SideViewJS.selectFromCat(event); },
  black_cover_tap() { SideViewJS.close(); },
  reFreshTheQQMap: function () { QQMapViewJS.reFreshTheQQMap(); },
  controltap(e) { QQMapViewJS.controltap(e); },
  markertap(e) { QQMapViewJS.markertap(e); },

  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})