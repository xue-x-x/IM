<template>
    <div class="welcome-message">
        <div v-if="isClick">
            <div class="welcome-name">
                <div>
                    {{userFriend.friendName || userFriend.realName}}
                    <Icon v-if="userFriend.sex == '女'" class="woman" type="ios-bowtie" />
                    <Icon v-else-if="userFriend.sex == '男'" class="man" type="md-bowtie" />
                </div>
                <div class="welcome-header">
                    <img v-if="userFriend.header" :src="url+userFriend.header" alt="">
                    <div v-else="">{{userFriend.friendName && userFriend.friendName.slice(-2) || userFriend.realName.slice(-2)}}</div>
                    <!--<div>{{userFriend.friendName.slice(-2)}}</div>-->
                </div>
            </div>
            <div class="welcome-introduce">
                <div class="introduce-div" v-if="!userFriend.isOrganization">
                    <span class="introduce-title">备注</span>
                    <span v-if="!isChange" class="introduce-name" @click="bzClick">{{userFriend.remark || '点击添加备注'}}</span>
                    <span v-if="isChange">
                        <input type="text" v-focus v-model="name" autofocus="autofocus" @blur="bzChange">
                    </span>
                </div>
                <div class="introduce-div">
                    <span class="introduce-title">手机号</span>
                    <span>{{userFriend.mobile}}</span>
                </div>
                <div class="introduce-div" v-if="userFriend.deptName">
                    <span class="introduce-title">部门</span>
                    <span>{{userFriend.deptName}}</span>
                </div>
                <div class="introduce-div" v-if="userFriend.modtime">
                    <span class="introduce-title">职位</span>
                    <span>{{userFriend.modtime}}</span>
                </div>
                <div class="introduce-div" v-if="userFriend.orgName">
                    <span class="introduce-title">公司</span>
                    <span>{{userFriend.orgName}}</span>
                </div>
            </div>
            <div  class="welcome-button">
                <a class="button-a" href="javascript:;" @click="showChat">发消息</a>
            </div>
        </div>
    </div>
</template>
<script>
  import conf from '../conf';
  const { ChatListUtils } = require('../utils/chatUtils.js');
export default {
  name: 'welcome',
  props:{
    user:Object,
    userFriend:Object,
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
    /* 修改备注 */
    bzClick:function () {
      let self=this;
      self.name=self.userFriend.remark;
      self.isChange=true;
      console.log(self.userFriend);

    },
    bzChange:function () {
      let self=this;
      let formData = new FormData();
      if(self.name == self.userFriend.remark){
        self.isChange=false;
        return false;
      }
      // 请求参数 ('key',value)
      formData.set('userId', self.user.userId);
      formData.set('id', self.userFriend.friendId);
      formData.set('content', self.name);
      fetch(conf.getBzChangeUrl(), {
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
          if(json.sign){
            self.userFriend.remark=self.name;
            self.isChange=false;
            self.$emit('bzChange', true);
          }
        })
        .catch((error) => {
          console.log(error)
        });
    },
    // 打开一个聊天对话框
    showChat: function() {
      let self = this;
      let user=self.userFriend;
      console.log(self.user);
      user['fromRealName'] = self.user.userName;
//      user['isUserClick'] = true;
      let chat = ChatListUtils.resetChatList(self, user, conf.getHostUrl(), 'p2p');
      self.$router.push({
        path: '/index/chatBox',
        query: { chat: chat }
      });
    }
  },
  directives: {
    focus: {
      // 指令的定义
      inserted: function (el) {
        el.focus()
      }
    }
  },
  mounted: function() {

  }
};
</script>

<style scoped lang="scss">
@import '../../../styles/theme';
.welcome-message {
    padding: 40px 70px;
    .welcome-name{
        padding: 40px 0;
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #e7e7e7;
        font-size: 20px;
        color: #000;
        .woman{
            color: #ff9ff3;
        }
        .man{
            color: #54a0ff;
        }
        .welcome-header{
            img{
                width: 65px;
                height: 65px;
                border-radius: 5px;
            }
            >div{
                width: 55px;
                height: 55px;
                line-height: 55px;
                background-color: #3498db;
                color: #fff;
                border-radius: 50%;
                text-align: center;
                font-size: 14px;
            }
        }

    }
    .welcome-introduce{
        padding: 40px 0;
        border-bottom: 1px solid #e7e7e7;
        .introduce-div{
            position: relative;
            margin-bottom: 20px;
            padding-left: 90px;
            line-height: 30px;
            font-size: 15px;
            color: #000;
            .introduce-title{
                position: absolute;
                left: 0;
                display: inline-block;
                width:55px;
                text-align: justify;
                color: #999;
            }
            .introduce-title:after{
                content:'.';
                width: 100%;
                display: inline-block;
                overflow: hidden;
                height: 0;
            }
            .introduce-name{
                padding: 5px;
                cursor: pointer;
                border:1px solid transparent;
                border-radius: 5px;
            }
            .introduce-name:hover{
                background-color: #eceef0;
                border:1px solid #cbd3dc;
            }
        }
    }
    .welcome-button{
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
