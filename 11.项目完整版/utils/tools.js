const fs = require('fs')
const path = require('path')
const xml2js = require('xml2js').parseString

module.exports = {
  writeFileAsync: (filePath, data) => {
    filePath = path.join(__dirname, filePath)
    const dataJson = JSON.stringify(data)
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, dataJson, err => {
        if (!err) {
          resolve(data)
        } else {
          reject(err)
        }
      })
    })
  },
  readFileAsync: (filePath) => {
    filePath = path.join(__dirname, filePath)
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (!err) {
          data = data.toString()
          resolve(data)
        } else {
          reject(err)
        }
      })
    })
  },
  getXMLAsync: (req) => {
    return new Promise((resolve, reject) => {
      let xmlData = ''
      req.on('data', data => {
        data = data.toString()
        xmlData += data
      }).on('end', () => {
        resolve(xmlData)
      })
    })
  },
  parseXMLAsync: (xmlData) => {
    return new Promise((resolve, reject) => {
      xml2js(xmlData, {trim: true}, (err, data) => {
        if (!err) {
          resolve(data)
        } else {
          reject(err)
        }
      })
    })
  },
  formatMessage: (jsData) => {
    //定义message对象
    let message = {}

    if (typeof jsData === 'object') {
      let key, value
      //返回一个拿到所有的属性名的数组
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
      for (let i = 0, length = keys.length; i < length; i++) {
        //拿到对应的属性名
        key = keys[i]
        //拿到对应属性
        value = jsData[key]
        //过滤掉 空值  或者 空数组
        if (value instanceof Array && value.length > 0) {
          message[key] = value[0]
        }
      }
    }

    return message
  }
}