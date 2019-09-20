<template>
    <div class="user-box">
        <div class="user-box-list">
            <Search :isUser="isUser" :list="chatList" @showSearch="showSearch" @searchUser="searchUser"></Search>
            <div class="group-box" v-if="!showSearchDiv">
                <ul class="group-list">
                    <li class="group-list-li" :class="{'activeClass': activeClass == index}" v-for="(item,index) in chatList" :key="index" @click="userClick(index,item)">
                        <div class="li-img" v-if="item.type == 'p2p'">
                            <img v-if="item.header" :src="url+item.header" alt="">
                            <div v-else="" class="li-img-header">{{item.realName.slice(-2)}}</div>
                            <div v-if="item.unReadCount" class="unReadCount">{{item.unReadCount}}</div>
                        </div>
                        <div class="li-img" v-if="item.type == 'group'">
                            <img v-if="item.header" :src="url+item.header" alt="">
                            <div class="groupIcon" v-else=""><Icon type="ios-people" /></div>
                            <div v-if="item.unReadCount" class="unReadCount">{{item.unReadCount}}</div>
                        </div>
                        <div>{{item.remark || item.realName}}</div>
                    </li>
                </ul>
            </div>
            <div class="group-box" v-else="">
                <ul class="group-list" v-if="searchChatLogList">
                    <li class="group-list-li" v-for="(item,index) in searchChatLogList" :key="index">
                        <div class="li-img" v-if="item.type == 'p2p'">
                            <img v-if="item.header" :src="url+item.header" alt="">
                            <div v-else=""  class="li-img-header">{{item.realName.slice(-2)}}</div>
                        </div>
                        <div class="li-img" v-if="item.type == 'group'">
                            <img v-if="item.header" :src="url+item.header" alt="">
                            <div class="groupIcon" v-else=""><Icon type="ios-people" /></div>
                        </div>
                        <div>{{item.remark || item.realName}}</div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="chat-box">
            <Top></Top>
            <Chat :chat="currentChat" :user="user" :userItem="userItem" :isHaveMore="isHaveMore" @didScroll="didScroll"></Chat>
        </div>
    </div>
    <!--<someComponent></someComponent>-->
</template>

