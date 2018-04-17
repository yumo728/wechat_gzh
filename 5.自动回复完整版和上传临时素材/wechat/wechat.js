const rp = require('request-promise');
const tools = require('../utils/tools');
const api = require('../utils/api')
const fs = require('fs')
/*
  创建Wechat构造函数，用来生成access_token，全局唯一凭据
    我们调用微信的接口，必须携带上access_token参数

  access_token:
    1. 保证全局唯一凭据，保存为本地文件
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

    //调用promise的then（）
    /*this.getAccessToken()
        .then(res=>{
            this.saveAccessToken(res);
        },err=>{
            console.log('err'+err)
        })*/
    // console.log('111111')
    /*this.getAccessToken()
        .then(res => {
            // console.log('2222222')
            //本地有文件
            if (this.isValidAccessToken(res)) {
                //说明凭据没有过期
                // return new Promise((resolve, reject) => {
                //   resolve(res)
                // })
                // console.log('3333333')
                return Promise.resolve(res)
            } else {
                //说明凭据过期了
                // console.log('444444')
                return this.updateAccessToken()
                // .then(res => {
                //   return this.saveAccessToken(res)
                // })
            }
        }, err => {
            // console.log('666666666')
            //本地没有文件
            return this.updateAccessToken()
            // .then(res => {
            //   return this.saveAccessToken(res)
            // })
        })
        .then(res => {
            //将凭据和过期时间挂载到this上
            this.access_token = res.access_token
            this.expires_in = res.expires_in
            //将凭据和过期时间保存在本地
            return this.saveAccessToken(res)
        }, err => {
            console.log(err)
        })*/
    this.fetchAccessToken();
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
    return tools.readFileAsync();
};

//保存access_token的方法
wechat.prototype.saveAccessToken= function (data) {
    return tools.writeFileAsync(data);
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
wechat.prototype.uploadMaterial = function (type, path) {
    /*
      type: 上传素材的类型
      path: 上传素材的路径
     */
    const form = {
        media: fs.createReadStream(path)
    }

    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then(res => {
                const url = api.upload + 'access_token=' + res.access_token +'&type=' + type

                rp({method: 'POST', url: url, formData: form, json: true})
                    .then(res => {
                        resolve(res)
                    }, err => {
                        reject(err)
                    })
            })
    })

}


module.exports = wechat;