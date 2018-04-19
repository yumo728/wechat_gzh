var express = require('express')
const Wechat = require('../wechat/wechat')
const sha1 = require('sha1')
const config = require('../config/config')
const rp = require('request-promise')

const url = config.url

var router = express.Router()

const wechatAPI = new Wechat(config)

async function getTicket(req) {
  const data = await wechatAPI.fetchAccessToken()

  const ticketData = await wechatAPI.fetchTicket(data.access_token)

  //  0. 获取参与签名的所有参数（ticket, noncestr, timestamp, url），组合在一起
  const ticket = ticketData.ticket
  const noncestr = Math.random().toString(16).substr(2, 15) //防止出现. 所以从第二位开始截取，一共截取15位
  const timestamp = parseInt(Date.now()/1000 , 10) + ''
  const url = 'http://' + req.hostname + req.originalUrl

  // 2. 以URL键值对的形式组合在一起，按ascii排序并连接在一起
  const params = [
    'jsapi_ticket=' + ticket,
    'noncestr=' + noncestr,
    'timestamp=' + timestamp,
    'url=' + url
  ]


  const str = params.sort().join('&')

  // 3. 进行sha1加密
  const signature = sha1(str)

  return {signature, timestamp, noncestr}
}

router.get('/movie', async function (req, res) {


  let data = await rp({method: 'GET', url: 'https://api.douban.com/v2/movie/in_theaters?count=10', json: true})
  let theatersData = data

  data = await rp({method: 'GET', url: 'https://api.douban.com/v2/movie/coming_soon?count=10', json: true})
  let comingData = data

  data = await rp({method: 'GET', url: 'https://api.douban.com/v2/movie/top250?count=10', json: true})
  let topData = data

  res.render('movie', {
    theatersData,
    comingData,
    topData,
    url
  })

})

router.get('/details', async function (req, res) {
  const id = req.query.id
  let data = await rp({method: 'GET', url: 'https://api.douban.com/v2/movie/subject/' + id, json: true})

  res.render('details', {
    data,
    url
  })

})

router.get('/search', async function (req, res) {
  const obj = await getTicket(req)

  res.render('search', {
    obj
  })

})

module.exports = router