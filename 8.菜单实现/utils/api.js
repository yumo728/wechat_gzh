const prefix = 'https://api.weixin.qq.com/cgi-bin/'

module.exports = {
    accessToken: prefix + 'token?grant_type=client_credential',
    temporary: {
        upload: prefix + 'media/upload?'
    },
    permanent: {
        addNews: prefix + 'material/add_news?',
        uploadImg: prefix + 'media/uploadimg?',
        addMaterial: prefix + 'material/add_material?',
        get: prefix + 'material/get_material?',
    },
    menu: {
        create: prefix + 'menu/create?',
        delete: prefix + 'menu/delete?'
    }
}