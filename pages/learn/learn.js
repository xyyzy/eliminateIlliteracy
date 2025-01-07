const { textToSpeech } = require('../../utils/speech')

Page({
  data: {
    commonCharacters: [
      {
        char: '家',
        pinyin: 'jiā',
        meaning: '住的地方，家庭'
      },
      {
        char: '人',
        pinyin: 'rén',
        meaning: '人类，他人'
      },
      {
        char: '吃',
        pinyin: 'chī',
        meaning: '吃饭，食用'
      },
      {
        char: '水',
        pinyin: 'shuǐ',
        meaning: '水，液体'
      },
      {
        char: '米',
        pinyin: 'mǐ',
        meaning: '大米，食物'
      },
      {
        char: '菜',
        pinyin: 'cài',
        meaning: '蔬菜，饭菜'
      }
    ],
    currentChar: '',
    pinyin: '',
    meaning: '',
    examples: [],
    isPlaying: false,
    recording: false,
    lastRecordFile: null
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
  async playPronunciation() {
    if (this.data.isPlaying) return
    this.setData({ isPlaying: true })

    try {
      const audioPath = await textToSpeech(this.data.currentChar)
      const audioContext = wx.createInnerAudioContext()
      audioContext.src = audioPath
      audioContext.play()

      audioContext.onEnded(() => {
        this.setData({ isPlaying: false })
        audioContext.destroy()
      })

      audioContext.onError(() => {
        console.error('播放失败')
        this.setData({ isPlaying: false })
        audioContext.destroy()
        wx.showToast({
          title: '播放失败',
          icon: 'none'
        })
      })
    } catch (err) {
      console.error('语音合成失败:', err)
      this.setData({ isPlaying: false })
      wx.showToast({
        title: '播放失败',
        icon: 'none'
      })
    }
  },

  // 播放例句
  async playExample(e) {
    const { text } = e.currentTarget.dataset
    if (this.data.isPlaying) return
    this.setData({ isPlaying: true })

    try {
      const audioPath = await textToSpeech(text)
      const audioContext = wx.createInnerAudioContext()
      audioContext.src = audioPath
      audioContext.play()

      audioContext.onEnded(() => {
        this.setData({ isPlaying: false })
        audioContext.destroy()
      })

      audioContext.onError(() => {
        console.error('播放失败')
        this.setData({ isPlaying: false })
        audioContext.destroy()
        wx.showToast({
          title: '播放失败',
          icon: 'none'
        })
      })
    } catch (err) {
      console.error('语音合成失败:', err)
      this.setData({ isPlaying: false })
      wx.showToast({
        title: '播放失败',
        icon: 'none'
      })
    }
  },

  // 播放常用字发音
  async playCommonChar(e) {
    const { char } = e.currentTarget.dataset
    if (this.data.isPlaying) return
    this.setData({ isPlaying: true })

    try {
      const audioPath = await textToSpeech(char)
      const audioContext = wx.createInnerAudioContext()
      audioContext.src = audioPath
      audioContext.play()

      audioContext.onEnded(() => {
        this.setData({ isPlaying: false })
        audioContext.destroy()
      })

      audioContext.onError(() => {
        console.error('播放失败')
        this.setData({ isPlaying: false })
        audioContext.destroy()
        wx.showToast({
          title: '播放失败',
          icon: 'none'
        })
      })
    } catch (err) {
      console.error('语音合成失败:', err)
      this.setData({ isPlaying: false })
      wx.showToast({
        title: '播放失败',
        icon: 'none'
      })
    }
  },

  // 录音练习
  startRecord() {
    const recorderManager = wx.getRecorderManager()
    
    this.setData({ recording: true })

    recorderManager.onStart(() => {
      wx.showToast({
        title: '开始录音',
        icon: 'none'
      })
    })

    recorderManager.start({
      duration: 3000,  // 3秒录音
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3'
    })
  },

  // 停止录音并播放
  stopRecord() {
    if (!this.data.recording) return
    
    const recorderManager = wx.getRecorderManager()
    recorderManager.stop()

    recorderManager.onStop((res) => {
      this.setData({ 
        recording: false,
        lastRecordFile: res.tempFilePath
      })
      // 播放录音
      const audioContext = wx.createInnerAudioContext()
      audioContext.src = res.tempFilePath
      audioContext.play()
    })
  }
}) 