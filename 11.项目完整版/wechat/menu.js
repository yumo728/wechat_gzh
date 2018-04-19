const {url} = require('../config/config')
module.exports = {
    button: [
        {
            type: "view",
            name: "\ue04a今日电影",
            url: url + "/movie"
        },
        {
            name: "\ue443菜单",
            sub_button:[
                {
                    type: "view",
                    name: "\ue03c语音识别",
                    url: url + "/search"

                },
                {
                    type:"click",
                    name:"\ue032赞一下我们",
                    key:"已赞"
                },
                {
                    type: "scancode_waitmsg",  //扫码推事件且弹出“消息接收中”提示框的事件推送
                    name: "\ue036扫码带提示",
                    key: "scancode_waitmsg"
                },
                {
                    type: "scancode_push",  //扫码推事件的事件推送
                    name: "\ue312扫码推事件",
                    key: "scancode_push",
                },
                {
                    name: "\ue301发送位置",
                    type: "location_select",
                    key: "location_select"
                }
            ]
        },
        {
            name: "\ue13f发图",
            sub_button: [
                {
                    type: "pic_sysphoto",  //弹出系统拍照发图的事件推送
                    name: "\ue205系统拍照发图",
                    key: "pic_sysphoto"
                },
                {
                    type: "pic_photo_or_album", //拍照或者相册发图
                    name: "\ue32e拍照或者相册发图",
                    key: "pic_photo_or_album",
                },
                {
                    type: "pic_weixin",  //弹出微信相册发图器的事件推送
                    name: "\ue327微信相册发图",
                    key: "pic_weixin"
                },
                // {
                //   "type": "media_id",
                //   "name": "图片",
                //   "media_id": "MEDIA_ID1"
                // },
                // {
                //   "type": "view_limited",
                //   "name": "图文消息",
                //   "media_id": "MEDIA_ID2"
                // }
            ]
        }
    ]
}
