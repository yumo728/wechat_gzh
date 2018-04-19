//处理验证服务器有效性的逻辑
const sha1 = require('sha1');
// const Wechat = require('./wechat');
const tools = require('../utils/tools')
const reply = require('./reply')
/*
    创建wechat构造函数，用来生成access_token，全局唯一凭据
    我们调用微信的接口，必须携带上access_token的参数

    access_token：
        0.保证全局唯一凭据，保存为本地文件
        2.凭据每两小时必须更新一次

        先去本地读取凭据
            有：检查凭据有没有过期
                过期：直接使用
                没过期：重新请求微信服务器的access_token，并保存在本地
            没有：
                重新请求微信服务器的access_token，并保存在本地
*/


//验证服务器的有效性
module.exports = function (config) {
    // new Wechat(config);

     return async (req,res)=> {
        // console.log(req.query)  下面的对象
         /*
            { signature: '071564e539303d5d7bc9afaf2be423885826073f',
              timestamp: '1523859351',
              nonce: '1167207324',
              openid: 'oP-kh1l_jfnl9UfpA90Z623c8lM8' }
        */
        /*
            { signature: 'f654eb0306fdbd3a6e47e1900fa8b47bc6597899', //微信加密签名，经过三个参数timestamp、nonce、token的某种算法推出来的
              echostr: '8252187338092314558', //微信随机字符串
              timestamp: '1523771324',  //微信发送请求时间
              nonce: '3101799830' }  //微信随机数字
        */
         /*
           验证服务器的有效性：
             0. 将三个参数timestamp、nonce、token组合起来，进行字典序排序
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

         /*
            微信服务武器会推送给两种消息给开发者
                GRT 验证服务器的有效性
                POST 当微信用户发送消息/触发事件时，微信服务器收到xml消息转发给开发者服务器
                    post请求：
                        body里有请求参数
                        查询字符串的方式发送请求参数
                            openid：微信用户的签名
         */

         if (req.method === 'GET') {
             // 验证服务器的有效性
             if (sha1str === signature) {  //确认消息来自微信服务器
                 res.send(echostr)
             } else {
                 res.send('error')
             }
         } else if (req.method === 'POST') {
             //微信用户发送消息
             // console.log(req.query)
             /*
               post请求：
                 body里有请求参数
                 查询字符串的方式发送请求参数
              */
             // console.log(req.body)  //undefined
             /*
             { signature: '33f200eebc89fbe81d4fe639ae5f3066758c489e',
               timestamp: '1523847634',
               nonce: '367299082',
               openid: 'oAsoR1iP-_D3LZIwNCnK8BFotmJc' } //微信用户的id
              */
             if (sha1str !== signature) { //消息不来自微信服务器直接return
                 res.send('error')
                 return
             }
             //请求体中参数通过流的方式发送过来

             // tools.getXMLAsync(req)
             //   .then(res => {
             //     console.log(res)
             /*
             <xml>
               <ToUserName><![CDATA[gh_4fe7faab4d6c]]></ToUserName> //开发者的openid
               <FromUserName><![CDATA[oAsoR1iP-_D3LZIwNCnK8BFotmJc]]></FromUserName> //用户的openid
               <CreateTime>1523848230</CreateTime> //时间戳
               <MsgType><![CDATA[text]]></MsgType> //用户发送消息的类型 text/event
               <Content><![CDATA[3]]></Content>  //用户发送消息的内容
               <MsgId>6544878312341405311</MsgId>  //用户发送的消息，微信服务器会保存3天左右，对应有个id
             </xml>
              */
             // })
             //获取用户xml数据
             const xmlData = await tools.getXMLAsync(req)
             // console.log(xmlData)   xml

             //将xml数据转化为js对象
             const jsData = await tools.parseXMLAsync(xmlData)
             // console.log(jsData)    xml转化成js
             /*
             { xml:
              { ToUserName: [ 'gh_4fe7faab4d6c' ],
                FromUserName: [ 'oAsoR1iP-_D3LZIwNCnK8BFotmJc' ],
                CreateTime: [ '1523849130' ],
                MsgType: [ 'text' ],
                Content: [ '888888' ],
                MsgId: [ '6544882177811971929' ]
               }
             }
              */
             //将js对象中的数组干掉
             const message = tools.formatMessage(jsData.xml)
             console.log(message)
             /*
             { ToUserName: 'gh_4fe7faab4d6c',
               FromUserName: 'oAsoR1iP-_D3LZIwNCnK8BFotmJc',
               CreateTime: '1523849912',
               MsgType: 'text',
               Content: '中央音乐学院',
               MsgId: '6544885536476397605' }
              */

             //回复给用户的消息是必须是xml数据
             /*
                注意事项：
                    0、开发者在5秒内未回复任何内容
                    2、开发者回复了异常数据，比如JSON数据、xml数据中有多余空格等
                    3、xml数据中content为空
             */

             /*
                封装模块：
                    封装成一个回复xml数据的模块  tpl.js
                    封装一个回复用户的消息模块  teply.js
             */
             const replyMessage = await reply(message)
             console.log(replyMessage)

             res.send(replyMessage)
         }
    }
}