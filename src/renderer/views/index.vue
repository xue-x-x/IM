<template>
    <div class="v-im">
        <div class="left-bar" style="-webkit-app-region: drag">
            <ul>
                <li class="userPhoto" @click="modal = true">
                    <img v-if="user.headImg" :src="url+user.headImg"/>
                    <div v-else="">{{user.userName.slice(-2)}}</div>
                </li>
                <li>
                    <router-link v-bind:to="'/index/chatBox'">
                        <Icon type="ios-text-outline"/>
                    </router-link>
                </li>
                <li>
                    <router-link v-bind:to="'/index/userBox'">
                        <Icon type="ios-contact-outline"/>
                    </router-link>
                </li>
                <li>
                    <router-link v-bind:to="'/index/chatGroupBox'">
                        <Icon type="ios-contacts-outline"/>
                    </router-link>
                </li>
            </ul>
        </div>
        <keep-alive>
            <router-view class="content"/>
        </keep-alive>
        <Modal closable class="user-model" v-model="modal"
               footer-hide :title="user.name" width="300">
            <div class="user-model-img">
                <img :src="url+user.headImg" class="img"/>
                <p>{{user.userName}}</p>
            </div>
            <div class="user-model-item">
                <p class="model-item-name">手 机</p>
                <p>{{user.phone}}</p>
            </div>
            <div class="user-model-item">
                <p class="model-item-name">邮 箱</p>
                <p>{{user.phone}}</p>
            </div>
            <div class="user-model-button">
                <Button type="error" long @click="myLogout">退出</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
import { fetchPost, logout } from './im/utils/chatUtils';
import conf from './im/conf';
import WebsocketHeartbeatJs from './im/utils/WebsocketHeartbeatJs.js';
export default {
  data() {
    return {
      user: {},
      url:conf.url,
      modal: false
    };
  },
  methods: {
    myLogout() {
      let self = this;
      logout(self);

    },
    getMyFriends:function (userId) {
      let self=this;
      console.log(userId);
      let formData = new FormData();
      // 请求参数 ('key',value)
      formData.set('userId', userId);
      fetch(conf.getMyFriendsUrl(), {
        method: 'POST',
        model: 'cros', //跨域
        headers: {
          Accept: 'application/json'
        },
        body: formData
      })
        .then(response => response.json())
        .then(json => {
          self.$store.commit('setUserFriendList', json.friends);
        })
        .catch((error) => {
          console.log(error)
        });
    }
  },
  created: function() {
    let self=this;
    self.user = self.$store.state.user.userId ? self.$store.state.user :JSON.parse(sessionStorage.getItem("user"));
    self.getMyFriends(self.user.userId);
  },
  mounted: function() {
    /*let self = this;
    let websocketHeartbeatJs = new WebsocketHeartbeatJs({
      url: conf.getWsUrl()
    });
    self.$store.commit('setWebsocket', websocketHeartbeatJs);*/
  }
};
</script>
<style lang="scss">
@import './../styles/theme.scss';
@import './../styles/v-im.scss';

.v-im {
  display: flex;
  flex-direction: row;
  .left-bar {
    background-color: #28292d;
    /*width: 6rem;*/
    height: 100%;
    ul {
      margin: 20px 15px 15px 15px;
      list-style: none;
      li {
        -webkit-app-region: no-drag;
        display: block;
        width: 38px;
        height: 38px;
        text-align: center;
        margin-bottom: 20px;
        cursor: pointer;
        .ivu-icon {
          font-size: 30px !important;
          color: $color-default;
          margin: 3px;
          cursor: pointer;
          &:hover {
            color: $color-write;
          }
        }
        .router-link-active {
          .ivu-icon {
            color: $color-write;
          }
        }
      }
      .userPhoto {
        margin-bottom: 20px;
        img {
            width: 100%;
            height: 100%;
            border-radius: 3px;
        }
        >div{
            width: 100%;
            height: 100%;
            line-height: 36px;
            background-color: #3498db;
            color: #fff;
            border-radius: 50%;
            text-align: center;
        }
      }
    }
  }
  .content {
    flex: 1;
  }
}
.ivu-modal-body {
    .user-model-img{
        margin: 0 auto;
        text-align: center;
        p{
            padding: 10px 0;
            color: #1A1A1A;
            font-size:16px;
            font-weight:500;
        }
        img{
            width: 80px;
            height: 80px;
            border-radius: 50%;
        }
    }
    .user-model-item{
        padding: 10px 0;
        background-color: #F9F9F9;
        text-align: center;
        color: #333;
        .model-item-name{
            color: #999;
        }
    }
    .user-model-item:nth-of-type(2){
        padding: 10px 0 0 0;
    }

    .user-model-button{
        margin: 20px auto 0 auto;
        text-align: center;
        .ivu-btn-error{
            width: 80px;
            height: 32px;
            background-color: #fff;
            border-radius: 3px;
            border:1px solid #E43A3A;
            color: #E43A3A;

        }
    }


}

</style>
