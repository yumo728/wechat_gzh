const sha1 = require('sha1');
const rp = require('request-promise');
const tools = require('../utils/tools');

function wechat(options){
    this.appID = options.appID;
    this.appsecret = options.appsecret;

    // this.updataAccessToken()
    //     .then(res=>{
    //         this.saveAccessToken(res);
    //     })

    this.getAccessToken()
        .then(res=>{
            if(this.isValidAccessToken(res)){
                return Promise.resolve(res)
            }else{
                return this.updataAccessToken()
                    // .then(res=>{
                    //     return this.saveAccessToken(res);
                    // })
            }
        },err=>{
            return this.updataAccessToken(err)
                // .then(res=>{
                //     return this.saveAccessToken(res);
                // })
        })

        .then(res=>{
            //将凭证挂载到this上
            this.access_token = res.access_token;
            this.expires_in = res.expires_in;
            //将凭证保存在本地
            return this.saveAccessToken(res);
        })

}
//检查access_token的有效性
wechat.prototype.isValidAccessToken = function(data){
    if(!data || !data.access_token || !data.expires_in){
        return false
    }

    //获取现在的时间
    const now = Date.now();
    //获取凭证
    const expires_in = data.expires_in;
    //检查凭证的有效性
    return now < expires_in;
}


//读取access_token的方法
wechat.prototype.getAccessToken = function(){
    return tools.readFileAsync()
}

//保存access_token的方法
wechat.prototype.saveAccessToken = function(data){
    return tools.writeFileAsync(data)
}

//获取access_token的方法
wechat.prototype.updataAccessToken = function(){  //注意this问题
    url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='
        +this.appID+'&secret='+this.appsecret

    /*request-promise*/
    return new Promise((resolve, reject) => {
        rp({method:'GET',url:url,json:true})
            .then(res=>{
                //获取现在的时间
                const now = Date.now();
                //获取过期时间，并且延长五分钟
                const expires_in = now + (res.expires_in - 5*60)*1000;
                //获取凭证
                res.expires_in = expires_in;
                resolve(res)
            },err=>{
                reject(err)
            })
    })
}



module.exports = function (config) {
    new wechat(config)
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
