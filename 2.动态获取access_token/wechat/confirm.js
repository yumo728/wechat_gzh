//处理验证服务器有效性的逻辑
const sha1 = require('sha1');
const rp = require('request-promise');
const tools = require('../utils/tools');
/*
    创建wechat构造函数，用来生成access_token，全局唯一凭据
    我们调用微信的接口，必须携带上access_token的参数

    access_token：
        1.保证全局唯一凭据，保存为本地文件
        2.凭据每两小时必须更新一次

    先去本地读取凭据
        如果有：检查凭据有没有过期
            没过期：直接使用
            过期：需要重新请求微信服务端的access_token，并保存在本地
        如果没有：需要重新请求微信服务端的access_token，并保存在本地
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

    this.getAccessToken()
    .then(res =>{
        //本地有文件
        if(this.isValidAccessToken(res)){
            //凭证没有过期
            // return new Promise((resolve, reject) => {
            //     resolve(res)
            return promise.resolve(res)
            }else{
                //凭证过期
                return this.updateAccessToken()
                // .then(res=>{
                //     return this.saveAccessToken(res)
                // })
            }
    },err=>{
        //本地没有文件
        return this.updateAccessToken()
        // .then(res=>{
        //     return this.saveAccessToken(res)
        // })
    })
    .then(res=>{
        //将凭据和过期时间挂载到this上
        this.access_token = res.access_token;
        this.expires_in = res.expires_in;
        //将凭据和过期时间保存在本地
        return this.saveAccessToken(res)
    })

}

//检查access_token的有效性
wechat.prototype.isValidAccessToken= function (data) {
    /*
        返回值
            true 有效的
            false 无效的
    */
    //检查数据是否有效/ 当没有data或data没凭据或凭据时间过期
    if(!data || !data.access_token || !data.expires_in){
        return false
    }

    //获取现在的时间
    const nowtime = Data.now();
    //获取凭据上的过期时间
    const expires_in = data.expires_in;

    // if (nowtime < expires_in) {
    //     return true
    // }else{
    //     return false
    // }
    return nowtime < expires_in
}

//读取access_token的方法
wechat.prototype.getAccessToken= function () {
    return tools.readFileAsync();
};

//保存access_token的方法
wechat.prototype.saveAccessToken= function (data) {
    return tools.writeFileAsync(data);
};

//获取access_token值
wechat.prototype.updateAccessToken= function () {
    const url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='
        +this.appID+'&secret='+this.appsecret

    /*request
    request-promise*/

    //向下传递，必须return一个promise对象
    return new Promise((resolve, reject) => {
        rp({method:'GET',url:url,json:true})
        .then(res=>{
            /*const accessToken = res.access_token;
            const expiresIn = res.expires_in;
            console.log('accessToken:'+accessToken)*/
            //获取现在的时间
            const now = Date.now();
            //计算得出凭据的过期时间,考虑数据传输的延迟时间5分钟
            const expires_in = now + (res.expires_in - 5*60) * 1000;
            //设置凭据的过期时间
            res.expires_in = expires_in;

            resolve(res)
        },err=>{
            reject(err);
        })
    })
};


module.exports = function (config) {
    new wechat(config);
     return (req,res)=> {
        console.log(req.query)
        /*
            { signature: 'f654eb0306fdbd3a6e47e1900fa8b47bc6597899', //微信加密签名，经过三个参数timestamp、nonce、token的某种算法推出来的
              echostr: '8252187338092314558', //微信随机字符串
              timestamp: '1523771324',  //微信发送请求时间
              nonce: '3101799830' }  //微信随机数字
        */
         /*
           验证服务器的有效性：
             1. 将三个参数timestamp、nonce、token组合起来，进行字典序排序
             2. 将排序完的字符串拼接在一起
             3. 将拼接好字符串进行sha1加密
             4. 将加密的字符串与微信传过来的签名对比，如果正确说明验证成功，返回echostr给微信服务器
          */
        const signature = req.query.signature;
        const echostr = req.query.echostr;
        const timestamp = req.query.timestamp;
        const nonce = req.query.nonce;
        const token = config.token;

        /*const arr = [timestamp,nonce,token];
        console.log('arr:'+arr); //arr:1523771324,3101799830,myumoWANG1634
        const arrsort = arr.sort();
        console.log('arrsort:'+arrsort); //arrsort:1523771324,3101799830,myumoWANG1634
        const str = arrsort.join('');
        console.log('str:'+str); //str:15237713243101799830myumoWANG1634
        const sha1str = sha1(str);
        console.log('sha1str:'+sha1str); //sha1str:f654eb0306fdbd3a6e47e1900fa8b47bc6597899*/

         const sha1str = sha1([timestamp,nonce,token].sort().join(''));

        if(sha1str === signature){
            res.send(echostr)
        }else{
            res.send('error')
        }
    }
}