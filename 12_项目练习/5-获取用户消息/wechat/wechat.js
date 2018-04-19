
const rp = require('request-promise');
const tools = require('../utils/tools')

function wechat(options){
    this.appID = options.appID;
    this.appsecret = options.appsecret;

    /*this.updataAccessToken()
        .then(res=>{
            this.saveAccessToken(res)
        })*/
    return this.fetchAccessToken();

}

wechat.prototype.fetchAccessToken = function(){
    //少去调用readFile方法
    if(this.access_token && this.expires_in){
        if(this.isValidAccessToken(this)){
            return Promise.resolve(this)
        }
    }

    //读取本地凭据
    return this.getAccessToken()
    //如果有凭据
        .then(res=>{
            //判断有没有过期
            if(this.isValidAccessToken(res)){
                //没过期，直接使用
                return Promise.resolve(res)
            }else{
                //过期了，重新请求
                return this.updataAccessToken()
                // .then(res=>{
                //     return this.saveAccessToken(res);
                // })
            }
            //如果没有凭据
        },err=>{
            return this.updataAccessToken()
            // .then(res=>{
            //     return this.saveAccessToken(res);
            // })
        })
        .then(res=>{
            //将凭据和过期时间过载到this上
            this.access_token = res.access_token;
            this.expires_in = res.expires_in;
            //将凭据和过期时间保存在本地
            return this.saveAccessToken(res);
        })
}


//检查access_token的有效性
wechat.prototype.isValidAccessToken = function(data) {
    if(!data || !data.access_token || !data.expires_in){
        return false;
    }
    //获取现在的时间
    const now = Date.now();
    //获取凭据上的延长时间
    const expires_in = data.expires_in;
    //凭证没有过期
    return now < expires_in;
};

//读取access_token的方法
wechat.prototype.getAccessToken = function(){
    return tools.readFileAsync()
};

//保存access_token的方法
wechat.prototype.saveAccessToken = function(data){
    return tools.writeFileAsync(data)
};

//获取access_token的方法
wechat.prototype.updataAccessToken = function(){
    url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='
        +this.appID+'&secret='+this.appsecret;

    /*request-promise*/
    return new Promise((resolve, reject) => {
        rp({method:'GET',url : url,json:true})
            .then(res=>{
                //获取当前时间
                const now = Date.now();
                //计算得出凭据的过期时间，延长过期时间5分钟
                const expires_in = now + (res.expires_in - 5*60)*1000;
                //设置凭据的过期时间
                res.expires_in = expires_in;
                resolve(res)
            },err=>{
                reject(err)
            })
    })

}

module.exports = wechat;