<script>
  import Search from '../components/search.vue';
  import Top from '../components/top.vue';
  import Chat from '../components/chat.vue';
  import conf from '../conf'
  import WebsocketHeartbeatJs from '../utils/WebsocketHeartbeatJs.js';
  import winControl from '../../../../main/windowControl.js';
  import {
    ChatListUtils,
    ErrorType,
    imageLoad,
    logout,
    MessageInfoType,
    MessageTargetType,
    timeoutFetch
  } from '../utils/chatUtils';
  import HttpApiUtils from '../utils/HttpApiUtils';

  export default {
    name: "",
    components: {
      Search,
      Top,
      Chat
    },
    data() {
      return {
        url:conf.url,
        user:{},
        chatLogList:[],
        userFriend:{},
        isClick:false,
        userItem:{},
        showSearchDiv:false,
        activeClass:-2,
        searchChatLogList:[],
        isUser:true,
        pageNo:0,
        isHaveMore:true,
        isScroll:false,
        messageList:[]
      }
    },
    computed: {
      currentChat: {
        get: function() {
          return this.$store.state.currentChat;
        },
        set: function(currentChat) {
          this.$store.commit('setCurrentChat', currentChat);
        }
      },
      chatList: {
        get: function() {
          return this.$store.state.chatList;
        },
        set: function(chatList) {
          this.$store.commit('setChatList', chatList);
        }
      }
    },
    methods: {
      /* 获取聊天列表 */
      getMyChatLogList:function (userId) {
        let self=this;
        console.log(userId);
        let formData = new FormData();
        // 请求参数 ('key',value)
        formData.set('userId', userId);
        fetch(conf.getMyChatLogListUrl(), {
          method: 'POST',
          model: 'cros', //跨域
          headers: {
            Accept: 'application/json'
          },
          body: formData
        })
          .then(response => response.json())
          .then(json => {
            console.log(json.list);
            self.chatList=json.list;
            self.userClick(0,json.list[0]);
          })
          .catch((error) => {
            console.log(error)
          });
      },
      /* 搜索切换 */
      showSearch:function (n) {
        this.showSearchDiv=n;
      },
      /* 点击好友 */
      userClick:function (index,n) {
        let self=this;
        self.$store.state.currentChat.unReadCount = 0;
        self.currentChat = n;
        if(self.activeClass != index){
          self.messageList=[];
          self.pageNo=0;
          self.isScroll=false;
          self.getPersonCardInfo(n);
        }
        self.activeClass=index;
      },
      /* 查看更多 */
      didScroll:function (n) {
        this.pageNo=n.pageNo;
        this.isScroll=n.isScroll;
        this.getPersonCardInfo(n.userItem);
      },
      /* 获取聊天记录 */
      getPersonCardInfo:function (n) {
        let self=this;
        let formData = new FormData();
        self.userItem=n;
        formData.set('curUserId', self.user.userId);
        formData.set('otherId', self.userItem.id);
        formData.set('pageNo', self.pageNo);
        formData.set('type', self.userItem.type);
        fetch(conf.getMyFriendChatLogListUrl(), {
          method: 'POST',
          model: 'cros', //跨域
          headers: {
            Accept: 'application/json'
          },
          body: formData
        })
          .then(response => response.json())
          .then(json => {
            self.isHaveMore=json.list.length >= 50 ? true : false;
            self.messageList=json.list.concat(self.messageList);
            self.$store.commit('setMessageList', self.messageList);
            if(!self.isScroll){
              self.$nextTick(() => {
                imageLoad('message-box');
              });
            }

          })
          .catch((error) => {
            console.log(error)
          });
      },
      searchUser:function (n) {
        this.searchChatLogList=n
      },
      /* 搜索  */
      getSearchUser:function (search) {
        let self=this;
        let formData = new FormData();
        let content=search;
        formData.set('userId', self.user.userId);
        formData.set('content', content);

        fetch(conf.getSearchFromFriendsByNoUrl(), {
          method: 'POST',
          model: 'cros', //跨域
          headers: {
            Accept: 'application/json'

          },
          body: formData
        })
          .then(response => response.json())
          .then(json => {
            console.log(json);
          })
          .catch((error) => {
            console.log(error)
          });
      },
      getWebSocket:function () {
        let self=this;
        let data={
          communicationType:'login',
          userId:self.user.userId,
          fromType:'web'
        };
        self.$store.commit('sendMessage', data);
      },
    },
   /* activated: function() {
      let self = this;
      // 当前聊天室
      if (self.$route.query.chat) {
        self.$store.commit('setCurrentChat', this.$route.query.chat);
      }
      // 重新设置chatList
      self.$store.commit('setChatList', ChatListUtils.getChatList(self.$store.state.user.id));
      // 每次滚动到最底部
      this.$nextTick(() => {
        imageLoad('message-box');
      });
    },*/
    created: function() {
      let self=this;
      self.user = self.$store.state.user.userId ? self.$store.state.user :JSON.parse(sessionStorage.getItem("user"));
      self.getMyChatLogList(self.user.userId);

    },
    mounted: function() {
      let self = this;
      let data={
        communicationType:'login',
        userId:self.user.userId,
        fromType:'web'
      };
      let websocketHeartbeatJs = new WebsocketHeartbeatJs({
        url: conf.getWsUrl()
      });
      websocketHeartbeatJs.onopen = function() {
        websocketHeartbeatJs.send(JSON.stringify(data));
      };
      websocketHeartbeatJs.onmessage = function(event) {
        console.log(event);
        let data = event.data;
        let sendInfo = JSON.parse(data);
        console.log(sendInfo);
        // 真正的消息类型
        winControl.flashIcon();
        let message = sendInfo.data;
        console.log(message);
        let newList={
          "pubTime": message.date,
          "receiveColor": "17c295",
          "receiveUserId": message.to,
          "remark1": message.content,
          "sendColor": "17c295",
          "sendRealName": message.fromRealName,
          "sendUserId": message.from,
          "type":message.communicationType
        };
        console.log(newList);
        // 发送给个人
        if (message.communicationType === MessageTargetType.FRIEND) {
          // 接受人是当前的聊天窗口
          if (String(message.from) === String(self.$store.state.currentChat.id)) {
            self.$store.commit('addMessage', newList);
          } else if(String(message.from) === String(self.user.userId)){
            self.$store.commit('addMessage', newList);
            self.$store.commit('changPlace', newList);
            self.activeClass=0;
          } else {
            self.$store.commit('setUnReadCount', newList);

          }
        } else if (message.communicationType === MessageTargetType.CHAT_GROUP) {
          // message.avatar = self.$store.state.chatMap.get(message.id);
          // 接受人是当前的聊天窗口
          if (String(message.to) === String(self.$store.state.currentChat.id)) {
            if (String(message.from) !== self.$store.state.user.id) {
              self.$store.commit('addMessage', newList);
            } else if(String(message.from) === String(self.user.userId)){
              self.$store.commit('addMessage', newList);
              self.$store.commit('changPlace', newList);
              self.activeClass=0;
            }
          }else {
            self.$store.commit('setUnReadCount', newList);
          }
        }
        winControl.flashFrame();
        self.$store.commit('setLastMessage', newList);
        // 每次滚动到最底部
        self.$nextTick(() => {
          imageLoad('message-box');
        });
      };
      console.log(websocketHeartbeatJs);
      self.$store.commit('setWebsocket', websocketHeartbeatJs);
    }
  }
