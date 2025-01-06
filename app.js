App({
  globalData: {
    userInfo: null,
    // 存储用户学习进度
    learningProgress: {
      characters: [],  // 已学习的汉字
      lessons: [],     // 已完成的课程
      practiceTime: 0  // 练习时长
    }
  },
  
  onLaunch: function() {
    // 初始化云开发
    wx.cloud.init({
      env: 'your-env-id',
      traceUser: true
    })
  }
}) 