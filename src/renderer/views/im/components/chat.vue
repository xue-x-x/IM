<template>
    <div class="chat-message">
        <div class="chat-title">
            <div>{{userItem.remark || userItem.realName}}</div>
            <div><Icon type="ios-more" /></div>
        </div>
        <div class="chat-content">
            <div class="chat-records" id="message-box"  @scroll="didScroll">
                <ul>
                    <li class="view-more" v-if="isHaveMore">
                        <span v-if="isView">查看更多</span>
                        <span v-else>
                           <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                        </span>
                    </li>
                    <li class="chat-records-li" :class="{'chat-mine': item.sendRealName == user.userName}" v-for="(item,index) in messageList" :key="index">
                        <div class="chat-user">
                            <img v-if="item.sendHeader" :src="url+item.sendHeader" alt="">
                            <div v-else="">{{item.sendRealName.slice(-2)}}</div>
                            <cite v-if="item.sendRealName != user.userName">{{item.sendRealName}}<i>{{item.pubTime}}</i></cite>
                            <cite v-else=""><i>{{item.pubTime}}</i>{{item.sendRealName}}</cite>
                        </div>
                        <div class="chat-text">
                            <pre v-html="item.remark1"></pre>
                        </div>
                    </li>
                    <!--<li class="chat-records-li chat-mine">
                        <div class="chat-user">
                            <img src="../../../assets/1.jpg" alt="">
                            <cite><i>2019-09-16 14:59:28</i>管理员</cite>
                        </div>
                        <div class="chat-text">
                            <pre>fsadfasdfasd</pre>
                        </div>
                    </li>-->
                </ul>
            </div>
            <div class="chat-tool">
                <div class="chat-tool-title">
                    <Icon type="ios-happy-outline" title="表情"/>
                    <Icon type="ios-image-outline" title="图片"/>
                    <Icon type="ios-text-outline" title="聊天记录"/>
                </div>
                <div class="chat-tool-textarea">
                    <textarea v-model="messageContent" @keyup.enter="mineSend()"></textarea>
                </div>
                <div class="chat-tool-send" @click="mineSend">发送</div>
            </div>
        </div>
    </div>
    <!--<someComponent></someComponent>-->
</template>

<script>
  //import someComponent from './someComponent'
  const { imageLoad, transform, ChatListUtils } = require('../utils/chatUtils');
  import conf from '../conf'
//  import WebsocketHeartbeatJs from '../utils/WebsocketHeartbeatJs.js';
  export default {
    name: "",
    props:{
      user:Object,
      userItem:Object,
      isHaveMore:Boolean,
    },
    data() {
      return {
        url:conf.url,
        isView:true,
        pageNo:0,
        messageContent:''
      }
    },
    methods: {
      /* 下拉加载更多 */
      didScroll:function () {
        let self=this;
        let div = document.getElementById('message-box');
        if(div.scrollTop == 0 && self.isHaveMore){
          self.pageNo++;
          let data={
            pageNo:self.pageNo,
            userItem:self.userItem,
            isScroll:true
          };
          self.$emit('didScroll', data);
          setTimeout(function () {
            self.isView=false;
          },300)
        }
      },
      // 本人发送信息
      mineSend() {
        let self = this;
        let currentUser = self.$store.state.user;
        currentUser=self.user;
        console.log(self.userItem);
        let time = new Date().getTime();
        let content = self.messageContent;
        if (content !== '' && content !== '\n') {
          if (content.length > 2000) {
            self.openMessage('不能超过2000个字符');
          } else {
            let currentMessage = {
              "communicationType":self.userItem.type,
              "content":content,
              "from":currentUser.userId,
              "fromRealName":currentUser.userName,
              "to":self.userItem.id,
              "date":"",
              "msgId":"",
              "color":"17c295",
              "header":currentUser.headImg
            };
            let listMessage={
              "pubTime": time,
              "receiveColor": "17c295",
              "receiveHeader": self.userItem.header,
              "receiveRealName": self.userItem.realName,
              "receiveUserId": self.userItem.id,
              "remark1": content,
              "sendColor": "17c295",
              "sendHeader": currentUser.headImg,
              "sendRealName": currentUser.userName,
              "sendUserId": currentUser.userId
            };
            console.log(self.messageList);
            self.send(currentMessage,listMessage);
          }
        }
      },
      // 发送消息的基础方法
      send(message,listMessage) {
        let self = this;
        let newListMessage=listMessage;
        let currentUser = self.$store.state.user;
        let newList={};
        newListMessage.pubTime=self.formatDateTime(new Date(newListMessage.pubTime));
        self.$store.commit('sendMessage', message);
        self.messageContent = '';
      /*  self.$store.commit('addMessage', newList);*/
       /* let websocket=self.$store.state.websocket;
        websocket.send(JSON.stringify(message));

        websocket.onmessage = function (evt) {
          console.log(evt)
          let data=JSON.parse(evt.data);
          console.log(data);
          newList={
            "pubTime": data.data.date ,
            "receiveColor": "17c295",
            "receiveUserId": data.data.to,
            "remark1": data.data.content,
            "sendColor": "17c295",
            "sendHeader": data.data.header,
            "sendRealName": data.data.fromRealName,
            "sendUserId": data.data.from
          };
          console.log(newList);
          newListMessage.pubTime=data.data.date || newListMessage.pubTime;
          if(self.userItem.id == data.data.to || currentUser.userId  == data.data.from){
            self.$store.commit('addMessage', newList);
          }

          // 每次滚动到最底部
          self.$nextTick(() => {
            imageLoad('message-box');
          });

          self.messageContent = '';
        };*/
        // 每次滚动到最底部
        self.$nextTick(() => {
          imageLoad('message-box');
        });
      },
    },
    component: {
      //someComponent
    },
    computed: {
      messageList: {
        get: function() {
          console.log(this.$store.state.messageList);
          return this.$store.state.messageList;
        },
        set: function(messageList) {
          console.log(messageList);
          this.$store.commit('setMessageList', messageList);
        }
      }
    },
    watch: {

      // 监听每次 user 的变化
      chat: function(val) {
        /*let self = this;
        self.messageList = [];
        // 从内存中取聊天信息
        let cacheMessages = self.$store.state.messageListMap.get(self.chat.id);
        if (cacheMessages.list) {
          self.messageList = cacheMessages.list;
        }*/
        // 每次滚动到最底部
        /*this.$nextTick(() => {
          imageLoad('message-box');
        });*/
        /*if (self.chat.type === '1') {
          let param = new FormData();
          param.set('chatId', self.chat.id);
          fetchPost(
            conf.getChatUsersUrl(),
            param,
            function(json) {
              self.userList = json;
            },
            self
          );
        }*/
      }
    },
    mounted: function() {
      // 每次滚动到最底部
      this.$nextTick(() => {
        imageLoad('message-box');
      });
    }
  }
