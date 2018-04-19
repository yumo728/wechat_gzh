/*
  用来获取/更新/储存access_token
 */
const rp = require('request-promise')
const utils = require('../libs/utils')
const api = require('../libs/api')
const fs = require('fs')

function Wechat (config) {

  this.appID = config.appID
  this.appsecret = config.appsecret

  this.fetchAccessToken()

}

//取得access_token
Wechat.prototype.fetchAccessToken = function () {
  //优化，少调用readFile方法
  if (this.access_token && this.expires_in) {
    if (this.isValidAccessToken(this)) {
      return Promise.resolve(this)
    }
  }

  return this.getAccessToken()
    .then(res => {
      //如果本地有凭据
      console.log(res)
      if (this.isValidAccessToken(res)) {
        return Promise.resolve(res)
      } else {
        return this.updateAccessToken()
      }
    }, err => {
      //如果本地没有凭据
      return this.updateAccessToken()
    })
    .then(res => {
      //将凭据和过期时间存在this上
      this.access_token = res.access_token
      this.expires_in = res.expires_in
      //储存凭据
      this.saveAccessToken(res)

      return Promise.resolve(res)
    })

}

//判断access_token是否有效的方法
Wechat.prototype.isValidAccessToken = function (data) {
  /*
    返回true 代表没过期
    返回false 代表过期或者数据有问题
   */
  //防止data不符合规范导致程序出错
  if (!data || !data.access_token || !data.expires_in) {
    return false
  }
  //获取现在的时间
  const now = Date.now()
  //获取凭据的过期时间
  const expires_in = data.expires_in
    console.log(expires_in);

  // if (now < expires_in) {
  //   return true
  // } else {
  //   return false
  // }

  return now < expires_in

}

//获取access_token的方法
Wechat.prototype.getAccessToken = function () {
  return utils.readFileAsync('accessToken.txt')
}

//存储access_token的方法
Wechat.prototype.saveAccessToken = function (data) {
  return utils.writeFileAsync(data, 'accessToken.txt')
}

//更新的方法
Wechat.prototype.updateAccessToken = function () {

  const url =  api.accessToken + '&appid=' + this.appID + '&secret=' + this.appsecret

  return new Promise((resolve, reject) => {
    rp({method: 'GET', url: url, json: true})
      .then(res => {
        // console.log(res)
        /*
        { access_token: '8_CWUuh6l4zERBMZCx0Dt6xueJ_QAHsKnz6b8k5gnRd9-kwGr2AKbBFtYAYVgeKaW4oWkIBbqS7VZPhJm2lx6deg4HCB3CtJf9dN81lmmJ5fqZmjLhOEyRQNnFqDOx6WIJW9JukHI4oQLw02zVQXWeABAXED',
    expires_in: 7200 }
         */
        //获取当前的时间
        const now = Date.now()
        //计算出来过期时间，考虑服务器延迟1分钟
        const expires_in = now + (res.expires_in - 60) * 1000
        //将过期时间放在对象上
        res.expires_in = expires_in
        //将res通过resolve方法暴露出去
        resolve(res)
      })
  })

}

//取得jsapi_ticket
Wechat.prototype.fetchTicket = function (access_token) {
  //优化，少调用readFile方法
  if (this.ticket && this.expires_in) {

    if (this.isValidTicket(this)) {
      return Promise.resolve(this)
    }
  }

  return this.getTicket()
    .then(res => {
      //如果本地有凭据
      console.log(res)
      if (this.isValidTicket(res)) {
        return Promise.resolve(res)
      } else {
        return this.updateTicket(access_token)
      }
    }, err => {
      //如果本地没有凭据
      return this.updateTicket(access_token)
    })
    .then(res => {
      //将凭据和过期时间存在this上
      this.ticket = res.ticket
      this.expires_in = res.expires_in
      //储存凭据
      this.saveTicket(res)

      return Promise.resolve(res)
    })

}

//判断jsapi_ticket是否有效的方法
Wechat.prototype.isValidTicket = function (data) {
  /*
    返回true 代表没过期
    返回false 代表过期或者数据有问题
   */
  //防止data不符合规范导致程序出错
  if (!data || !data.ticket || !data.expires_in) {
    return false
  }
  //获取现在的时间
  const now = Date.now()
  //获取凭据的过期时间
  const expires_in = data.expires_in

  return now < expires_in

}

