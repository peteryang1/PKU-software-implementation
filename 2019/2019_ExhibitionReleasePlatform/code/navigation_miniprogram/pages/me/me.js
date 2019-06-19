import {
  $init,
  $digest
} from '../../utils/common.util'
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    albumsList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    $init(this);
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
    const db = wx.cloud.database()
    db.collection('albums').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        var albumCovers = [];
        res.data.forEach(function (record) {
          albumCovers.push({
            id: record._id,
            img: record.albumPages[0],
            name: record.albumTitle,
          })
        })
        this.setData({
          albumsList: albumCovers
        })
        $digest(this)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  onAlbumClick: function (e) {
    wx.navigateTo({
      url: '../albumDetail/index?album_cloudid=' + e.currentTarget.dataset.value + '&openid=' + app.globalData.openid,
    })
  },

  onGetUserInfo: function (e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },
  goTop: function (t) {
    this.setData({
      scrollTop: 0
    });
  },

  scroll: function (t) {
    this.setData({
      indexSearch: t.detail.scrollTop
    }), t.detail.scrollTop > 300 ? this.setData({
      floorstatus: !0
    }) : this.setData({
      floorstatus: !1
    });
  },

  showMyOrder: function () {
    wx.navigateTo({
      url: '../userOrder/index',
    })
  },
  deleteAlbum: function (e) {
    var _this = this;
    if (e.currentTarget.dataset.value) {
      wx.showModal({
        title: '提示',
        content: '确定要删除吗？',
        success: function (sm) {
          if (sm.confirm) {
            const db = wx.cloud.database()
            db.collection('albums').doc(e.currentTarget.dataset.value).remove({
              success: res => {
                var idx = 0;
                _this.data.albumsList.forEach(function (album) {
                  if (album.id === e.currentTarget.dataset.value) {
                    _this.data.albumsList.splice(idx, 1)
                    $digest(_this);
                  }
                  ++idx;
                })
                wx.showToast({
                  title: '删除成功',
                })
              },
              fail: err => {
                wx.showToast({
                  icon: 'none',
                  title: '删除失败',
                })
                console.error('[数据库] [删除记录] 失败：', err)
              }
            })
          } else if (sm.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
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

    //去我的书架
  toUserCollect: function () {
    wx.navigateTo({
      url: '../../pages/bookStore/bookStore',
    })
  }
})