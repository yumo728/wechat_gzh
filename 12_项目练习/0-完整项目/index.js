const express = require('express');
const config = require('./config/config');
const confirm = require('./wechat/confirm');
const app = express();



app.use(confirm(config));

app.listen(3000, ()=> {
    console.log('服务器启动成功了')
});