</script>

<style lang="scss" scoped>
    @import '../../../styles/theme';

    .ivu-tabs-content {
        height: 100%;
    }

    .user-box {
        width: 26rem;
        height: 100%;
        display: flex;
        flex-direction: row;
    }
    .chat-box {
        flex: 1;
        display: flex;
        flex-direction: column;
        position: relative;
        background-color: #f5f5f5;
    }

    .user-box-list {
        height: 100%;
        width: 240px;
        display: flex;
        flex-direction: column;
        background: #eae8e7;
    }

    .group-box{
        width: 100%;
        height: calc(100% - 56px);

        .group-list{
            height: 100%;
            overflow-y: auto;
        }
    .group-list-li{
        width: 100%;
        position: relative;
        padding: 10px 10px 10px 60px;
        line-height: 40px;
        font-size: 16px;

        .li-img{
            position: absolute;
            top:50%;
            left: 10px;
            transform: translate(0,-50%);
            width: 45px;
            height: 45px;
            img{
                width: 100%;
                height: 100%;
                border-radius: 3px;
            }
            .li-img-header{
                width: 100%;
                height: 100%;
                background-color: #3498db;
                color: #fff;
                border-radius: 50%;
                text-align: center;
                font-size: 14px;
            }
            .groupIcon{
                width: 100%;
                height: 100%;
                background-color: #1abc9c;
                color: #fff;
                border-radius: 5px;
                text-align: center;
                font-size: 32px;
            }
            .unReadCount{
                position: absolute;
                right: -5px;
                top: -5px;
                padding: 0 5px;
                min-width: 16px;
                height: 16px;
                line-height: 15px;
                border-radius: 8px;
                background-color: red;
                text-align: center;
                font-size: 10px;
                color: #fff;
            }
        }
    }
    .group-list-li:hover{
        background-color: #dbdada;
    }
    .activeClass{
        background-color: #c5c5c5;
    }
    .activeClass:hover{
        background-color: #c5c5c5;
    }
    }
</style>