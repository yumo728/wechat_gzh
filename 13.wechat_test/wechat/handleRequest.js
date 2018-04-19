/*
  处理微信服务器发送过来的请求，并返回响应给微信服务器
    - get 返回echostr，最终是微信服务器进行验证
    - post 返回xml数据，最终是用户看到的信息
 */
const sha1 = require('sha1')
const Wechat = require('./wechat')
const utils = require('../libs/utils')
const reply = require('./reply')

module.exports = function (config) {

  // new Wechat(config)

  return async (req, res) => {
    console.log(req.query)
    /*
    { signature: '554423fdaa127c14c2905913a4d20da14edcb00a', 微信加密后的签名，通过token、timestamp、nonce三个参数经过某种算法加密而成
    echostr: '18269558017539096573', 微信后台提供的随机字符串，验证通过后需要将其发送给微信后台
    timestamp: '1523355308', 微信后台发送请求的时间戳
    nonce: '2787221870' } 微信后台发送的随机数字
     */
    const signature = req.query.signature
    const echostr = req.query.echostr
    const timestamp = req.query.timestamp
    const nonce = req.query.nonce
    const token = config.token

    /*
    //将token、timestamp、nonce三个参数组合在一起
    let str = [token, timestamp, nonce]
    console.log(str) //  [ 'atguiguHTML1208', '1523356070', '653673440' ]
    //将其按字典序排序
    str = str.sort()
    console.log(str) //  [ '1523356070', '653673440', 'atguiguHTML1208' ]
    //将三个参数拼接在一起
    str = str.join('')
    console.log(str)  //1523356070653673440atguiguHTML1208
    //进行sha1加密
    str = sha1(str)
    console.log(str)  //58263469ec03b42c8defc8fb733aa249a3dbfd91
    */

    const str = sha1([token, timestamp, nonce].sort().join(''))
    if (req.method === 'GET') {
      //与signature进行对比
      if (str === signature) {
        res.send(echostr)
      } else {
        res.send('error')
      }

    } else if (req.method === 'POST') {
      //用户发给公众号的消息会通过微信服务器转发给开发者服务器
      //请求方式是POST，数据格式是xml
      //POST请求参数在请求体中，它也能和GET请求一样将参数放在URL后面，此时就是查询字符串，通过req.query就能获取。
      /*
        { signature: '104346a6ad5381345d658115cfbb4f21d37e16ed',
          timestamp: '1523408484',
          nonce: '1817923401',
          openid: 'oAsoR1iP-_D3LZIwNCnK8BFotmJc' }  用户的id标识，每个用户的id标识都是唯一的
       */
      //不管是get请求还是post请求都需要做签名验证，也就是验证服务器地址有效性，防止其他无关微信的请求过来
      if (str !== signature) {
        res.send('error')
        return false
      }

      //获取到请求体中的xml数据
      //为了避免层层回调地狱，使用async，以同步的方式写异步代码
      const xml = await utils.getXMLAsync(req)
      // console.log(xml)
      /*
      <xml>
        <ToUserName><![CDATA[gh_4fe7faab4d6c]]></ToUserName>
        <FromUserName><![CDATA[oAsoR1iP-_D3LZIwNCnK8BFotmJc]]></FromUserName>
        <CreateTime>1523409751</CreateTime>
        <MsgType><![CDATA[text]]></MsgType>
        <Content><![CDATA[JJ]]></Content>
        <MsgId>6542995059376334714</MsgId>
      </xml>
       */

      //将xml数据解析成js对象
      const jsData = await utils.parseXMLAsync(xml)
      // console.log(jsData)
      /*
      { xml:
       { ToUserName: [ 'gh_4fe7faab4d6c' ],
         FromUserName: [ 'oAsoR1iP-_D3LZIwNCnK8BFotmJc' ],
         CreateTime: [ '1523410342' ],
         MsgType: [ 'text' ],
         Content: [ '，哦哦哦' ],
         MsgId: [ '6542997597702006757' ] } }
       */

      //格式化数据，去掉[]
      const message = utils.formatMessage(jsData.xml)
      // console.log(message)
      /*
      { ToUserName: 'gh_4fe7faab4d6c',  开发者的openid
        FromUserName: 'oAsoR1iP-_D3LZIwNCnK8BFotmJc',  用户的openid
        CreateTime: '1523411135',  用户发送消息的时间
        MsgType: 'text',   用户触发的类型（文本/事件/图片/视频/音频）
        Content: '哈哈哈',  //用户发送的消息
        MsgId: '6543001003611072608' }  //用户发送消息对应的id
       */

      //设置xml格式的消息，回复给用户
      /*
        注意事项：
          0. 回复消息，必须以微信提供的模板格式进行回复
          2. 不能有多余空格，否则会提示'该公众号提供的服务出现故障，请稍后再试'
       */
      const replyMessage = await reply(message)
      console.log(replyMessage)

      res.send(replyMessage)
    }
  }
}
