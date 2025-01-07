const { createTranslationService } = require('../../utils/baiduTranslate')

Page({
  data: {
    tools: [
      {
        id: 'voice',
        name: '语音转文字',
        desc: '说话转成文字'
      },
      {
        id: 'translate',
        name: '方言翻译',
        desc: '方言转普通话'
      }
    ],
    // 翻译相关状态
    isTranslating: false,
    translationResult: '',
    translationService: null
  },

  onLoad() {
    // 初始化翻译服务
    this.initTranslationService()
  },

  async initTranslationService() {
    try {
      const translationService = createTranslationService()
      await translationService.init()
      
      // 设置翻译结果回调
      translationService.onTranslation((result) => {
        if (result && result.result) {
          this.setData({
            translationResult: result.result
          })
        }
      })

      this.setData({ translationService })
    } catch (error) {
      console.error('初始化翻译服务失败:', error)
      wx.showToast({
        title: '初始化服务失败',
        icon: 'none'
      })
    }
  },

  // 开始翻译
  startTranslation() {
    const { translationService } = this.data
    if (!translationService) {
      wx.showToast({
        title: '服务未初始化',
        icon: 'none'
      })
      return
    }

    this.setData({ 
      isTranslating: true,
      translationResult: ''
    })
    translationService.startTranslation()
  },

  // 停止翻译
  stopTranslation() {
    const { translationService } = this.data
    if (!translationService) return

    this.setData({ isTranslating: false })
    translationService.stopTranslation()
  },

  onUnload() {
    // 页面卸载时关闭服务
    const { translationService } = this.data
    if (translationService) {
      translationService.close()
    }
  }
}) 