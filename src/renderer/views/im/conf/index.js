export default {
  app_name: 'V-IM',
  http_protocol: 'http',
  http_port: 8088,
  ws_port: 2525,
  init: '/api/user/init',
  his_url: '/api/message/list',
  chat_users_url: '/api/user/chatUserList',
  token_path: '/info/phone/login',
  register_url: '/register',
  myFriendsUrl:'/info/phone/findMyFriends',
  myGroups:'/info/phone/findMyGroups',
  myChatLogList:'/info/phone/mchat/myChatLogList',
  bzChange:'/info/phone/bzChange',
  personCardInfo:'/info/phone/personCardInfo',
  groupInfo:'/info/phone/GroupInfo',
  myFriendChatLogList:'/info/phone/mchat/getMyFriendChatLogList',
  searchFromFriendsByNo:'/info/phone/searchFromFriendsByNo',
  uploadingUrl:'/info/phone/mchat/uploadImg',
  msgTopChange:'/info/phone/msgTopChange',
  groupMsgTopChange:'/info/phone/group/msgTopChange',
  msgCallChange:'/info/phone/group/msgCallChange',
  applyFriend:'/info/phone/applyFriend',
  delFriend:'/info/phone/delFriend',
  getAllGroupPerson:'/info/phone/group/getAllGroupPerson',
  findOrgByPid:'/info/phone/findOrgByPid',
  findUsersByDeptId:'/info/phone/findUsersByDeptId',
  addPersonToGroup:'/info/phone/addPersonToGroup',
  nameAndDesChange:'/info/phone/group/nameAndDesChange',
  delGroup:'/info/phone/delGroup',
  delPersonFromGroup:'/info/phone/delPersonFromGroup',
  createNewGroup:'/info/phone/createNewGroup',
  ws_protocol: 'ws',
  url: 'http://58.218.203.29',
  // url: 'http://192.168.1.183',
  getHostUrl: function() {
    // return this.http_protocol + '://' + localStorage.getItem('host') + ':' + this.http_port;
    return this.http_protocol + '://58.218.203.29:' + this.http_port;
    // return this.http_protocol + '://192.168.1.183:' + this.http_port;
  },
  //登录地址
  getTokenUrl: function() {
    return this.getHostUrl() + this.token_path;
  },
  //好友列表
  getMyFriendsUrl: function() {
    return this.getHostUrl() + this.myFriendsUrl;
  },
  //群列表
  getMyGroupsUrl: function() {
    return this.getHostUrl() + this.myGroups;
  },
  //聊天列表
  getMyChatLogListUrl: function() {
    return this.getHostUrl() + this.myChatLogList;
  },
  //修改备注
  getBzChangeUrl: function() {
    return this.getHostUrl() + this.bzChange;
  },
  //获取个人信息
  getPersonCardInfoUrl: function() {
    return this.getHostUrl() + this.personCardInfo;
  },
  //获取群信息
  getGroupInfoUrl: function() {
    return this.getHostUrl() + this.groupInfo;
  },
  //获聊天记录
  getMyFriendChatLogListUrl: function() {
    return this.getHostUrl() + this.myFriendChatLogList;
  },
  //从好友中查询
  getSearchFromFriendsByNoUrl: function() {
    return this.getHostUrl() + this.searchFromFriendsByNo;
  },
  //上传图片、文件
  getUploadingUrl: function() {
    return this.getHostUrl() + this.uploadingUrl;
  },
  //好友消息置顶
  getMsgTopChangeUrl : function() {
    return this.getHostUrl() + this.msgTopChange;
  },
  //群消息置顶
  getGroupMsgTopChangeUrl: function() {
    return this.getHostUrl() + this.groupMsgTopChange;
  },
  //群消息免打扰
  getMsgCallChangeUrl: function() {
    return this.getHostUrl() + this.msgCallChange;
  },
  //好友申请
  getApplyFriendUrl: function() {
    return this.getHostUrl() + this.applyFriend;
  },
  //删除好友
  getDelFriendUrl: function() {
    return this.getHostUrl() + this.delFriend;
  },
  //获取群所有成员
  getAllGroupPersonUrl: function() {
    return this.getHostUrl() + this.getAllGroupPerson;
  },
  //查找部门列表
  getFindOrgByPidUrl: function() {
    return this.getHostUrl() + this.findOrgByPid;
  },
  //根据部门id查询人员信息
  getFindUsersByDeptIdUrl: function() {
    return this.getHostUrl() + this.findUsersByDeptId;
  },
  //添加群成员
  getAddPersonToGroupUrl: function() {
    return this.getHostUrl() + this.addPersonToGroup;
  },
  //修改群名和群介绍
  getNameAndDesChangeUrl: function() {
    return this.getHostUrl() + this.nameAndDesChange;
  },
  //解散群
  getDelGroupUrl: function() {
    return this.getHostUrl() + this.delGroup;
  },
  //删除群成员
  getDelPersonFromGroupUrl: function() {
    return this.getHostUrl() + this.delPersonFromGroup;
  },
  //创建普通群
  getCreateNewGroupUrl: function() {
    return this.getHostUrl() + this.createNewGroup;
  },
  getInitUrl: function() {
    return this.getHostUrl() + this.init;
  },
  getChatUsersUrl: function() {
    return this.getHostUrl() + this.chat_users_url;
  },
  getHisUrl: function() {
    return this.getHostUrl() + this.his_url;
  },
  getRegisterUrl: function() {
    return this.getHostUrl() + this.register_url;
  },
  getWsUrl: function() {
    // return this.ws_protocol + '://' + localStorage.getItem('host') + ':' + this.ws_port;
    return this.ws_protocol + '://58.218.203.29:' + this.ws_port;
  }
};
