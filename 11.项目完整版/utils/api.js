const prefix = 'https://api.weixin.qq.com/cgi-bin/'
const dbPrefix = 'https://api.douban.com/v2/movie/'

module.exports = {
  accessToken: prefix + 'token?grant_type=client_credential',
  ticket: prefix + 'ticket/getticket?',
  temporary: {
    upload: prefix + 'media/upload?',
    get: prefix + 'media/get?'
  },
  permanent: {
    addNews: prefix + 'material/add_news?',
    uploadImg: prefix + 'media/uploadimg?',
    addMaterial: prefix + 'material/add_material?',
    get: prefix + 'material/get_material?'
  },
  menu: {
    create: prefix + 'menu/create?',
    delete: prefix + 'menu/delete?'
  },
  douban: {
    theaters: dbPrefix + 'in_theaters',
    coming: dbPrefix + 'coming_soon',
    top250: dbPrefix + 'top250',
    subject: dbPrefix + 'subject/'
  }
}