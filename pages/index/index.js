Page({
  data: {
    // 用户信息
    userInfo: null,
    // 学习数据
    learningStats: {
      todayMinutes: 0,
      totalCharacters: 0,
      masteredCharacters: 0
    },
    // 功能模块
    modules: [
      {
        id: 'daily',
        title: '每日学习',
        desc: '从简单汉字开始',
        path: 'pages/learn/learn'
      },
      {
        id: 'conversation',
        title: '日常对话',
        desc: '学习生活用语',
        path: 'pages/conversation/conversation'
      },
      {
        id: 'tools',
        title: '实用工具',
        desc: '方言翻译助手',
        path: 'pages/tools/tools'
      }
    ]
  },

  onLoad() {
    // 获取用户信息和学习数据
    this.getUserInfo()
    this.getLearningStats()
  },

  // 获取用户信息
  getUserInfo() {
    const app = getApp()
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  // 获取学习统计
  getLearningStats() {
    // TODO: 从后端获取学习数据
  },

  // 跳转到对应页面
  navigateTo(e) {
    const { path } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/${path}`,
      fail: (err) => {
        console.error('导航失败：', err)
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
  }
}) 