<template>
    <div class="login">
        <Top></Top>
        <div class="login-panel">
            <div>
                <div class="title">{{app_name}} 登录</div>
                <div class="item">
                    <label>手机：</label>
                    <Input prefix="ios-contact-outline" v-model="username" placeholder="手机" class="item-input"/>
                </div>
                <div class="item">
                    <label>密码：</label>
                    <Input prefix="ios-lock-outline" type="password" v-model="password" placeholder="密码"
                           class="item-input"/>
                </div>
                <div class="btn item">
                    <Button type="success" @click="login()">登录</Button>
                </div>
            </div>
        </div>
        <vue-particles color="#dedede" :particlesNumber="50" class="bg-login"></vue-particles>
    </div>
    <!--<someComponent></someComponent>-->
</template>

<script>
  import Top from './im/components/top.vue';
  import conf from './im/conf';
  import { timeoutFetch, fetchPost, tokenFetch, flushToken, ErrorType, logout } from './im/utils/chatUtils';
  import HttpApiUtils from './im/utils/HttpApiUtils';
  import WebsocketHeartbeatJs from './im/utils/WebsocketHeartbeatJs.js';
  export default {
    name: "",
    components: {
      Top
    },
    data() {
      return {
        app_name: conf.app_name,
        username:'',
        password:'',
        user:{}
      }
    },
    methods: {
      //登录
      login:function () {
        let self = this;
        let param = new FormData();
        param.set('userName', self.username.trim());
        param.set('password', self.password.trim());
        let hp = new HttpApiUtils();
        hp.login(param)
        //存储用户数据
          .then(response => {
            console.log(response);
            if (response.code === '0') {
              self.getPersonalDetails(response);
            } else if (response.status === -2) {
              return new Promise((resolve, reject) => {
                reject(ErrorType.TOKEN_ERROR);
              });
            } else {
              return new Promise((resolve, reject) => {
                reject(ErrorType.SERVER_ERROR);
              });
            }
          })
          .catch(error => {
            console.log(error);
            if ('TypeError: Failed to fetch' === error.toLocaleString()){
              self.$Message.warning("服务器未响应");
            }else if (ErrorType.TOKEN_ERROR === error || ErrorType.PARAM_ERROR === error || ErrorType.SERVER_ERROR === error){
              self.$Message.warning("用户名或密码不对");
            } else{
              self.$Message.warning(error);
            }
          });
      },
      //获取个人信息
      getPersonalDetails:function (n) {
        let self=this;
        let userItem=n;
        let formData = new FormData();
        formData.set('userId', userItem.userId);
        formData.set('otherId', userItem.userId);

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
            self.$store.commit('setUser', data);
            self.user=data;
            self.$router.push({
              path: '/index/chatBox',
              params: {}
            });
          })
          .catch((error) => {
            console.log(error)
          });
      },
    },

  }
</script>

<style lang="scss" scoped>
    @import './../styles/theme.scss';
    .login{
        height: 100%;
        background: url('../assets/bg.png') no-repeat;
        background-size: 100% 100%;
        position: relative;
        overflow: hidden;
    .bg-login {
        height: 100%;
        position: absolute;
        top: 0;
        width: 100%;
        z-index: 1;
    }
    .login-panel{
        width: 300px;
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 20px 30px 60px 30px;
        position: absolute;
        right: 10%;
        top: 25%;
        z-index: 2;
    .title {
        color: $color-default;
        font-size: 20px;
        font-weight: bold;
        text-align: center;
    }
    .item {
        margin-top: 30px;
        display: flex;
    label {
        text-align: right;
        display: inline-block;
        line-height: 32px;
    }
    .item-input {
        width: auto !important;
    }
    .ivu-input-prefix, .ivu-input-suffix{
        left: 60px;
    }
    }
    .btn {
        text-align: center;
    button {
        width: 96%;
    }
    }
    }
    }
</style>