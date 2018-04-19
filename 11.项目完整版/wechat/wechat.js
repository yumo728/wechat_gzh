const rp = require('request-promise')
const tools = require('../utils/tools')
const api = require('../utils/api')
const fs = require('fs')

function Wechat (options) {

  this.appID = options.appID
  this.appsecret = options.appsecret

  this.fetchAccessToken()
  this.fetchTicket()

}

//取得jsapi_ticket
Wechat.prototype.fetchTicket = function () {
  //少去调用readFile方法
  if (this.ticket && this.ticket_expires_in) {
    if (this.isValidTicket(this)) {
      return Promise.resolve(this)
    }
  }

  return this.getTicket()
    .then(res => {
      //本地有文件
      if (this.isValidTicket(res)) {
        //说明凭据没有过期
        return Promise.resolve(res)
      } else {
        //说明凭据过期了
        return this.updateTicket()
      }
    }, err => {
      //本地没有文件
      return this.updateTicket()
    })
    .then(res => {
      //将凭据和过期时间挂载到this上
      this.ticket = res.ticket
      this.ticket_expires_in = res.ticket_expires_in
      //将凭据和过期时间保存在本地
      return this.saveTicket(res)
    })
}

//检查jsapi_ticket有效性
Wechat.prototype.isValidTicket = function (data) {

  if (!data || !data.ticket || !data.ticket_expires_in) {
    return false
  }
  //获取现在的时间
  const now = Date.now()
  //获取凭据上的过期时间
  const ticket_expires_in = data.ticket_expires_in

  return now < ticket_expires_in
}

//读取jsapi_ticket的方法
Wechat.prototype.getTicket = function () {
  return tools.readFileAsync('ticket.txt')
}

//保存jsapi_ticket的方法
Wechat.prototype.saveTicket = function (data) {
  return tools.writeFileAsync('ticket.txt', data)
}

//获取jsapi_ticket的方法
Wechat.prototype.updateTicket = function () {

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(res => {
        console.log(res)
        // res = JSON.parse(res)
        const url = api.ticket + 'access_token=' + res.access_token + '&type=jsapi'
      
        rp({method: 'GET', url: url, json: true})
          .then(res => {
            console.log(res)
            //为了避免和凭据的过期时间冲突，重新定义一个对象保存票据和过期时间
            const data = {
              ticket: res.ticket,
              ticket_expires_in: Date.now() + (res.expires_in - 5 * 60) * 1000
            }

            resolve(data)
          }, err => {
            reject(err)
          })
      })
  })
}

//取得access_token
Wechat.prototype.fetchAccessToken = function () {
  //少去调用readFile方法
  if (this.access_token && this.expires_in) {
    if (this.isValidAccessToken(this)) {
      return Promise.resolve(this)
    }
  }

  return this.getAccessToken()
    .then(res => {
      //本地有文件
      if (this.isValidAccessToken(res)) {
        //说明凭据没有过期
        return Promise.resolve(res)
      } else {
        //说明凭据过期了
        return this.updateAccessToken()
      }
    }, err => {
      //本地没有文件
      return this.updateAccessToken()
    })
    .then(res => {
      //将凭据和过期时间挂载到this上
      this.access_token = res.access_token
      this.expires_in = res.expires_in
      //将凭据和过期时间保存在本地
      return this.saveAccessToken(res)
    })
}

//检查access_token有效性
Wechat.prototype.isValidAccessToken = function (data) {
  /*
    返回值：
      true 有效的
      false 无效的
   */
  //检查数据是否有效
  if (!data || !data.access_token || !data.expires_in) {
    return false
  }
  //获取现在的时间
  const now = Date.now()
  //获取凭据上的过期时间
  const expires_in = data.expires_in

  /*if (now < expires_in) {
    return true
  } else {
    return false
  }*/

  return now < expires_in
}

//读取access_token的方法
Wechat.prototype.getAccessToken = function () {
  return tools.readFileAsync('accessToken.txt')
}

//保存access_token的方法
Wechat.prototype.saveAccessToken = function (data) {
  return tools.writeFileAsync('accessToken.txt', data)
}

//获取access_token的方法
Wechat.prototype.updateAccessToken = function () {

  const url = api.accessToken + '&appid='
    + this.appID + '&secret=' + this.appsecret

  /*
    request
    request-promise
   */
  //返回的必须是获取到数据的promise对象
  return new Promise((resolve, reject) => {
    rp({method: 'GET', url: url, json: true})
      .then(res => {
        //获取现在的时间
        const now = Date.now()
        //计算得出凭据的过期时间,考虑数据传输的延迟时间5分钟
        const expires_in = now + (res.expires_in - 5 * 60) * 1000
        //设置凭据的过期时间
        res.expires_in = expires_in
        resolve(res)
      }, err => {
        // console.log('**err**' + err)
        reject(err)
      })
  })
}

//创建菜单
Wechat.prototype.createMenu = function (data) {

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(res => {
        const url = api.menu.create + 'access_token=' + res.access_token

        rp({method: 'POST', url: url, body: data, json: true})
          .then(res => {
            resolve(res)
          }, err => {
            reject(err)
          })

      })
  })

}

//删除菜单
Wechat.prototype.deleteMenu = function () {

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(res => {
        const url = api.menu.delete + 'access_token=' + res.access_token

        rp({method: 'GET', url: url, json: true})
          .then(res => {
            resolve(res)
          }, err => {
            reject(err)
          })

      })
  })

}

module.exports = Wechat