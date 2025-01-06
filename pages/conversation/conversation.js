Page({
  data: {
    dialogues: [
      {
        id: 1,
        title: '基础对话一',
        level: '入门',
        conversations: [
          {
            question: '你好',
            answer: '你好',
            pinyin: 'nǐ hǎo',
            standardAudio: '/audios/nihao.mp3'
          },
          {
            question: '你叫什么名字？',
            answer: '我叫小明',
            pinyin: 'nǐ jiào shénme míngzi? wǒ jiào xiǎo míng',
            standardAudio: '/audios/name.mp3'
          },
          {
            question: '你好吗？',
            answer: '我很好',
            pinyin: 'nǐ hǎo ma? wǒ hěn hǎo'
          }
        ]
      },
      {
        id: 2,
        title: '买菜对话',
        level: '日常',
        conversations: [
          {
            question: '这个菜多少钱？',
            answer: '两块钱一斤',
            pinyin: 'zhège cài duōshao qián? liǎng kuài qián yì jīn'
          },
          {
            question: '能便宜点吗？',
            answer: '好，一块八一斤',
            pinyin: 'néng piányi diǎn ma? hǎo, yí kuài bā yì jīn'
          }
        ]
      }
    ],
    currentDialogue: null,
    currentIndex: 0,
    recording: false,
    lastRecordFile: null,
    standardAudioContext: null,
    recordAudioContext: null
  },

  onLoad() {
    this.setData({
      standardAudioContext: wx.createInnerAudioContext(),
      recordAudioContext: wx.createInnerAudioContext()
    })
  },

  onUnload() {
    if (this.data.standardAudioContext) {
      this.data.standardAudioContext.destroy()
    }
    if (this.data.recordAudioContext) {
      this.data.recordAudioContext.destroy()
    }
  },

  // 选择对话
  selectDialogue(e) {
    const { id } = e.currentTarget.dataset
    const dialogue = this.data.dialogues.find(d => d.id === id)
    this.setData({
      currentDialogue: dialogue,
      currentIndex: 0
    })
  },

  // 播放标准音频
  playStandardAudio() {
    const { currentDialogue, currentIndex, standardAudioContext } = this.data
    if (!currentDialogue) return

    const audioUrl = currentDialogue.conversations[currentIndex].standardAudio
    standardAudioContext.src = audioUrl
    standardAudioContext.play()

    standardAudioContext.onError(() => {
      wx.showToast({
        title: '音频播放失败',
        icon: 'none'
      })
    })
  },

  // 开始录音
  startRecord() {
    const recorderManager = wx.getRecorderManager()
    
    this.setData({ recording: true })

    recorderManager.onStart(() => {
      wx.showToast({
        title: '开始录音',
        icon: 'none'
      })
    })

    recorderManager.onStop((res) => {
      this.setData({
        recording: false,
        lastRecordFile: res.tempFilePath
      })
      // 录音完成后自动播放
      this.playRecordedAudio()
    })

    recorderManager.start({
      duration: 10000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3'
    })

    // 5秒后自动停止录音
    setTimeout(() => {
      if (this.data.recording) {
        recorderManager.stop()
      }
    }, 5000)
  },

  // 停止录音
  stopRecord() {
    if (this.data.recording) {
      const recorderManager = wx.getRecorderManager()
      recorderManager.stop()
    }
  },

  // 播放录音
  playRecordedAudio() {
    const { lastRecordFile, recordAudioContext } = this.data
    if (!lastRecordFile) return

    recordAudioContext.src = lastRecordFile
    recordAudioContext.play()

    recordAudioContext.onError(() => {
      wx.showToast({
        title: '录音播放失败',
        icon: 'none'
      })
    })
  },

  // 下一句对话
  nextConversation() {
    if (!this.data.currentDialogue) return
    
    const maxIndex = this.data.currentDialogue.conversations.length - 1
    const nextIndex = this.data.currentIndex + 1
    
    if (nextIndex <= maxIndex) {
      this.setData({
        currentIndex: nextIndex,
        lastRecordFile: null
      })
    } else {
      wx.showToast({
        title: '对话练习完成！',
        icon: 'success'
      })
    }
  }
}) 