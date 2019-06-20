// pages/D3web-view/d3web-view.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // TODO: 详情页
    //url: 'http://localhost:8000/index'

    //url: 'http://localhost:8000/api/' + getApp().globalData.project_id + '/' + getApp().globalData.detailed_page

    url: '',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //getDetailedPage();

    console.log(getApp().globalData.project_id);
    console.log(getApp().globalData.detailed_page);

    this.setData({

      url: getApp().globalData.url + '/api/' + getApp().globalData.project_id + '/' + getApp().globalData.detailed_page
      //url: getApp().globalData.url + '/api/4/yyyy'

    })

    console.log(this.data.url);
  },

  getDetailedPage: function(){

    let that = this
    wx.request({
      url: getApp().globalData.url + '/api/get_detailed_page',
      data: {
        projectId: getApp().globalData.project_id,
        detailedPage: getApp().globalData.detailed_page,
        //openId: wx.getStorageSync('openid'),
      },
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        if (res.data.code == 200) {
          that.setData({
            url: res.data.data,
            //isSelect: res.data.data.collect == 1,
            //this_chapter_num: res.data.data.chapterid
          })
        } else {
          wx.showToast({
            title: '请求失败，请稍后重试',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function (e) {
        console.log('网络出错');
      }
    })
  },

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