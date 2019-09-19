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
  ws_protocol: 'ws',
  url: 'http://58.218.203.29',
  getHostUrl: function() {
    // return this.http_protocol + '://' + localStorage.getItem('host') + ':' + this.http_port;
    return this.http_protocol + '://58.218.203.29:' + this.http_port;
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
