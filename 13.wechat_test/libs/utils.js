/*
  工具函数类
 */
const fs = require('fs')
const path = require('path')
const xml2js = require('xml2js').parseString

module.exports = {
  writeFileAsync: (data, fileName) => {
    filePath = path.join(__dirname, fileName)
    //将JS对象转化为JSON对象
    data = JSON.stringify(data)
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, err => {
        if (!err) {
          resolve()
        } else {
          reject(err)
        }
      })
    })
  },
  readFileAsync: (fileName) => {
    filePath = path.join(__dirname, fileName)
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (!err) {
          //将buffer数据转化为string（实际上是json对象）
          data = data.toString()
          //将json对象转化为js对象
          data = JSON.parse(data)
          resolve(data)
        } else {
          reject(err)
        }
      })
    })
  },
  getXMLAsync: (req) => { //获取请求体中xml数据的方法
    return new Promise((resolve, reject) => {
      let xml = ''
      req.on('data', data => {
        //读取的数据是buffer格式的数据，需要转换
        xml += data.toString()
      })
      req.on('end', () => {
        resolve(xml)
      })
    })
  },
  parseXMLAsync: (xml) => { //解析xml数据为js对象
    return new Promise((resolve, reject) => {
      xml2js(xml, {trim: true}, (err, data) => {
        if (!err) {
          resolve(data)
        } else {
          reject(err)
        }
      })
    })
  },
  formatMessage: (jsData) => {
    let message = {}
    let data = null
    //返回一个由对象可枚举属性组成的数组
    const keys = Object.keys(jsData)
    // console.log(keys)
    /*
    [ 'ToUserName',
      'FromUserName',
      'CreateTime',
      'MsgType',
      'Content',
      'MsgId' ]
     */
    keys.forEach((item, index) => {
      //得到所有属性值
      data = jsData[item]
      //判断属性值是否是一个数组，并且里面有值。
      if (Array.isArray(data) && data.length === 1) {
        //满足条件的才是我们需要的属性和属性值
        message[item] = data[0]
      }
    })

    return message
  }
}