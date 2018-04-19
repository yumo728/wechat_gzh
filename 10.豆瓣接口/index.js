const express = require('express');
const config= require('./config/config');
const confirm = require('./wechat/confirm');
const Wechat = require('./wechat/wechat')
const sha1 = require('sha1')
const ejs = require('ejs')
const app = express();

const getTicket = new Wechat(config)

/*
  JS-SDK
  0. 设置JS接口安全域名 （将协议干掉）
  2. 获取jsapi_ticket，临时票据。获取票据和凭据类似，它和凭据有类似的特点
    - 请求接口次数极少，建议开发者缓存起来
    - 7200秒刷新一次
  3. 签名算法
  4. 将signature,noncestr,timestamp渲染到页面上
 */

app.set('view engine', 'ejs')
app.set('views', './views')



app.get('/movie',async (req, res) => {
    // noncestr（随机字符串）
    // 有效的jsapi_ticket
    // timestamp（时间戳）
    // url
    const noncestr = Math.random().toString().substr(2, 15)  //不能截取.
    const timestamp = parseInt(Date.now() / 1000) + ''
    const url = 'http://beb88bbd.ngrok.io/movie'
    const jsapi_ticket = (await getTicket.fetchTicket()).ticket


    //将4个参数按url方法组合在一起
    const param = [
        'noncestr=' + noncestr,
        'timestamp=' + timestamp,
        'jsapi_ticket=' + jsapi_ticket,
        'url=' + url
    ]
    console.log(param)

    //按ascii表排序，排序后再拼接在一起
    const str = param.sort().join('&')

    //将拼接好的字符串加密，返回签名
    const signature = sha1(str)
    console.log(signature)

    res.render('movie', {
        signature,
        noncestr,
        timestamp
    })

})

app.use(confirm(config));
app.listen(3000, ()=> {
    console.log('服务器启动成功了')
});