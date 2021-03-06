import Vue from 'vue';
import Vuex from 'vuex';

import modules from './modules';
import { Chat, ChatListUtils, MessageInfoType, MessageTargetType, transform } from '../views/im/utils/chatUtils';
import conf from '../views/im/conf';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: {},
    //token 是否有效
    tokenStatus: false,
    // 当前的用户
    user: {},
    flushLocalStore: false,
    websocket: {},
    messageListMap: new Map(),
    //聊天群的图片映射
    chatMap: new Map(),
    messageList: [],
    // 当前聊天窗口
    currentChat: {},
    // 所有的聊天窗口
    chatList: [],
    //好友列表
    userFriendList: [],
    //群组列表
    chatGroupList: [],
    //刷新token 的定时器
    flushTokenTimerId : null,
    //是否显示表情
    showFace:false,
  },
  mutations: {
    setShowFace: function(state, showFace) {
      state.showFace = showFace;
    },
    setFlushTokenTimerId: function(state, flushTokenTimerId) {
      state.flushTokenTimerId = flushTokenTimerId;
    },
    clearFlushTokenTimerId: function(state) {
      clearTimeout(state.flushTokenTimerId) ;
    },
    setToken: function(state, token) {
      sessionStorage.setItem('token', token.access_token);
      sessionStorage.setItem('refresh_token', token.refresh_token);
    },
    //token 是否有效
    setTokenStatus: function(state, tokenStatus) {
      state.tokenStatus = tokenStatus;
    },
    setUser: function(state, user) {
      state.user = user;
      sessionStorage.setItem("user", JSON.stringify(user));
    },
    setUserFriendList: function(state, userFriendList) {
      state.userFriendList = userFriendList;
    },
    setChatGroupList: function(state, chatGroupList) {
      state.chatGroupList = chatGroupList;
    },
    setChatMap: function(state, chatMap) {
      state.chatMap = chatMap;
    },
    setWebsocket: function(state, websocket) {
      state.websocket = websocket;
    },
    // 发送给服务器
    sendMessage: function(state, message) {
      let msg = {
        code: MessageInfoType.MSG_MESSAGE,
        message: message
      };
      state.websocket.send(JSON.stringify(message));
    },
    // 退出登录
    closeConnect: function(state) {
      state.websocket.heartReset();
      state.websocket.close();
    },
    // 退出后清除内存中的聊天信息
    clear: function(state) {
      state.messageList = [];
      state.messageListMap = new Map();
    },
    // 保存到内存
    addMessage: function(state, message) {
      message.remark1 = transform(message.remark1);
      state.messageList.push(message);
      state.messageListMap.set(message.receiveUserId, state.messageList);
      // 放入缓存
      ChatListUtils.setChatList(state.user.id, state.chatList);
    },
    // 在用户姓名下展示收到的最后一条信息
    setLastMessage: function(state, message) {
      let list = ChatListUtils.getChatList(state.user.id);
      let tempChatList = list.map(function(chat) {
        if (String(chat.id) === String(message.fromid) && message.type === '0') {
          chat.sign = message.content;
        } else if (String(chat.id) === String(message.id) && message.type === '1') {
          chat.sign = message.content;
        }
        return chat;
      });
      // 放入缓存
      ChatListUtils.setChatList(state.user.id, tempChatList);
      state.chatList = tempChatList;
    },
    setMessageList: function(state, messageList) {
      state.messageList = messageList;
    },
    setMessageListMap: function(state, messageListMap) {
      state.messageListMap = messageListMap;
    },
    addUnreadMessage: function(state, message) {
      if (message.type === 'p2p') {
        // 从内存中取聊天信息
        let cacheMessages = state.messageListMap.get(message.sendUserId);
        if (cacheMessages) {
          cacheMessages.push(message);
        } else {
          cacheMessages = [];
          cacheMessages.push(message);
          state.messageListMap.set(message.sendUserId, cacheMessages);
        }
      } else {
        // 从内存中取聊天信息
        let cacheMessages = state.messageListMap.get(message.id);
        if (cacheMessages) {
          cacheMessages.push(message);
        } else {
          cacheMessages = [];
          cacheMessages.push(message);
          state.messageListMap.set(message.id, cacheMessages);
        }
      }
    },
    setCurrentChat: function(state, currentChat) {
      console.log(currentChat);
      state.currentChat = currentChat;
      state.currentChat.unReadCount = 0;
      let tempChatList = state.chatList.map(function(chat) {
        if (String(chat.id) === String(currentChat.id)) {
          chat.unReadCount = 0;
          chat.isUserClick = false;
        }
        return chat;
      });
      // 放入缓存
       ChatListUtils.setChatList(state.user.id, tempChatList);
    },
    setChatList: function(state, chatList) {
      state.chatList = chatList;
    },
    delChat: function(state, chat) {
      state.chatList = ChatListUtils.delChat(state.user.id, chat);
    },
    /**
     * 设置未读消息条数
     * @param state state
     * @param message 消息
     */
    setUnReadCount: function(state, message) {
      let tempChatList = [];
      let tempChat = {};
      for (let chat of state.chatList) {
        // 给接受消息的聊天室未读数量 +1
        if (String(chat.id) === String(message.from) && message.communicationType === MessageTargetType.FRIEND) {
          if (!chat.unReadCount) {
            chat.unReadCount = 0;
          }
          chat.unReadCount = chat.unReadCount + 1;
          tempChat = chat;
        }
        //群组聊天
        else if (String(chat.id) === String(message.to) && message.communicationType === MessageTargetType.CHAT_GROUP) {
          if (!chat.unReadCount) {
            chat.unReadCount = 0;
          }
          chat.unReadCount = chat.unReadCount + 1;
          // chat.avatar = conf.getHostUrl() + state.chatMap.get(message.id).avatar;
          tempChat = chat;
        } else {
          tempChatList.push(chat);
        }
      }
      // 聊天列表没有此人的chat
      // if (!tempChat.id && message.communicationType === MessageTargetType.FRIEND) {
      //   tempChat = new Chat(message.from, message.fromRealName, message.fromRealName,  message.content, MessageTargetType.FRIEND, message.date);
      // } else if (!tempChat.id && message.communicationType === MessageTargetType.CHAT_GROUP) {
      //   let groupChat = state.chatMap.get(message.id);
      //   tempChat = new Chat(message.to, message.fromRealName, message.fromRealName,  message.content, MessageTargetType.FRIEND, message.date);
      // }
      // 添加到聊天室列表的第一个
      tempChatList.unshift(tempChat);
      // 重新设置chatList
      state.chatList = tempChatList;
      // 放入缓存
      ChatListUtils.setChatList(state.user.id, tempChatList);
    },
    /**
     * 置顶
     * @param state state
     * @param message 信息
     */
    changPlace: function (state, message) {
      let tempChatList = [];
      let msgTop=[];
      let chatList=[];
      let tempChat = {};
      console.log(state.chatList);
      for (let chat of state.chatList) {
        // 给接受消息的聊天室未读数量 +1
        if (String(chat.id) === String(message.receiveUserId)){
          tempChat = chat;
        } else if(chat.msgTopTime == 1){
          msgTop.push(chat);
        } else {
          tempChatList.push(chat);
        }
      }
      // 添加到聊天室列表的第一个
      tempChatList.unshift(tempChat);
      chatList=tempChatList;

      if(msgTop.length)chatList=msgTop.concat(tempChatList);
      // 重新设置chatList
      state.chatList = chatList;
      console.log(state.chatList);

      // 放入缓存
      ChatListUtils.setChatList(state.user.id, chatList);
    }

  },
  modules,
  strict: process.env.NODE_ENV !== 'production'
});
