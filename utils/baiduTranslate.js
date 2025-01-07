// 百度语音服务配置
const CONFIG = {
  APP_ID: '6246266',
  API_KEY: 'srNmWSNnJT2eEmpcTxiZDRvP',
  SECRET_KEY: 'Isn16dZ0ytHJohjlb4SWxBxHFXHfriNZ',
  WS_URL: 'wss://aip.baidubce.com/ws/realtime_speech_trans'
}

// 获取访问令牌
async function getAccessToken() {
  try {
    const response = await wx.request({
      url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${CONFIG.API_KEY}&client_secret=${CONFIG.SECRET_KEY}`,
      method: 'POST'
    })

    if (response.data && response.data.access_token) {
      return response.data.access_token
    } else {
      throw new Error('获取access_token失败')
    }
  } catch (error) {
    console.error('获取access_token错误:', error)
    throw error
  }
}

// WebSocket连接管理
class TranslationService {
  constructor() {
    this.socketTask = null
    this.isConnected = false
    this.onTranslationCallback = null
    this.audioContext = null
  }

  // 初始化WebSocket连接
  async connect() {
    if (this.isConnected) return

    try {
      const accessToken = await getAccessToken()
      const url = `${CONFIG.WS_URL}?access_token=${accessToken}`

      this.socketTask = wx.connectSocket({
        url,
        success: () => {
          console.log('WebSocket连接成功')
        },
        fail: (error) => {
          console.error('WebSocket连接失败:', error)
        }
      })

      this.socketTask.onOpen(() => {
        this.isConnected = true
        this._sendStartParams()
      })

      this.socketTask.onMessage(this._handleMessage.bind(this))

      this.socketTask.onError((error) => {
        console.error('WebSocket错误:', error)
      })

      this.socketTask.onClose(() => {
        this.isConnected = false
        console.log('WebSocket连接关闭')
      })
    } catch (error) {
      console.error('初始化WebSocket失败:', error)
      throw error
    }
  }

  // 发送开始参数
  _sendStartParams() {
    const startParams = {
      "type": "START",
      "from": "zh",  // 源语言：中文
      "to": "zh",    // 目标语言：中文（普通话）
      "app_id": CONFIG.APP_ID,
      "app_key": CONFIG.API_KEY,
      "sampling_rate": 16000
    }
    
    this.socketTask.send({
      data: JSON.stringify(startParams)
    })
  }

  // 发送音频数据
  sendAudioData(audioData) {
    if (!this.isConnected) return
    
    const audioMessage = {
      "type": "AUDIO",
      "data": wx.arrayBufferToBase64(audioData)
    }
    
    this.socketTask.send({
      data: JSON.stringify(audioMessage)
    })
  }

  // 结束识别
  sendEnd() {
    if (!this.isConnected) return

    const endMessage = {
      "type": "FINISH"
    }
    
    this.socketTask.send({
      data: JSON.stringify(endMessage)
    })
  }

  // 处理服务器返回的消息
  _handleMessage(message) {
    try {
      const response = JSON.parse(message.data)
      if (response.type === 'RESULT' && this.onTranslationCallback) {
        // 只返回文本结果
        this.onTranslationCallback({
          result: response.data.result || ''
        })
      }
    } catch (error) {
      console.error('处理消息失败:', error)
    }
  }

  // 设置翻译结果回调
  onTranslation(callback) {
    this.onTranslationCallback = callback
  }

  // 关闭连接
  close() {
    if (this.socketTask) {
      this.socketTask.close()
      this.isConnected = false
      this.socketTask = null
    }
  }
}

// 录音管理
class RecordManager {
  constructor(translationService) {
    this.recorderManager = wx.getRecorderManager()
    this.translationService = translationService
    this._initRecorderListeners()
  }

  _initRecorderListeners() {
    // 监听录音开始事件
    this.recorderManager.onStart(() => {
      console.log('录音开始')
    })

    // 监听录音结束事件
    this.recorderManager.onStop((res) => {
      console.log('录音结束')
      this.translationService.sendEnd()
    })

    // 监听录音错误事件
    this.recorderManager.onError((error) => {
      console.error('录音错误:', error)
    })

    // 监听录音数据
    this.recorderManager.onFrameRecorded((res) => {
      const { frameBuffer } = res
      if (frameBuffer) {
        this.translationService.sendAudioData(frameBuffer)
      }
    })
  }

  // 开始录音
  startRecord() {
    this.recorderManager.start({
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'PCM',
      frameSize: 1280
    })
  }

  // 停止录音
  stopRecord() {
    this.recorderManager.stop()
  }
}

// 导出服务
export const createTranslationService = () => {
  const translationService = new TranslationService()
  const recordManager = new RecordManager(translationService)
  
  return {
    // 初始化服务
    async init() {
      await translationService.connect()
    },
    
    // 开始录音和翻译
    startTranslation() {
      recordManager.startRecord()
    },
    
    // 停止录音和翻译
    stopTranslation() {
      recordManager.stopRecord()
    },
    
    // 设置翻译结果回调
    onTranslation(callback) {
      translationService.onTranslation(callback)
    },
    
    // 关闭服务
    close() {
      translationService.close()
    }
  }
} 