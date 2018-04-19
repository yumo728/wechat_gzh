const rp = require('request-promise');
const tools = require('../utils/tools');
const api = require('../utils/api')
const fs = require('fs')
/*
  创建Wechat构造函数，用来生成access_token，全局唯一凭据
    我们调用微信的接口，必须携带上access_token参数

  access_token:
    0. 保证全局唯一凭据，保存为本地文件
    2. 凭据每两个小时必须更新一次

    先去本地读取凭据
      如果有
        检查凭据有没有过期
          如果没过期
            我们就直接使用
          如果过期了
            需要重新请求微信服务器的access_token，并保存在本地
      如果没有
        需要重新请求微信服务器的access_token，并保存在本地
 */

function wechat(options){
    this.appID = options.appID;
    this.appsecret = options.appsecret;


    this.fetchAccessToken();
    this.fetchTicket();
}

//取得jsapi_ticket
wechat.prototype.fetchTicket = function () {
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
wechat.prototype.isValidTicket = function (data) {

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
wechat.prototype.getTicket = function () {
    return tools.readFileAsync('ticket.txt')
}

//保存jsapi_ticket的方法
wechat.prototype.saveTicket = function (data) {
    return tools.writeFileAsync('ticket.txt', data)
}

//获取jsapi_ticket的方法
wechat.prototype.updateTicket = function () {

    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then(res => {
                // console.log(res)
                // res = JSON.parse(res)
                const url = api.ticket + 'access_token=' + res.access_token + '&type=jsapi'

                rp({method: 'GET', url: url, json: true})
                    .then(res => {
                        // console.log(res)
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


//取得access_token的方法
wechat.prototype.fetchAccessToken = function () {
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
            // console.log(this)
            return this.saveAccessToken(res)
        })
}

//检查access_token的方法
wechat.prototype.isValidAccessToken= function (data) {
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
};

//读取access_token的方法
wechat.prototype.getAccessToken= function () {
    return tools.readFileAsync('accessToken.txt');
};

//保存access_token的方法
wechat.prototype.saveAccessToken= function (data) {
    return tools.writeFileAsync('accessToken.txt',data);
};

//获取access_token的方法
wechat.prototype.updateAccessToken= function () {
    // const url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='
    //     +this.appID+'&secret='+this.appsecret
    const url = api.accessToken + '&appid='
        + this.appID + '&secret=' + this.appsecret

    /*request
    request-promise*/

    //向下传递，必须return一个promise对象
    return new Promise((resolve, reject) => {
        rp({method:'GET',url:url,json:true})
            .then(res=>{
                /*const accessToken = res.access_token;
                const expiresIn = res.expires_in;
                console.log('accessToken:'+accessToken)*/
                //4.获取现在的时间
                const now = Date.now()
                //4.计算得出凭据的过期时间，考虑数据传输的延迟时间5分钟
                const expires_in = now + (res.expires_in - 5 * 60) * 1000
                //4.设置凭据的过期时间
                res.expires_in = expires_in;
                // console.log(res)    access_token
                resolve(res)
            },err=>{
                reject(err);
            })
    })
};

//上传素材
wechat.prototype.uploadMaterial = function (type, material, permanent) {
    /*
        type: 上传素材的类型
        material: 上传素材的路径/news素材
        permanent: 永久素材接口
     */
    /*
      * 临时素材
            * 一种接口
                * 上传4种素材类型
                  *    image  voice video thumb
            * 请求url必须写type
        * 永久素材
            * 三种接口
                * news 没有type
                    * 只有它需要通过请求体上传素材
                * 图片url 没有type
                * 其他素材类型 有type
   */
    let form = {}

    //初始化：临时上传的素材接口
    let uploadApi = api.temporary.upload

    if (permanent) {
        //如果传了permanent，说明永久上传其他素材接口
        uploadApi = api.permanent.addMaterial
    }

    if (type === 'img') {
        //说明永久上传图文url素材接口
        uploadApi = api.permanent.uploadImg
    }

    if (type === 'news') {
        //说明永久上传图文素材接口
        uploadApi = api.permanent.addNews
        form = material
    } else {
        form = {
            media: fs.createReadStream(material)
        }
    }
    // const form = {
    //     media: fs.createReadStream(material)
    // }

    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then(res => {
                /*const url = api.upload + 'access_token=' + res.access_token +'&type=' + type

                rp({method: 'POST', url: url, formData: form, json: true})
                    .then(res => {
                        resolve(res)
                    }, err => {
                        reject(err)
                    })
            })*/
                let url = uploadApi + 'access_token=' + res.access_token

                if (type !== 'news' && type !== 'img') {
                    url += '&type=' + type
                }

                let options = {method: 'POST', url: url, json: true}

                if (type === 'news') {
                    options.body = form
                } else {
                    options.formData = form
                }

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
wechat.prototype.getMaterial = function (type, material, permanent) {
    /*
      type: 上传素材的类型
        material: 上传素材的路径/news素材
        permanent: 永久素材接口
     */
    /*
      * 临时素材
		* get
		* 视频文件不支持https下载，调用该接口需http协议
		* access_token media_id
		* 返回值：
			* 视频素材 对象url
			* 非视频素材 数据以流的方式过来
	* 永久素材
		* post
			* access_token  请求体media_id
		* 返回值：
			* 图文素材 {}
			* 视频素材 {}
			* 其他类型素材 数据以流的方式过来
   */
    let getApi = api.temporary.get
    let method = 'GET'

    if (permanent) {
        method = 'POST'
        getApi = api.permanent.get
    }

    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then(res => {
                let url = getApi + 'access_token=' + res.access_token
                let options = {method: method, url: url, json: true}

                if (permanent) {
                    options.body = {
                        media_id: mediaId
                    }
                } else {
                    if (type === 'video') {
                        url.replace('https//', 'http://')
                    }
                    url += '&media_id=' + mediaId
                }

                if (type === 'video' || type === 'news') {
                    rp(options)
                        .then(res => {
                            resolve(res)
                        }, err => {
                            reject(err)
                        })
                } else {
                    resolve(url)
                }
            })
    })

}

//创建菜单
wechat.prototype.createMenu = function (data) {
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
wechat.prototype.deleteMenu = function () {
    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then(res => {
                const url = api.menu.delete + 'access_token=' + res.access_token;
                rp({method: 'GET', url: url, json: true})
                    .then(res => {
                        resolve(res)
                    }, err => {
                        reject(err)
                    })

            })
    })

}

module.exports = wechat;