/*
  此模块用来实现所有接口
 */
const prefix = 'https://api.weixin.qq.com/cgi-bin/'

module.exports = {
  accessToken: prefix + 'token?grant_type=client_credential',
  temporary: {
    upload: prefix + 'media/upload?',
    get: prefix + 'media/get?'
  },
  permanent: {
    upload: prefix + 'material/add_material?',
    uploadNews: prefix + 'material/add_news?',
    uploadNewsPic: prefix + 'media/uploadimg?',
    get: prefix + 'material/get_material?',
    update: prefix + 'material/update_news?',
    getCount: prefix + 'material/get_materialcount?',
    batch: prefix + 'material/batchget_material?'
  },
  tags: {
    create: prefix + 'tags/create?',
    get: prefix + 'tags/get?',
    update: prefix + 'tags/update?',
    delete: prefix + 'tags/delete?'
  },
  usersTag: {
    batch: prefix + 'tags/members/batchtagging?',
    unBatch: prefix + 'tags/members/batchuntagging?',
    get: prefix + 'tags/getidlist?'
  },
  usersInfo: {
    get: prefix + 'user/info?'
  },
  mass: {
    tag: prefix + 'message/mass/sendall?'
  },
  menu: {
    create: prefix + 'menu/create?',
    get: prefix + 'menu/get?',
    delete: prefix + 'menu/delete?',
    current: prefix + 'get_current_selfmenu_info?'
  },
  getTicket: prefix + 'ticket/getticket?'

}