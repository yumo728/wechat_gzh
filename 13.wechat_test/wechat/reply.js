/*
  此模块用来处理用户发送消息的类型，并返回xml格式的信息
 */
const tpl = require('./tpl')
const Wechat = require('./wechat')
const config = require('../config/config')
const menu = require('./menu')
const rp = require('request-promise')

const url = config.url

const materialAPI = new Wechat(config)

materialAPI.deleteMenu()
  .then(() => {
    materialAPI.createMenu(menu)
      .then(res => {
        console.log(res)
      })
  }, err => {
    console.log(err)
  })

module.exports = async (message) => {

  //回复给用户具体的内容
  let content = ''
  //处理用户触发事件的消息
  if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      //用户关注公众号事件
      content = '欢迎关注硅谷电影，谷影等你好久了~ \n' +
        '回复 0~3 一段好看的文字 \n' +
        '回复 4 一个有趣的电影 \n' +
        '点击 <a href="' + url + '/search">语音查电影</a> 开始电影之旅吧~\n' +
        '点击底部菜单，有你想要的'
    } else if (message.Event === 'unsubscribe') {
      //用户取消关注公众号事件
      console.log('无情取关+0')
    }
  } else if (message.MsgType === 'text') {
    if (message.Content === '1') {
      content = '漂泊在外多年以后，珍妮特踏上了回去的路。'
    } else if (message.Content.match('2')) {
      content = '“十个街区，二十盏路灯”，当她一个个一盏盏地经过之时，关于过去的一幕幕是否会陆续涌现——那些关于家与爱的追寻和背叛。'
    } else if (message.Content === '3') {
      content = '内含灵魂的身躯才是唯一真正的神'
    } else if (message.Content === '4') {

      const data = await rp({method: 'GET', url: 'https://api.douban.com/v2/movie/in_theaters', json: true})
      const num = Math.floor(Math.random() * data.count)
      const movie = data.subjects[num]

      let description = ''

      movie.genres.forEach(item => {
        description += (item + ' ')
      })

      content = [{
        title: movie.title,
        picUrl: movie.images.medium,
        url: movie.alt,
        description: description
      }]

    } else {
      content = '你可以进行魔法演练~ \n' +
        '回复 0~3 一段好看的文字 \n' +
        '回复 4 一个有趣的电影 \n' +
        '点击 <a href="' + url + '/movie"></a> 开始电影之旅吧~\n' +
        '点击底部菜单，有你想要的'
    }
  } else {
    content = '你可以进行魔法演练~ \n' +
      '回复 0~3 一段好看的文字 \n' +
      '回复 4 一个有趣的电影 \n' +
      '点击 <a href="' + url + '/movie"></a> 开始电影之旅吧~\n' +
      '点击底部菜单，有你想要的'
  }

  let options = {}
  options.toUserName = message.FromUserName
  options.fromUserName = message.ToUserName
  options.createTime = Date.now()
  options.msgType = content.type || 'text'
  options.content = content

  if (Array.isArray(options.content)) {
    options.msgType = 'news'
  }

  return tpl(options)
}