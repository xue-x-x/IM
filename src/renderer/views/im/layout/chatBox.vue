<template>
    <div class="user-box">
        <div class="user-box-list">
            <Search :isUser="isUser" :list="chatList" @showSearch="showSearch" @searchUser="searchUser"></Search>
            <div class="group-box" v-if="!showSearchDiv">
                <ul class="group-list">
                    <li class="group-list-li" :class="{'activeClass': activeClass == index}" v-for="(item,index) in chatList" :key="index" @click="userClick(index,item)">
                        <div class="li-img" v-if="item.type == 'p2p'">
                            <img v-if="item.header" :src="url+item.header" alt="">
                            <div v-else="">{{item.realName.slice(-2)}}</div>
                        </div>
                        <div class="li-img" v-if="item.type == 'group'">
                            <img v-if="item.header" :src="url+item.header" alt="">
                            <div class="groupIcon" v-else=""><Icon type="ios-people" /></div>
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
                            <div v-else="">{{item.realName.slice(-2)}}</div>
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
            console.log(self.chatList);
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
        console.log(self.activeClass);
        console.log(n);
        if(self.activeClass != index){
          self.currentChat=[];
          self.pageNo=0;
          self.isScroll=false;
          self.getPersonCardInfo(n);
        }
        self.activeClass=index;
      },
      /* 查看更多 */
      didScroll:function (n) {
        console.log(n);
        this.pageNo=n.pageNo;
        this.isScroll=n.isScroll;
        this.getPersonCardInfo(n.userItem);
        console.log(this.isScroll);
      },
      /* 获取聊天记录 */
      getPersonCardInfo:function (n) {
        console.log(n)
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
            let currentChat=[];
            if(self.currentChat instanceof Array){
              currentChat=self.currentChat;
            }
            self.currentChat=json.list.concat(currentChat);
            self.$store.commit('setMessageList', self.currentChat);
            console.log(self.isScroll);
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
    created: function() {
      let self=this;
      self.user = self.$store.state.user.userId ? self.$store.state.user :JSON.parse(sessionStorage.getItem("user"));
      self.getMyChatLogList(self.user.userId);

    },
    mounted: function() {
      /*let self = this;
      let websocketHeartbeatJs = new WebsocketHeartbeatJs({
        url: conf.getWsUrl()
      });
      self.$store.commit('setWebsocket', websocketHeartbeatJs);
      self.getWebSocket();*/
      /*let websocketHeartbeatJs = new WebsocketHeartbeatJs({
        url: conf.getWsUrl()
      });
      self.$store.commit('setWebsocket', websocketHeartbeatJs);*/

//      self.getWebSocket();
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
    >div{
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