const tpl = require('./tpl')
const Wechat = require('./wechat')
const config = require('../config/config')
const menu = require('./menu')

const materailApi = new Wechat(config)

materailApi.deleteMenu()
  .then(() => {
    materailApi.createMenu(menu)
      .then((res) => {
        console.log(res) //{ errcode: 0, errmsg: 'ok' }
      })
  })


module.exports = async (message) => {
  //将要回复用户的具体消息
  let content = ''
  let options = {}

  if (message.MsgType === 'text') {
    //说明用户发送text文本消息
    if (message.Content === '1') {
      content = '即将转取您银行卡的7000元 \n回复2 确认转取 \n回复3 不用确认'
    } else if (message.Content === '2') {
      content = '确认转取成功~~~'
    } else if (message.Content.match(3)) {
      content = '不用确认，转取成功~~~'
    } else if (message.Content === '4') {
      content = [{
        title: 'Nodejs开发',
        description: '这里有最新nodejs内容',
        picUrl: 'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1841004364,244945169&fm=58&bpow=121&bpoh=75',
        url: 'http://nodejs.cn/'
      }, {
        title: '微信公众号开发',
        description: '这里有最新微信公众号内容',
        picUrl: 'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1841004364,244945169&fm=58&bpow=121&bpoh=75',
        url: 'http://nodejs.cn/'
      }]
    } else if (message.Content === '5') {
      //上传临时图片素材
      const data = await materailApi.uploadMaterial('img', __dirname + '/1.png')
      console.log(data)  //得到上传临时图片素材media_id
      //为了回复用户一个图片消息
      options.mediaId = data.media_id
      options.msgType = 'image'
    } else if (message.Content === '6') {
      //上传临时图片素材
      const data = await materailApi.uploadMaterial('img', __dirname + '/1.png', true)
      console.log(data)  //得到上传临时图片素材media_id
      const newsList = {
        articles: [{
          title: '微信公众号开发',
          thumb_media_id: data.media_id,
          author: '佚名',
          digest: '微信公众号开发微信公众号开发微信公众号开发',
          show_cover_pic: 1,
          content: '一张网页，要经历怎样的过程，才能抵达用户面前？\n' +
          '一位新人，要经历怎样的成长，才能站在技术之巅？\n' +
          '探寻这里的秘密；\n' +
          '体验这里的挑战；\n' +
          '成为这里的主人；\n' +
          '加入百度，加入网页搜索，你，可以影响世界。\n' +
          '\n',
         content_source_url: 'https://www.baidu.com/s?tn=99006304_7_oem_dg&isource=infinity&wd=%E7%99%BE%E5%BA%A6'
        },{
          title: 'nodejs开发',
          thumb_media_id: data.media_id,
          author: '佚名',
          digest: '微信公众号开发微信公众号开发微信公众号开发',
          show_cover_pic: 0,
          content: '一张网页，要经历怎样的过程，才能抵达用户面前？\n' +
          '一位新人，要经历怎样的成长，才能站在技术之巅？\n' +
          '探寻这里的秘密；\n' +
          '体验这里的挑战；\n' +
          '成为这里的主人；\n' +
          '加入百度，加入网页搜索，你，可以影响世界。\n' +
          '\n',
          content_source_url: 'https://www.baidu.com/s?tn=99006304_7_oem_dg&isource=infinity&wd=%E7%99%BE%E5%BA%A6'
        }]
      }

      const newsData = await materailApi.uploadMaterial('news', newsList, true)
      console.log(newsData)
      //为了回复用户一个图片消息
      options.mediaId = data.media_id
      options.msgType = 'image'
    } else if (message.Content === '7') {
      content = '<a href="http://23dc64df.ngrok.io/search">语音识别</a>'
    }
  } else if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      //订阅事件
      content = '欢迎您的关注'
      if (message.EventKey) {
        //推广用的
        content = '扫描带参数二维码关注的'
      }
    } else if (message.Event === 'unsubscribe') {
      //取消订阅事件
      console.log('无情取关~~')
    } else if (message.Event === 'SCAN') {
      content = '用户已关注时的事件推送'
    } else if (message.Event === 'LOCATION') {
      content = '纬度:' + message.Latitude + '\n经度:' + message.Longitude + '\n精度：' + message.Precision
    } else if (message.Event === 'CLICK') {
      content = message.EventKey
    }
  } else if (message.MsgType === 'location') {
    content = message.Location_X + '--' + message.Location_Y + '--' + message.Scale + '--' + message.Label
  }


  options.toUserName = message.FromUserName
  options.fromUserName = message.ToUserName
  options.createTime = Date.now()
  options.msgType = options.msgType || message.MsgType
  options.content = content

  if (options.msgType === 'event' || options.msgType === 'location') {
    options.msgType = 'text'
  }

  if (Array.isArray(options.content)) {
    options.msgType = 'news'
  }




    if(content === ''){
        return ''
    }else{
        return tpl(options)
    }

}