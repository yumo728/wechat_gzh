const sha1 = require('sha1');
const rp = require('request-promise');
const tools = require('../utils/tools')

/*
  创建Wechat构造函数，用来生成access_token，全局唯一凭据
    我们调用微信的接口，必须携带上access_token参数

  access_token:
    0. 保证全局唯一凭据，保存为本地文件
    2. 凭据每两个小时必须更新一次

 */
function wechat(options){
    this.appID = options.appID;
    this.appsecret = options.appsecret;

    this.updataAccessToken()
        .then(res=>{
            this.saveAccessToken(res)
        },err=>{
            console.log('err:'+err)
        })

}

//保存access_token的方法
wechat.prototype.saveAccessToken = function(data){
    return tools.writeFileAsync(data)
}

//获取access_token的方法
wechat.prototype.updataAccessToken = function(){
    url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='
        +this.appID+'&secret='+this.appsecret;

    /*request-promise*/
    return new Promise((resolve, reject) => {
        rp({method:'GET',url : url,json:true})
            .then(res=>{
                resolve(res)
            },err=>{
                reject(err)
            })
    })

}


module.exports = function (config) {
    new wechat(config);
    return (req,res)=>{
        console.log(req.query)

        /*
            { signature: '09bd6e2934d44f9f0220bc3aa7ffdaab444f839f',
            echostr: '13117983872536543082',
            timestamp: '1524100928',
            nonce: '2790241080' }
        */

        const signature = req.query.signature;
        const echostr = req.query.echostr;
        const timestamp = req.query.timestamp;
        const nonce = req.query.nonce;
        const token = config.token;


        /*const arr = [timestamp,nonce,token].sort();
        console.log('arr:'+arr);

        const shastr = sha1(arr.join(''));
        console.log('shastr:'+shastr)*/

        const shastr = sha1([timestamp,nonce,token].sort().join(''));
        console.log(shastr)

        if(shastr === signature){
            res.send(echostr)
        }else{
            res.send('err')
        }

    }
}