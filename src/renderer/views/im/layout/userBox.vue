<template>
    <div class="user-box">
        <div class="user-box-list">
            <Search :isUser="isUser" :list="userFriendList" @showSearch="showSearch" @searchUser="searchUser"></Search>
            <div class="group-box" v-if="!showSearchDiv">
                <ul class="group-list">
                    <li class="group-list-li" :class="{'activeClass': activeClass == index}" v-for="(item,index) in userFriendList" :key="index" @click="userClick(index,item)">
                        <div class="li-img">
                            <img v-if="item.header" :src="url+item.header" alt="">
                            <div v-else="">{{item.friendName.slice(-2)}}</div>
                        </div>
                        <div>{{item.remark || item.friendName}}</div>
                    </li>
                </ul>
            </div>
            <div class="group-box" v-else="">
                <ul class="group-list" v-if="searchUserList">
                    <li class="group-list-li" v-for="(item,index) in searchUserList" :key="index">
                        <div class="li-img">
                            <img v-if="item.header" :src="url+item.header" alt="">
                            <div v-else="">{{item.friendName.slice(-2)}}</div>
                        </div>
                        <div>{{item.remark || item.friendName}}</div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="chat-box">
            <Top></Top>
            <Welcome :user="user" :userFriend="userFriend" :isClick="isClick" @bzChange="bzChange"></Welcome>
        </div>
    </div>
    <!--<someComponent></someComponent>-->
</template>

<script>
  import Search from '../components/search.vue';
  import Top from '../components/top.vue';
  import Welcome from '../components/welcome.vue';
  import conf from '../conf'
  export default {
    name: "",
    components: {
      Search,
      Top,
      Welcome
    },
    data() {
      return {
        url:conf.url,
        user:{},
        userFriendList:[],
        userFriend:{},
        isClick:false,

        showSearchDiv:false,
        activeClass:Number,
        searchUserList:[],
        isUser:true,
      }
    },
    methods: {
      /* 获取好友列表 */
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
            console.log(json.friends);
            self.$store.commit('setUserFriendList', json.friends);
            self.userFriendList=json.friends;
            console.log(self.userFriendList);
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
        self.activeClass=index;
        self.getPersonCardInfo(n);
      },
      /* 获取个人信息 */
      getPersonCardInfo:function (n) {
        let self=this;
        let formData = new FormData();
        let userItem=n;
        formData.set('userId', self.user.userId);
        formData.set('otherId', userItem.friendId);

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
            self.userFriend=data;
            self.isClick=true;
            console.log(data);
          })
          .catch((error) => {
            console.log(error)
          });
      },
      searchUser:function (n) {
        this.searchUserList=n
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
      bzChange:function (n) {
        this.getMyFriends(this.user.userId);
      },
    },
    created: function() {
      let self=this;
      self.user = self.$store.state.user.userId ? self.$store.state.user :JSON.parse(sessionStorage.getItem("user"));
      self.getMyFriends(self.user.userId);
    },

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