const Wechat = require('../wechat/wechat')
const sha1 = require('sha1')
const {douban} = require('../utils/api')
const config = require('../config/config')
const rp = require('request-promise')
var express = require('express')

var router = express.Router()

const getTicket = new Wechat(config)

router.get('/movie', async (req, res) => {

  let data = await rp({method: 'GET', url: douban.theaters, json: true})
  const theatersData = data.subjects

  data = await rp({method: 'GET', url: douban.coming, json: true})
  const comingData = data.subjects

  data = await rp({method: 'GET', url: douban.top250, json: true})
  const top250Data = data.subjects

  data = {
    theatersData,
    comingData,
    top250Data
  }
  console.log(data)
  console.log('///////')
  console.log(config.url)

  res.render('movie', {
    data,
    commentUrl: config.url
  })
})

router.get('/details',async (req, res) => {
  const id = req.query.id
  console.log('**************----------')
  const url = douban.subject + id
  console.log(url)
  const data = await rp({method: 'GET', url: url, json: true})
  console.log('************')
  console.log(data)
  console.log('***************')



  res.render('details', {
    data,
    commentUrl: config.url
  })
})


router.get('/search',async (req, res) => {
  // noncestr（随机字符串）
  // 有效的jsapi_ticket
  // timestamp（时间戳）
  // url
  const noncestr = Math.random().toString().substr(2, 15)  //不能截取.
  const timestamp = Date.now()
  const url = config.url + '/search' //完整的url地址
  const jsapi_ticket = (await getTicket.fetchTicket()).ticket

  //将4个参数按url方法组合在一起
  const param = [
    'noncestr=' + noncestr,
    'timestamp=' + timestamp,
    'jsapi_ticket=' + jsapi_ticket,
    'url=' + url
  ]

  //按ascii表(字典序)排序，排序后再拼接在一起
  const str = param.sort().join('&')

  //将拼接好的字符串加密，返回签名
  const signature = sha1(str)


  res.render('search', {
    timestamp,
    signature,
    noncestr,
    commentUrl: config.url
  })
})

module.exports = router