const { playText } = require('../../utils/iflytek')

Page({
  data: {
    currentChar: '',
    pinyin: '',
    meaning: '',
    examples: [],
    isPlaying: false
  },

  onLoad() {
    this.loadTodayCharacter()
  },

  // 加载今日汉字
  loadTodayCharacter() {
    // 这里可以从后端或本地存储获取每日学习的汉字
    // 目前使用示例数据
    this.setData({
      currentChar: '爱',
      pinyin: 'ài',
      meaning: '喜爱；关爱；爱护',
      examples: [
        { text: '爱心', pinyin: 'àixīn' },
        { text: '关爱', pinyin: 'guān\'ài' },
        { text: '爱护', pinyin: 'àihù' }
      ]
    })
  },

  // 播放发音
  playPronunciation() {
    if (this.data.isPlaying) return

    this.setData({ isPlaying: true })
    
    playText(this.data.currentChar)
      .then(() => {
        this.setData({ isPlaying: false })
      })
      .catch(err => {
        console.error('播放失败:', err)
        this.setData({ isPlaying: false })
        wx.showToast({
          title: '播放失败',
          icon: 'none'
        })
      })
  },

  // 播放例句
  playExample(e) {
    const { text } = e.currentTarget.dataset
    if (this.data.isPlaying) return

    this.setData({ isPlaying: true })
    
    playText(text)
      .then(() => {
        this.setData({ isPlaying: false })
      })
      .catch(err => {
        console.error('播放失败:', err)
        this.setData({ isPlaying: false })
        wx.showToast({
          title: '播放失败',
          icon: 'none'
        })
      })
  }
}) 