//获取jsapi_ticket的方法
Wechat.prototype.getTicket = function () {
  return utils.readFileAsync('ticket.txt')
}

//存储jsapi_ticket的方法
Wechat.prototype.saveTicket = function (data) {
  return utils.writeFileAsync(data, 'ticket.txt')
}

//更新jsapi_ticket的方法
Wechat.prototype.updateTicket = function (access_token) {

  const url =  api.getTicket + 'access_token=' + access_token + '&type=jsapi'

  return new Promise((resolve, reject) => {
    rp({method: 'GET', url: url, json: true})
      .then(res => {
        //获取当前的时间
        const now = Date.now()
        //计算出来过期时间，考虑服务器延迟1分钟
        const expires_in = now + (res.expires_in - 60) * 1000
        //将过期时间放在对象上
        res.expires_in = expires_in
        //将res通过resolve方法暴露出去
        resolve(res)
      })
  })

}

//上传素材
Wechat.prototype.uploadMaterial = function (type, material, permanent) {
  /*
  material： 当上传的是图文素材时，它是一个包含信息数组
            当上传的是非图文素材时，它是一个路径
   */
  //初始化要传的数据
  let form = {}
  //初始化默认为临时素材接口
  let uploadAPI = api.temporary.upload

  if (permanent) {
    //如果传了第三个参数，则为永久素材接口
    uploadAPI = api.permanent.upload
  }

  if (type === 'pic') {
    //类型为pic，则为上传图文素材中图片
    uploadAPI = api.permanent.uploadNewsPic
  } else if (type === 'news') {
    //类型为news，则为上传图文素材
    uploadAPI = api.permanent.uploadNews
    form = material
  } else {
    //创建一个可读流
    form.media = fs.createReadStream(material)
  }

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(res => {
        //请求地址
        let url = uploadAPI + 'access_token=' + res.access_token
        //请求的配置对象
        let options = {method: 'POST', url: url, json: true}

        //判断请求是否是永久的
        if (type === 'news') {
          options.body = form
        } else {
          url += ('&type=' + type)
          options.formData = form
        }

        console.log(url)
        console.log(options)

        //发送post/form请求
        rp(options)
          .then(res => {
            resolve(res)
          }, err => {
            reject(err)
          })
      })
  })
}

//获取素材
Wechat.prototype.getMaterial = function (type, mediaId, permanent) {
  //初始化默认为临时素材接口
  let getAPI = api.temporary.get
  let method = 'GET'

  if (permanent) {
    //如果传了第三个参数，则为永久素材接口
    getAPI = api.permanent.get
    method = 'POST'
  } else if (type === 'video') {
    getAPI.replace('https', 'http')
  }

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(res => {
        //请求地址
        const url = getAPI + 'access_token=' + res.access_token + '&media_id=' + mediaId
        let options = {method: method, url: url, json: true}

        if (method === 'POST') {
          options.body = {
            access_token: res.access_token,
            media_id: mediaId
          }
        }

        if (type === 'video' || (permanent && type === 'news')) {
          rp(options)
            .then(res => {
              resolve(res)
            }, err => {
              reject('failed getMaterial')
            })
        } else {
          resolve(url)
        }
      })
  })
}

//更新永久图文素材
Wechat.prototype.updateMaterial = function (form) {

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(res => {
        //请求地址
        let url = api.permanent.update + 'access_token=' + res.access_token
        //发送post/form请求
        rp({method: 'POST', url: url, body: form, json: true})
          .then(res => {
            resolve(res)
          }, err => {
            reject(err)
          })
      })
  })
}

//获取永久素材数量
Wechat.prototype.getMaterialCount = function () {

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(res => {
        //请求地址
        let url = api.permanent.getCount + 'access_token=' + res.access_token
        rp({method: 'GET', url: url, json: true})
          .then(res => {
            resolve(res)
          }, err => {
            reject(err)
          })
      })
  })
}

//获取永久素材列表
Wechat.prototype.batchMaterial = function (list) {

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(res => {
        //请求地址
        let url = api.permanent.batch + 'access_token=' + res.access_token
        rp({method: 'POST', url: url, body: list, json: true})
          .then(res => {
            resolve(res)
          }, err => {
            reject(err)
          })
      })
  })
}

