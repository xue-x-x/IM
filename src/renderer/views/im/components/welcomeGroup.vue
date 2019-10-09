<template>
    <div class="group-message">
        <div v-if="isClick">
        <!--<div>-->
            <div class="group-name">
                <div>{{groupInfo.imGroupName}}（{{groupInfo.imGrouperNum}}）</div>
            </div>
            <div class="group-people-list">
                <ul class="list-ul">
                    <li class="list-li" v-for="(item,index) in groupInfo.groupPeopleList">
                        <div class="li-header">
                            <img v-if="item.header" :src="url+item.header" alt="">
                            <div v-else="">{{item.realName.slice(-2)}}</div>
                        </div>
                        <div class="list-li-name">{{item.realName}}</div>
                    </li>
                    <!--<li class="list-li">
                        <div>
                            <img src="../../../assets/1.jpg" alt="">
                        </div>
                        <div class="list-li-name">名字</div>
                    </li>-->
                </ul>
            </div>
            <div  class="group-button">
                <a class="button-a" href="javascript:;" @click="showChat">发消息</a>
            </div>
        </div>
    </div>
</template>
<script>
  import conf from '../conf';
  const { Chat, ChatListUtils } = require('../utils/chatUtils.js');
export default {
  name: 'welcome',
  props:{
    user:Object,
    groupInfo:Object,
    isClick:Boolean
  },
  data() {
    return {
      url:conf.url,
      name:'',
      isChange:false
    };
  },
  methods: {
    // 打开一个聊天对话框
    showChat: function() {
      let self = this;
      let user=self.groupInfo;
      console.log(user);
      let chatList = ChatListUtils.getChatList(self.$store.state.user.id);
      // 删除当前用户已经有的会话
      let newChatList = chatList.filter(function(element) {
        return String(element.id) !== String(user.imGroupId);
      });
      // 重新添加会话，放到第一个
      let chat = new Chat(user.imGroupId, user.imGroupName, '', self.user.userName, user.imGroupLogo, 'group', true);
      newChatList.unshift(chat);
      newChatList.map(function (item) {
        item.pitchOn=false;
      });
      newChatList[0].pitchOn=true;
      console.log(newChatList);
      // 存储到localStorage 的 chatList
      ChatListUtils.setChatList(self.$store.state.user.id, chatList);
      self.$store.commit('setChatList', newChatList);
      self.$router.push({
        path: '/index/chatBox',
        query: { chat: chat }
      });
    }
  },
  mounted: function() {

  }
};
</script>

<style scoped lang="scss">
@import '../../../styles/theme';
.group-message {
    .group-name{
        padding: 30px 30px 20px 30px;
        font-size: 20px;
        border-bottom: 1px solid #e7e7e7;
        color: #000;
    }
    .group-people-list{
        width: 100%;
        height: 436px;
        .list-ul{
            padding: 20px 70px 0 70px;
            width: 100%;
            height: 100%;
            overflow: auto;
            .list-li{
                padding:5px;
                margin-right: 15px;
                display: inline-block;
                width: 60px;
                cursor: pointer;
                .li-header{
                    img{
                        width: 100%;
                        height: 50px;
                        border-radius: 5px;
                    }
                    div{
                        width: 50px;
                        height: 50px;
                        line-height: 55px;
                        background-color: #3498db;
                        color: #fff;
                        border-radius: 50%;
                        text-align: center;
                        font-size: 14px;
                    }
                }
                .list-li-name{
                    text-align: center;
                    line-height: 30px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
            .list-li:nth-of-type(5n+0){
                margin: 0;
            }
            .list-li:hover{
                background-color: rgba(0,0,0,0.1);
            }
        }
    }
    .group-button{
        padding: 40px 0;
        .button-a{
            margin: 0 auto;
            display: block;
            width: 120px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            color: #fff;
            background-color: #2ecc71;
            border-radius: 5px;
            font-size: 14px;
        }
    }

}
</style>
