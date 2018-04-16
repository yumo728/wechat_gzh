const tpl = require('./tpl')
const Wechat = require('./wechat')
const config = require('../config/config')

const materailApi = new Wechat(config)

module.exports = async (message) => {
    //将要回复用户的具体消息
    let content = ''
    let options = {}

    if (message.MsgType === 'text') {
        //说明用户发送text文本消息
        if (message.content === '1') {
            content = '即将转取您银行卡的7000元 \n回复2 确认转取 \n回复3 不用确认'
        } else if (message.content === '2') {
            content = '确认转取成功~~~'
        } else if (message.content === '3') {
            content = '不用确认，转取成功~~~'
        }else if (message.content === '4') {
            console.log('1444')
            content = [{
                title: 'Nodejs开发',
                description: '这里有最新nodejs内容',
                picUrl: 'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1841004364,244945169&fm=58&bpow=121&bpoh=75',
                url: 'http://nodejs.cn/'
            }, {
                title: '微信公众号开发',
                description: '这里有最新微信公众号内容',
                picUrl: 'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1841004364,244945169&fm=58&bpow=121&bpoh=75',
                url: 'http://nodejs.cn/'
            }]
        }else if (message.content === '5') {
            //上传临时图片素材
            const data = await materailApi.uploadMaterial('image', __dirname + '/1.png')
            console.log(data)  //得到上传临时图片素材media_id
            //为了回复用户一个图片消息
            options.mediaId = data.media_id
            options.msgType = 'image'
        }
    } else if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {
            //订阅事件
            content = '欢迎您的关注'
            if (message.EventKey) {
                //推广用的
                content = '扫描带参数二维码关注的'
            }
        } else if (message.Event === 'unsubscribe') {
            //取消订阅事件
            console.log('无情取关~~')
        } else if (message.Event === 'SCAN') {
            content = '用户已关注时的事件推送'
        } else if (message.Event === 'LOCATION') {
            content = '纬度:' + message.Latitude + '\n经度:' + message.Longitude + '\n精度：' + message.Precision
        } else if (message.Event === 'CLICK') {
            content = message.EventKey
        }
    } else if (message.MsgType === 'location') {
        content = message.Location_X + '--' + message.Location_Y + '--' + message.Scale + '--' + message.Label
    }


    options.toUserName = message.FromUserName
    options.fromUserName = message.ToUserName
    options.createTime = Date.now()
    options.msgType = options.msgType || message.MsgType
    options.content = content

    if (options.msgType === 'event' || options.msgType === 'location') {
        options.msgType = 'text'
    }

    if (Array.isArray(options.content)) {
        options.msgType = 'news'
    }

    return tpl(options)

}