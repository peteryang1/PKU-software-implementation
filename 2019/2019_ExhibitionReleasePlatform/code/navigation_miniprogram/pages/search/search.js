// pages/search/search.js

const recorderManager = wx.getRecorderManager()

recorderManager.onStart(() => {
  console.log('recorder start')
})
recorderManager.onPause(() => {
  console.log('recorder pause')
})
recorderManager.onStop((res) => {
  console.log('recorder stop', res)
  const { tempFilePath } = res
})
recorderManager.onFrameRecorded((res) => {
  const { frameBuffer } = res
  console.log('frameBuffer.byteLength', frameBuffer.byteLength)
})

const options = {
  duration: 10000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'aac',
  frameSize: 50
}


//  wechat si
//const plugin = requirePlugin("WechatSI")
//const manager = plugin.getRecordRecognitionManager()



Page({

  /**
   * 页面的初始数据
   */
  data: {
    results: [],
    urlImg: getApp().globalData.urlImg,
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  myRecordSpeechFunction: function () {
    recorderManager.start(options)
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

  },

  onConfirm: function(e){
    let that = this

    var key = e.detail.value;
    wx.request({
      url: getApp().globalData.url + '/api/get_search',
      method: 'GET',
      data:{
        key: e.detail.value,
      },
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        if (res.data.code == 200) {
          console.log(res.data.data)
          that.setData({
            results: res.data.data
          })
        } else {
          wx.showToast({
            title: '请求失败，请稍后重试',
            duration: 2000
          })
        }
      },
      fail: function (e) {
        console.log('网络出错');
      }
    })

  },

  toBookAbstract: function (e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../../pages/bookAbstract/bookAbstract?id=' + id,
    })
  }
  
})