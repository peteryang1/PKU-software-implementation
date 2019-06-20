//app.js
App({
  onLaunch: function () {
    var that = this
  
    //this.globalData = {}
    this.globalData.floors = {};
    this.globalData.markerValue = {};
    this.globalData.showRoute = true;
  
    /*
    //登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('code',res.code)
        wx.request({
          url: that.globalData.url + '/api/get_auth',
          data: { 
            code: res.code
          },
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            if(res.data.code == 200){
              wx.setStorageSync('openid', res.data.openid)
            }else{
              wx.showToast({
                title: '请求失败，请稍后重试',
                icon: 'none',
                duration: 2000
              })
            }
            console.log(res.data)
          },
          fail: function (e) {
            console.log('网络出错');
          }
        })
      }
    })
    */
  },
  globalData: {
    url:'https://week.wuxinghw.com',//正式环境
    // url:'https://apitest.fang88.com',//测试线上环境
    //url: 'https://api.brightness.xin',
    urlImg: 'https://week.wuxinghw.com/static/image/',//图片前缀
    //url: 'http://127.0.0.1:8000',//测试环境
    //urlImg: 'http://127.0.0.1:8000/static/image/',//图片前缀
    // urlImgend:'?x-oss-process=style/pic_64x64'
    // urlImgend: '?x-oss-process=style/pic_100x100'
    // urlImgend: '?x-oss-process=style/pic_x60'
    // urlImgend: '?x-oss-process=style/index_pic'
    urlImgend: '?x-oss-process=style/728_488_crop',
    urlImgLayout: '?x-oss-process=style/mini_thumbnail',
    // urlImgend: '?x-oss-process=style/475_680_crop'
    // urlImgend: '?x-oss-process=style/640_400_crop'

    //map
    
    currentFloor: 1,
    floors: {},
    pageNames: {},
    showRoute: true,
    markerValue: {},

    project_id: 1,
    detailed_page: '',
    map:"",
  }
})