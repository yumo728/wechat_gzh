const express = require('express')
const app = express()
const config = require('./config/config')
const confirm = require('./wechat/confirm')

app.use(confirm(config))

app.listen(3000, () => {
  console.log('服务器启动成功了')
})