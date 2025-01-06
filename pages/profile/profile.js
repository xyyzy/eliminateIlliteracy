Page({
  data: {
    userInfo: null,
    menuItems: [
      {
        id: 'history',
        title: '学习记录'
      },
      {
        id: 'favorite',
        title: '我的收藏'
      },
      {
        id: 'settings',
        title: '设置'
      }
    ]
  },

  onLoad() {
    this.getUserInfo()
  },

  getUserInfo() {
    const app = getApp()
    this.setData({
      userInfo: app.globalData.userInfo
    })
  }
}) 