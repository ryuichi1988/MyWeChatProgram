//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    title:""

  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

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
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },
  bindKinput:function(e) {
    this.data.title = e.detail.value
    this.setData({
      word: e.detail.value,
      title: e.detail.value,
    })
  },
  bindcolor1:function(e) {
    this.data.color1 = e.detail.value
    this.setData({
      color1:e.detail.value
    })
  },

  tapped:function(e){
    const db = wx.cloud.database()
    var test = e.detail.value.color1
    //var myDate = Date()
    //new mmm = myDate.toLocaleDateString()
    db.collection('counters').add({
      data: {
        _id:e.detail.value.word,
        a_0__Color:e.detail.value.color1,
        a_1__XS:e.detail.value.color1xs,
        a_2__S:e.detail.value.color1s,
        a_3__M:e.detail.value.color1m,
        a_4__L:e.detail.value.color1l,
        a_5__XL:e.detail.value.color1xl,
        b_0__Color:e.detail.value.color2,
        b_1__XS:e.detail.value.color2xs,
        b_2__S:e.detail.value.color2s,
        b_3__M:e.detail.value.color2m,
        b_4__L:e.detail.value.color2l,
        b_5__XL:e.detail.value.color2xl,
      },

      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        this.setData({
          counterId: "testID",
          count: 1
        })
        wx.showToast({
          title: '新增记录成功',
        })
        console.log(res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
 },
 bindHideKeyboard: function (e) {
  if (e.detail.value != '') {
    // 收起键盘
    wx.hideKeyboard()
  }
},
 onQuery: function() {
  const db = wx.cloud.database()
  // 查询当前用户所有的 counters
  db.collection('counters').where({
    _id : this.data.title
  }).get({
    success: res => {
      this.setData({
        queryResult: JSON.stringify(res.data, null, 2)
      })
      console.log('[数据库] [查询记录] 成功: ', res)
    },
    fail: err => {
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      })
      console.error('[数据库] [查询记录] 失败：', err)
    }
  })
},

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})
