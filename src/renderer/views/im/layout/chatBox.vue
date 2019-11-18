<template>
    <div class="user-box">
        <div class="user-box-list">
            <Search :isUser="isUser" :list="chatList" @showSearch="showSearch" @searchUser="searchUser"></Search>
            <div class="group-box" v-if="!showSearchDiv">
                <ul class="group-list">
                    <li class="group-list-li" :class="{'activeClass': item.pitchOn}" v-for="(item,index) in chatList" :key="index" @click="userClick(index,item)">
                        <div class="li-img" v-if="item.type == 'p2p'">
                            <img v-if="item.header" :src="url+item.header" alt="">
                            <div v-else="" class="li-img-header">{{item.remark && item.remark.slice(-2) || item.realName.slice(-2)}}</div>
                            <div v-if="item.unReadCount" class="unReadCount">{{item.unReadCount}}</div>
                        </div>
                        <div class="li-img" v-if="item.type == 'group'">
                            <img v-if="item.header" :src="url+item.header" alt="">
                            <div class="groupIcon" v-else=""><Icon type="ios-people" /></div>
                            <div v-if="item.unReadCount" class="unReadCount">{{item.unReadCount}}</div>
                        </div>
                        <div :class="{'li-img-name':item.msg}">
                            <p>{{item.remark || item.realName}}</p>
                            <p class="fs-14">{{item.msg}}</p>
                        </div>
                    </li>
                </ul>

            </div>
            <div class="group-box" v-else="">
                <ul class="group-list" v-if="searchChatLogList">
                    <li class="group-list-li" v-for="(item,index) in searchChatLogList" :key="index">
                        <div class="li-img" v-if="item.type == 'p2p'">
                            <img v-if="item.header" :src="url+item.header" alt="">
                            <div v-else=""  class="li-img-header">{{item.remark && item.remark.slice(-2) || item.realName.slice(-2)}}</div>
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
            <Chat ref="chat" :chat="currentChat" :user="user" :userItem="userItem" :isHaveMore="isHaveMore" @didScroll="didScroll" @getMyChatLogList="getMyChatLogList" @changUserItem="changUserItem" @getGroupInfo="getGroupInfo"></Chat>
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
    timeoutFetch,
    excludeSpecial,
    transform
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
        messageList:[],
        isUserChang:false
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
          let self=this;
          let chatList=self.$store.state.chatList;
          if(chatList.length){
            chatList.map(function (item,index) {
              if(item.isUserClick){
                self.userChang(index,chatList[index]);
              }
            });
          }
          return this.$store.state.chatList;
        },
        set: function(chatList) {
          this.$store.commit('setChatList', chatList);
        }
      }
    },
    methods: {
      /* 获取聊天列表 */
      getMyChatLogList:function () {
        let self=this;
        let formData = new FormData();
        // 请求参数 ('key',value)
        formData.set('userId', self.user.userId);
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
        console.log(n);
        let self=this;
        let chatList=self.chatList;
        if(!self.chatList[index].pitchOn){
          self.messageList=[];
          self.pageNo=0;
          self.isScroll=false;
          self.getPersonCardInfo(n);
          if(n.type == 'p2p'){
            self.getPersonalDetails(n)
          }else {
            self.getGroupInfo(n)
          }
          this.$store.commit('setShowFace', false);
        }
        let data={
          "communicationType":"readed",
          "content":n.type,
          "from":n.id,
          "fromRealName":n.remark || n.realName,
          "to":self.user.userId,
          "date":"",
          "msgId":"",
          "color":""
        };
        if(n.unReadCount){
//          self.$store.commit('sendMessage', data);
          self.setReaded(n.id,n.type,data);
        }
        chatList.map(function (item) {
          item.pitchOn=false;
          item.isUserClick=false;
        });
        chatList[index].pitchOn=true;
        self.chatList=chatList;
        self.activeClass=index;
        self.currentChat = n;

      },
      /* 切换好友/群 */
      userChang:function (index,n) {
        let self=this;
        self.messageList=[];
        self.pageNo=0;
        self.isScroll=false;
        self.getPersonCardInfo(n);
        if(n.type == 'p2p'){
          self.getPersonalDetails(n)
        }else {
          self.getGroupInfo(n)
        }
        this.$store.commit('setShowFace', false);
        let data={
          "communicationType":"readed",
          "content":n.type,
          "from":n.id,
          "fromRealName":n.remark || n.realName,
          "to":self.user.userId,
          "date":"",
          "msgId":"",
          "color":""
        };
        if(n.unReadCount){
//          self.$store.commit('sendMessage', data);
          self.setReaded(n.id,n.type,data);
        }
        self.currentChat = n;
      },
      /* 设置成已读 */
      setReaded:function (otherId,type,data) {
        let self=this;
        let formData = new FormData();
        formData.set('userId', self.user.userId);
        formData.set('otherId', otherId);
        formData.set('type', type);
        fetch(conf.setReadedUrl(), {
          method: 'POST',
          model: 'cros', //跨域
          headers: {
            Accept: 'application/json'
          },
          body: formData
        })
          .then(response => response.json())
          .then(json => {
            self.$store.commit('sendMessage', data);
          })
          .catch((error) => {
            console.log(error)
          });
      },
      /* 查看更多 */
      didScroll:function (n) {
        this.pageNo=n.pageNo;
        this.isScroll=n.isScroll;
        this.getPersonCardInfo(n.userItem);
      },
      //获取个人信息
      getPersonalDetails:function (n) {
        let self=this;
        let userItem=n;
        let formData = new FormData();
        formData.set('userId', self.user.userId);
        formData.set('otherId', userItem.id);

        fetch(conf.getPersonCardInfoUrl(), {
          method: 'POST',
          model: 'cros', //跨域
          headers: {
            Accept: 'application/json'
          },
          body: formData
        })
          .then(response => response.json())
          .then(json => {
            let data=Object.assign(json,userItem);
            self.userItem=data;
            console.log(self.userItem);
          })
          .catch((error) => {
            console.log(error)
          });
      },
      /* 获取群信息 */
      getGroupInfo:function (n) {
        let self=this;
        let update=false;
        let groupItem=n;
        //判断是否是更新
        if(groupItem.imGrouperNum){
          update=true;
          delete groupItem.groupPeopleList;
          delete groupItem.groupPeopleIdList;
          delete groupItem.imGrouperNum;
        }
        let formData = new FormData();
        formData.set('userId', self.user.userId);
        formData.set('groupId', groupItem.id);
        fetch(conf.getGroupInfoUrl(), {
          method: 'POST',
          model: 'cros', //跨域
          headers: {
            Accept: 'application/json'
          },
          body: formData
        })
          .then(response => response.json())
          .then(json => {
            let newJson=JSON.stringify(json);
            let data=Object.assign(JSON.parse(newJson),groupItem);
            self.userItem=data;
            if(update){
              self.$refs.chat.unfold(self.userItem);
            }
          })
          .catch((error) => {
            console.log(error)
          });
      },
      changUserItem:function (n) {
        self.userItem=n;
      },
      /* 获取聊天记录 */
      getPersonCardInfo:function (n) {
        let self=this;
        let formData = new FormData();
        let userItem=n;
        console.log(n);
        console.log(this.pageNo);
        formData.set('curUserId', self.user.userId);
        formData.set('otherId', userItem.id);
        formData.set('pageNo', self.pageNo);
        formData.set('type', userItem.type);
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
            console.log(self.messageList);
            self.messageList.forEach((item,index,array)=>{
              item.remark1= item.remark1 ? transform(item.remark1) : item.remark1;
            });
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
    activated: function() {
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

      //全部信息标记已读
      let data={};
      self.chatList.forEach((item)=>{
        //执行代码
        if(item.unReadCount){
          console.log(item);
          data={
            "communicationType":"readed",
            "content":item.type,
            "from":item.id,
            "fromRealName":item.remark || item.realName,
            "to":self.user.userId,
            "date":"",
            "msgId":"",
            "color":""
          };
          self.setReaded(item.id,item.type,data);
        }
      })
    },
    created: function() {
      let self=this;
      self.user = self.$store.state.user.userId ? self.$store.state.user :JSON.parse(sessionStorage.getItem("user"));
      self.getMyChatLogList();
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
        let data = event.data;
        let sendInfo = JSON.parse(data);
        console.log(sendInfo);
        // 真正的消息类型
        winControl.flashIcon();
        let message = sendInfo.data;
        let err = sendInfo.err;
        if(!err || sendInfo.msg.indexOf('已读') != -1) return false;
        /*let content=message.content;
        content=transform(content);*/
        let newList={
          "pubTime": message.date,
          "receiveColor": "17c295",
          "receiveUserId": message.to,
          "remark1": transform(message.content),
          "sendColor": "17c295",
          "sendRealName": message.fromRealName,
          "sendUserId": message.from,
          "type":message.communicationType,
          "sendHeader":message.header || ''
        };

        // 发送给个人
        if (message.communicationType === MessageTargetType.FRIEND) {
          // 接受人是当前的聊天窗口
          if (String(message.from) === String(self.$store.state.currentChat.id)) {
            self.$store.commit('addMessage', newList);
          } else if(String(message.from) === String(self.user.userId)){
            self.$store.commit('addMessage', newList);
            self.$store.commit('changPlace', newList);
            self.chatList[0].pitchOn=true;
          } else {
            self.$store.commit('setUnReadCount', newList);
          }
        } else if (message.communicationType === MessageTargetType.CHAT_GROUP) {
          // message.avatar = self.$store.state.chatMap.get(message.id);
          // 接受人是当前的聊天窗口
          if (String(message.to) === String(self.$store.state.currentChat.id)) {
            if (String(message.from) !== self.$store.state.user.id) {
              self.$store.commit('addMessage', newList);
              self.$store.commit('changPlace', newList);
            } else if(String(message.from) === String(self.user.userId)){
              self.$store.commit('addMessage', newList);
              self.$store.commit('changPlace', newList);
              self.chatList[0].pitchOn=true;
            }
          }else {
            self.$store.commit('setUnReadCount', newList);
          }
        }
        if(String(message.from) !== String(self.user.userId)){
          winControl.flashFrame();
        }
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
        font-size: 15px;
        line-height: 40px;
        .li-img{
            position: absolute;
            top:50%;
            left: 10px;
            transform: translate(0,-50%);
            width: 45px;
            height: 45px;
            line-height: 45px;
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
        .li-img-name{
            height: 40px;
            line-height: 20px;
            .fs-14{
                font-size: 14px;
                color: #999;
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