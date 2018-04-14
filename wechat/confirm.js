/*
  处理验证服务器有效性的逻辑
 */
const sha1 =require('sha1')
const rp = require('request-promise')
const tools = require('../utils/tools')

/*
  创建Wechat构造函数，用来生成access_token，全局唯一凭据
    我们调用微信的接口，必须携带上access_token参数

  access_token:
    1. 保证全局唯一凭据，保存为本地文件
    2. 凭据每两个小时必须更新一次



 */

function Wechat (options) {

  this.appID = options.appID
  this.appsecret = options.appsecret

  this.getAccessToken()
    .then(res => {
      this.saveAccessToken(res)
    }, err => {

    })
}

//保存access_token的方法
Wechat.prototype.saveAccessToken = function (data) {
  return tools.writeFileAsync(data)
}

//获取access_token的方法
Wechat.prototype.getAccessToken = function () {

  const url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='
    + this.appID + '&secret=' + this.appsecret
  /*
    request
    request-promise
   */
  return new Promise((resolve, reject) => {
    rp({method: 'GET', url: url, json: true})
      .then(res => {
        // const accessToken = res.access_token
        // const expiresIn = res.expires_in
        // console.log('**accessToken**' + accessToken)
        resolve(res)
      }, err => {
        // console.log('**err**' + err)
        reject(err)
      })
  })
}

module.exports = function (config) {

  new Wechat(config)

  return (req, res) => {
    console.log(req.query)
    /*
    { signature: 'aafa8610cb353c4f22901bdb790853b180c4dc45',  //微信加密签名，经过三个参数timestamp、nonce、token的某种算法推出来的
    echostr: '13459011908045741823', //微信随机字符串
    timestamp: '1523687157', //微信发送请求时间
    nonce: '1055096708' }  //微信随机数字
     */
    /*
      验证服务器的有效性：
        1. 将三个参数timestamp、nonce、token组合起来，进行字典序排序
        2. 将排序完的字符串拼接在一起
        3. 将拼接好字符串进行sha1加密
        4. 将加密的字符串与微信传过来的签名对比，如果正确说明验证成功，返回echostr给微信服务器
     */
    const signature = req.query.signature
    const echostr = req.query.echostr
    const timestamp = req.query.timestamp
    const nonce = req.query.nonce
    const token = config.token

    // const arr = [timestamp, nonce, token]
    // console.log('**arr**' + arr) // 1523687960,154201006,atguiguHTML1208
    // const arrSorted = arr.sort()
    // console.log('**arrSorted**' + arrSorted) // 1523687960,154201006,atguiguHTML1208
    // const str = arrSorted.join('')
    // console.log('**str**' + str)// 1523687960154201006atguiguHTML1208
    // const shaStr = sha1(str)
    // console.log('**shaStr**' + shaStr) // d5284b2496142b77d4ac206fcf4e99d17aeb49d8 d5284b2496142b77d4ac206fcf4e99d17aeb49d8

    const shaStr = sha1([timestamp, nonce, token].sort().join(''))

    if (shaStr === signature) {  //确认消息来自微信服务器
      res.send(echostr)
    } else {
      res.send('error')
    }

  }
}