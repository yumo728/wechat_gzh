const express = require('express')
const config = require('./config/config')
const confirm = require('./wechat/confirm')

const router = require('./router/index')

const app = express()
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
app.use(express.static('public'))

app.use(router)

app.use(confirm(config))

app.listen(3000, () => {
  console.log('服务器启动成功了')
})