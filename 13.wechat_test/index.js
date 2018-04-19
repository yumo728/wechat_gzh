/*
  入口文件，通过此文件启动项目
 */
const express = require('express')
const handleRequest = require('./wechat/handleRequest')
const config = require('./config/config')

const router = require('./routers/index')

const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.set('views', './views')

app.use(router)
app.use(handleRequest(config))

app.listen(3000, () => {
  console.log('服务器启动成功了')
})