//创建公众号标签
Wechat.prototype.createTag = function (tagName) {

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(res => {
        const form = {
          tag: {
            name: tagName
          }
        }
        //请求地址
        let url = api.tags.create + 'access_token=' + res.access_token
        rp({method: 'POST', url: url, body: form, json: true})
          .then(res => {
            resolve(res)
          }, err => {
            reject(err)
          })
      })
  })
}

//获取公众号标签
Wechat.prototype.getTags = function () {

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(res => {
        //请求地址
        let url = api.tags.get + 'access_token=' + res.access_token
        rp({method: 'GET', url: url, json: true})
          .then(res => {
            resolve(res)
          }, err => {
            reject(err)
          })
      })
  })
}

//更新公众号标签
Wechat.prototype.updateTag = function (id, tagName) {

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(res => {
        const form = {
          tag: {
            id: id,
            name: tagName
          }
        }
        //请求地址
        let url = api.tags.update + 'access_token=' + res.access_token
        rp({method: 'POST', url: url, body: form, json: true})
          .then(res => {
            resolve(res)
          }, err => {
            reject(err)
          })
      })
  })
}

//删除公众号标签
Wechat.prototype.deleteTag = function (id) {

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(res => {
        const form = {
          tag: {
            id: id
          }
        }
        //请求地址
        let url = api.tags.delete + 'access_token=' + res.access_token
        rp({method: 'POST', url: url, body: form, json: true})
          .then(res => {
            resolve(res)
          }, err => {
            reject(err)
          })
      })
  })
}

//批量为用户打/取消标签
Wechat.prototype.isBatchUsersTag = function (openid_list, tagid, isBatching) {

  let preUrl = api.usersTag.batch
  isBatching = isBatching || true

  if (isBatching) {
    preUrl = api.usersTag.unBatch
  }

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(res => {
        const form = {
          openid_list: openid_list,
          tagid: tagid
        }
        //请求地址
        let url = preUrl + 'access_token=' + res.access_token
        rp({method: 'POST', url: url, body: form, json: true})
          .then(res => {
            resolve(res)
          }, err => {
            reject(err)
          })
      })
  })
}

//获取用户的所有标签
Wechat.prototype.getUserTags = function (openid) {

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(res => {
        const form = {
          openid: openid
        }
        //请求地址
        let url = api.usersTag.get + 'access_token=' + res.access_token
        rp({method: 'POST', url: url, body: form, json: true})
          .then(res => {
            resolve(res)
          }, err => {
            reject(err)
          })
      })
  })
}

//按用户标签群发消息
Wechat.prototype.sendMessageToTag = function (tagId, mediaId, msgType) {

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(res => {

        const form = {
          filter: {
            is_to_all: false,
            tag_id: tagId
          },
          msgtype: msgType
        }

        if (msgType === 'voice' || msgType === 'image' || msgType === 'mpvideo' || msgType === 'mpnews') {
          form[msgType] = {
            media_id: mediaId
          }
        } else if (msgType === 'wxcard') {
          form[msgType] = {
            card_id: mediaId
          }
        } else if (msgType === 'text') {
          form[msgType] = {
            content: mediaId
          }
        }

        if (msgType === 'mpnews') {
          form.send_ignore_reprint = 0
        }
        console.log(form)
        //请求地址
        let url = api.mass.tag + 'access_token=' + res.access_token

        rp({method: 'POST', url: url, body: form, json: true})
          .then(res => {
            resolve(res)
          }, err => {
            reject(err)
          })
      })
  })
}

//创建菜单
Wechat.prototype.createMenu = function (data) {

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(res => {

        //请求地址
        let url = api.menu.create + 'access_token=' + res.access_token

        rp({method: 'POST', url: url, body: data, json: true})
          .then(res => {
            resolve(res)
          }, err => {
            reject(err)
          })
      })
  })
}

//查询菜单
Wechat.prototype.getMenu = function () {

  return new Promise((resolve, reject) => {
    this.fetchAccessToken()
      .then(res => {

        //请求地址
        let url = api.menu.get + 'access_token=' + res.access_token

        rp({method: 'GET', url: url, json: true})
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

        //请求地址
        let url = api.menu.delete + 'access_token=' + res.access_token
        console.log(url)
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
