// 使用微信同声传译插件
const plugin = requirePlugin("WechatSI")

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
    recording: false
  },

  // 开始录音
  startRecord(e) {
    const { index } = e.currentTarget.dataset
    const recorderManager = wx.getRecorderManager()

    this.setData({ recording: true })

    recorderManager.onStart(() => {
      wx.showToast({
        title: '开始录音',
        icon: 'none'
      })
    })

    recorderManager.onStop((res) => {
      this.setData({ recording: false })
      const { tempFilePath } = res
      this.playRecordedAudio(tempFilePath)
    })

    recorderManager.start({
      duration: 10000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3'
    })

    // 3秒后自动停止录音
    setTimeout(() => {
      if (this.data.recording) {
        recorderManager.stop()
      }
    }, 3000)
  },

  // 播放录音
  playRecordedAudio(filePath) {
    const audioContext = wx.createInnerAudioContext()
    audioContext.src = filePath
    audioContext.play()

    audioContext.onError((err) => {
      wx.showToast({
        title: '播放失败',
        icon: 'none'
      })
      console.error('播放错误：', err)
    })
  }
}) 