</script>

<style lang="scss" scoped>
    .demo-spin-icon-load{
        animation: ani-demo-spin 1s linear infinite;
    }
    @keyframes ani-demo-spin {
        from { transform: rotate(0deg);}
        50%  { transform: rotate(180deg);}
        to   { transform: rotate(360deg);}
    }
    .chat-message{
        height: 100%;
    }
    .chat-title{
        padding: 30px 30px 20px 30px;
        display: flex;
        justify-content: space-between;
        font-size: 20px;
        border-bottom: 1px solid #e7e7e7;
        color: #000;
    }
    .chat-content{
        /*padding: 0 30px;*/
        height: calc(100% - 81px);
        .chat-records{
            padding: 0 30px;
            width: 100%;
            height: 75%;
            background-color: #f5f5f5;
            overflow-y: auto;
            overflow-x: hidden;
            .view-more{
                padding: 10px 0;
                text-align: center;
                color: #54a0ff;
            }
            .chat-records-li{
                position: relative;
                padding-left: 60px;
                margin-bottom: 15px;
                min-height: 68px;
                font-size: 0;
                .chat-user{
                    position: absolute;
                    top:0;
                    left: 0;
                    vertical-align: top;
                    >div{
                        width: 40px;
                        height: 40px;
                        line-height: 40px;
                        background-color: #3498db;
                        color: #fff;
                        border-radius: 50%;
                        text-align: center;
                        font-size: 14px;
                    }
                    img{
                        width: 40px;
                        height: 40px;
                        border-radius: 8px;
                    }
                    cite {
                        position: absolute;
                        left: 60px;
                        top: -2px;
                        width: 500px;
                        line-height: 24px;
                        font-size: 12px;
                        white-space: nowrap;
                        color: #999;
                        text-align: left;
                        font-style: normal;
                        i {
                            font-style: normal;
                            padding-left: 15px;
                        }
                    }
                }
                .chat-text{
                    position: relative;
                    line-height: 22px;
                    margin-top: 25px;
                    padding: 8px 10px;
                    max-width: 60%;
                    background-color: #fff;
                    border-radius: 3px;
                    color: #333;
                    word-break: break-all;
                    display: inline-block;
                    vertical-align: top;
                    font-size: 14px;
                    &:after {
                         content: '';
                         position: absolute;
                         left: -10px;
                         top: 13px;
                         width: 0;
                         height: 0;
                         border-style: solid dashed dashed;
                         border-color: #fff transparent transparent;
                         overflow: hidden;
                         border-width: 10px;
                     }
                    pre {
                        width: 100%;
                        white-space: pre-wrap;
                        word-break: break-all;
                    }
                }
                .chat-text:hover{
                    background-color: #fdfdfd;
                    &:after{
                         border-color: #fdfdfd transparent transparent;
                     }
                }
            }
            .chat-mine{
                padding-left: 0;
                padding-right: 60px;
                text-align: right;
                .chat-user{
                    right: 0;
                    left: auto;
                    cite{
                        right: 60px;
                        left: auto;
                        text-align: right;
                        i{
                            padding-right: 15px;
                            padding-left: 0;
                        }
                    }
                }
                .chat-text{
                    background-color: #b3d675;
                    &:after{
                        left: auto;
                        right: -10px;
                         border-color: #b3d675 transparent transparent;
                     }
                }
                .chat-text:hover{
                    background-color: #add070;
                    &:after{
                         border-color: #add070 transparent transparent;
                     }
                }
            }
        }
        .chat-tool{
            padding: 0 30px;
            width: 100%;
            height: 25%;
            background-color: #fff;
            >div{
                width: 100%;
            }
            .chat-tool-title{
                color: #5e5e5e;
                font-size: 24px;
            }
            .chat-tool-textarea{
                height: 61.5px;
                textarea{
                    width: 100%;
                    height: 100%;
                    line-height: 20px;
                    font-size: 14px;
                    outline:none;
                    border:0 none;
                    resize: none;
                }
            }
            .chat-tool-send{
                margin: 8px 0;
                float: right;
                width: 70px;
                height: 26px;
                line-height: 26px;
                text-align: center;
                font-size: 14px;
                color: #606060;
                background-color: #f5f5f5;
                border: 1px solid #e5e5e5;
                cursor: pointer;
            }
        }
    }
</style>