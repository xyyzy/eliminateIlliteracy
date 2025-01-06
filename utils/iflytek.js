import CryptoJS from './crypto'

// 讯飞语音服务配置
const APPID = 'add9a620'
const API_SECRET = 'ZjQ2YmU1ZDlhMWRiZGE2OGYwNzk1NGU1'
const API_KEY = '8dce74ded2bdd16f03d4c91c6fc53f01'

// 讯飞语音合成API地址
const TTS_URL = 'https://api.xf-yun.com/v1/private/tts_online'
const HOST = 'api.xf-yun.com'

// 修改鉴权方法
function getAuthUrl() {
  // 1. 生成RFC1123格式的时间戳
  const date = new Date().toUTCString()
  
  // 2. 生成signature原始字段
  const signatureOrigin = [
    `host: ${HOST}`,
    `date: ${date}`,
    'POST /v1/private/tts_online HTTP/1.1'
  ].join('\n')

  // 3. 使用HMAC-SHA256加密
  const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, API_SECRET)
  const signature = signatureSha.toString()

  // 4. 生成authorization_origin
  const authorizationOrigin = [
    `api_key="${API_KEY}"`,
    'algorithm="hmac-sha256"',
    'headers="host date request-line"',
    `signature="${signature}"`
  ].join(', ')

  // 5. Base64编码得到最终的authorization
  const authorization = wx.btoa(authorizationOrigin)

  return {
    authorization,
    date
  }
}

// 修改请求头格式
export const textToSpeech = async (text) => {
  const auth = getAuthUrl()
  
  return new Promise((resolve, reject) => {
    const requestData = {
      header: {
        app_id: APPID
      },
      parameter: {
        tts: {
          vcn: 'xiaoyan',    // 发音人
          speed: 50,         // 语速
          volume: 50,        // 音量
          pitch: 50,         // 音高
          aue: 'lame',       // 音频编码，改为mp3格式
          sfl: 1,            // 流式返回
          auf: 'audio/L16;rate=16000', // 音频采样率
          bgs: 0,            // 是否有背景音乐
          tte: 'UTF8'        // 文本编码
        }
      },
      payload: {
        text: wx.btoa(text)  // Base64编码文本
      }
    }

    wx.request({
      url: TTS_URL,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': auth.authorization,
        'Date': auth.date,
        'Host': HOST
      },
      data: requestData,
      responseType: 'arraybuffer',
      success: (res) => {
        if (res.statusCode === 200) {
          const fsm = wx.getFileSystemManager()
          const tempFilePath = `${wx.env.USER_DATA_PATH}/tts_temp.mp3`
          
          try {
            fsm.writeFileSync(
              tempFilePath,
              res.data,
              'binary'
            )
            resolve(tempFilePath)
          } catch (err) {
            reject(err)
          }
        } else {
          reject(new Error(`语音合成失败: ${res.statusCode}`))
        }
      },
      fail: reject
    })
  })
}

// 使用示例
export const playText = async (text) => {
  try {
    wx.showLoading({ title: '加载中...' })
    
    // 获取音频文件
    const audioPath = await textToSpeech(text)
    
    // 播放音频
    const audioContext = wx.createInnerAudioContext()
    audioContext.src = audioPath
    
    audioContext.onCanplay(() => {
      wx.hideLoading()
      audioContext.play()
    })
    
    audioContext.onError(() => {
      wx.hideLoading()
      wx.showToast({
        title: '播放失败',
        icon: 'none'
      })
    })
    
    // 播放完成后清理
    audioContext.onEnded(() => {
      audioContext.destroy()
      // 删除临时文件
      wx.getFileSystemManager().unlink({
        filePath: audioPath,
        fail: console.error
      })
    })
  } catch (err) {
    wx.hideLoading()
    wx.showToast({
      title: '语音合成失败',
      icon: 'none'
    })
    console.error('语音合成错误：', err)
  }
} 