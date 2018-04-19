/*
  处理验证服务器有效性的逻辑
 */
const sha1 =require('sha1')
// const Wechat = require('./wechat')
const tools = require('../utils/tools')
const reply = require('./reply')

module.exports = function (config) {

  return async (req, res) => {
    console.log(req.query)
    const signature = req.query.signature
    const echostr = req.query.echostr
    const timestamp = req.query.timestamp
    const nonce = req.query.nonce
    const token = config.token

    const shaStr = sha1([timestamp, nonce, token].sort().join(''))

    if (req.method === 'GET') {
      // 验证服务器的有效性
      if (shaStr === signature) {  //确认消息来自微信服务器
        res.send(echostr)
      } else {
        res.send('error')
      }
    } else if (req.method === 'POST') {
      //微信用户发送消息
      console.log(req.query)
      if (shaStr !== signature) { //消息不来自微信服务器直接return
        res.send('error')
        return
      }
      //获取用户xml数据
      const xmlData = await tools.getXMLAsync(req)
      console.log(xmlData)
      //将xml数据转化为js对象
      const jsData = await tools.parseXMLAsync(xmlData)
      console.log(jsData)
      //将js对象中的数组干掉
      const message = tools.formatMessage(jsData.xml)
      console.log(message)

      const replyMessage = await reply(message)
      console.log(replyMessage)

      res.send(replyMessage)
    }
  }
}
