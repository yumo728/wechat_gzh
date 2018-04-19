const sha1 = require('sha1');
const wechat = require('./wechat');
const tools = require('../utils/tools');
const reply = require('./reply')
/*
  创建Wechat构造函数，用来生成access_token，全局唯一凭据
    我们调用微信的接口，必须携带上access_token参数

  access_token:
    0. 保证全局唯一凭据，保存为本地文件
    2. 凭据每两个小时必须更新一次

 */

//验证服务器的有效性
module.exports = function (config) {
    new wechat(config);
    return async (req,res)=>{
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


        //验证服务器地址的有效性
        if(req.method === 'GET'){
            if(shastr === signature){
                res.send(echostr)
            }else{
                res.send('err')
            }
        }else if(req.method = 'POST'){
            //获取用户的流式消息，是xml数据
            //将xml数据转化js对象
            //将js对象中的数组干掉，返回的就是我们想要的js对象

            if(shastr !== signature){
                res.send('err')
            }
            return;
        }

        //获取用户的xml数据
        const xmlData = await tools.getXMLAsync(req);
        console.log(xmlData);

        //将xml数据转成js对象
        const jsData = await tools.parseXMLAsync(xmlData)
        console.log(jsData)

        //将js对象中的数组干掉
        const massage = await tools.formatMessage(jsData)
        console.log(massage)

        /*
            tpl : 用来处理最终返回用户的6种xml数据
            reply : 判断消息的类型
        */

        const replyMessage = await reply(message)
        res.send(replyMessage)
    }
}