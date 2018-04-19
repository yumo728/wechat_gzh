/*
  此模块用来设置回复的消息
  一共有6种回复消息的类型：文本、图片、图文、语音、视频、音乐
 */
module.exports = (options) => {

  let replyMessage = '<xml>' +
    '<ToUserName><![CDATA[' + options.toUserName + ']]></ToUserName>' +
    '<FromUserName><![CDATA[' + options.fromUserName + ']]></FromUserName>' +
    '<CreateTime>' + options.createTime + '</CreateTime>' +
    '<MsgType><![CDATA[' + options.msgType + ']]></MsgType>'

  if (options.msgType === 'text') {
    replyMessage += '<Content><![CDATA[' + options.content + ']]></Content>'
  } else if (options.msgType === 'image') {
    //mediaId：媒体素材的id，我们传给微信的媒体素材，微信会帮我们储存起来，并返回一个mediaId给我们使用
    //通过mediaId就能找到我们指定的媒体素材了
    replyMessage += '<Image><MediaId><![CDATA[' + options.content.mediaId + ']]></MediaId></Image>'
  } else if (options.msgType === 'voice') {
    replyMessage += '<Voice><MediaId><![CDATA[' + options.content.mediaId + ']]></MediaId></Voice>'
  } else if (options.msgType === 'video') {
    //title ： 视频的标题
    // description ： 视频的描述
    replyMessage += '<Video>' +
      '<MediaId><![CDATA[' + options.content.mediaId + ']]></MediaId>' +
      '<Title><![CDATA[' + options.content.title + ']]></Title>' +
      '<Description><![CDATA[' + options.content.description + ']]></Description>' +
      '</Video>'
  } else if (options.msgType === 'music') {
    //MusicUrl 音乐的url地址。微信一般不保存大文件，所以需要用户提供地址自己去加载资源
    //HQMusicUrl 高质量音乐的url地址
    //ThumbMediaId 音乐略缩图的mediaId
    replyMessage += '<Music>' +
      '<Title><![CDATA[' + options.content.title + ']]></Title>' +
      '<Description><![CDATA[' + options.content.description + ']]></Description>' +
      '<MusicUrl><![CDATA[' + options.content.musicUrl + ']]></MusicUrl>' +
      '<HQMusicUrl><![CDATA[' + options.content.hqMusicUrl + ']]></HQMusicUrl>' +
      '<ThumbMediaId><![CDATA[' + options.content.mediaId + ']]></ThumbMediaId>' +
      '</Music>'
  } else if (options.msgType === 'news') {
    //ArticleCount 图文消息数量，数量限制为8个以内
    //Articles 里面放所有图文消息，第一个图文消息会是大图
    //item 里面就是每一个图文消息
    //PicUrl 图片的url地址
    //Url 点击图文消息跳转的链接
    replyMessage += '<ArticleCount>' + options.content.length + '</ArticleCount>' +
      '<Articles>'
      
    options.content.forEach((item, index) => {
      replyMessage += '<item>' +
        '<Title><![CDATA[' + item.title + ']]></Title>' +
        '<Description><![CDATA[' + item.description + ']]></Description>' +
        '<PicUrl><![CDATA[' + item.picUrl + ']]></PicUrl>' +
        '<Url><![CDATA[' + item.url + ']]></Url>' +
        '</item>'
    })

    replyMessage += '</Articles>'
  }

  replyMessage += '</xml>'

  return replyMessage
}