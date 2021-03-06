const tpl = require('./tpl')

module.exports = (message) => {
    //将要回复用户的具体消息
    let content = ''

    if (message.MsgType === 'text') {
        //说明用户发送text文本消息
        if (message.Content === '1') {
            content = '即将转取您银行卡的7000元 \n回复2 确认转取 \n回复3 不用确认'
        } else if (message.Content === '2') {
            content = '确认转取成功~~~'
        } else if (message.Content.match(3)) {
            content = '不用确认，转取成功~~~'
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

    let options = {}

    options.toUserName = message.FromUserName
    options.fromUserName = message.ToUserName
    options.createTime = Date.now()
    options.msgType = 'text'

    options.content = content

    return tpl(options)

}