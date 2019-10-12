<template>
    <div class="user-box">
        <div class="user-box-list">
            <Search :isUser="isUser" :list="userFriendList" @showSearch="showSearch" @searchUser="searchUser"></Search>
            <div class="group-box" v-if="!showSearchDiv">
                <div class="addFriendListTitle" @click="showAddFriendList">
                    <p>新的朋友</p>
                    <div class="group-list-li"  :class="{'activeClass': isApplyList}">
                        <div class="li-img">
                            <img src="../../../assets/addFriend.png" alt="">
                        </div>
                        <div class="">新的朋友</div>
                    </div>
                </div>
                <ul class="group-list">
                    <li class="group-list-li" :class="{'activeClass': activeClass == index && !isApplyList}" v-for="(item,index) in userFriendList" :key="index" @click="userClick(index,item)">
                        <div class="li-img">
                            <img v-if="item.header" :src="url+item.header" alt="">
                            <div v-else="">{{item.remark && item.remark.slice(-2) || item.friendName.slice(-2)}}</div>
                            <!--<div v-else="">{{item.remark.slice(-2) || item.friendName.slice(-2)}}</div>-->
                        </div>
                        <div class="li-name">{{item.remark || item.friendName}}</div>
                    </li>
                </ul>
            </div>
            <div class="group-box" v-else="">
                <ul class="group-list" v-if="searchUserList">
                    <li class="group-list-li" :class="{'activeClass': activeClass == index && !isApplyList}" v-for="(item,index) in searchUserList" :key="index" @click="userClick(index,item)">
                        <div class="li-img">
                            <img v-if="item.header" :src="url+item.header" alt="">
                            <div v-else="">{{item.friendName.slice(-2)}}</div>
                        </div>
                        <div class="li-name">{{item.remark || item.friendName}}</div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="chat-box">
            <Top></Top>
            <Welcome v-if="isClick" :user="user" :userFriend="userFriend" :isClick="isClick" @bzChange="bzChange"></Welcome>
            <div class="add-friend-list" v-if="isApplyList">
                <div class="add-friend-list-title">
                    新的朋友
                </div>
                <ul class="add-friend-list-ul">
                    <li class="add-friend-list-li" v-for="(item,index) in applyList" :key="index">
                        <div class="list-li-user-header">
                            <div>{{item.friAppUserRealName.slice(-2)}}</div>
                        </div>
                        <div class="list-li-user-name">
                            <p>{{item.friAppUserRealName}}</p>
                            <p>{{item.friAppUserContent}}</p>
                        </div>
                        <div v-if="item.friAppUserStatus == 0" class="list-li-button">
                            <Button type="success" @click="doFriendApply(item,0)">接受</Button>
                            <Button type="error" @click="doFriendApply(item,1)">拒绝</Button>
                        </div>
                        <div class="list-li-button" v-else-if="item.friAppUserStatus == 1">
                            已添加
                        </div>
                        <div class="list-li-button" v-else-if="item.friAppUserStatus == 2">
                            已拒绝
                        </div>
                    </li>
                    <!--<li class="add-friend-list-li">
                        <div class="list-li-user-header">
                            <img src="../../../assets/1.jpg" alt="">
                        </div>
                        <div class="list-li-user-name">
                            <p>名字</p>
                            <p>备注</p>
                        </div>
                        <div class="list-li-button">
                            <Button type="success">接受</Button>
                            <Button type="error">拒绝</Button>
                        </div>
                    </li>-->
                </ul>
            </div>
        </div>
    </div>
    <!--<someComponent></someComponent>-->
</template>

<script>
  import Search from '../components/search.vue';
  import Top from '../components/top.vue';
  import Welcome from '../components/welcome.vue';
  import conf from '../conf'
  const { ChatListUtils } = require('../utils/chatUtils.js');
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
        isApplyList:false,
        applyList:[],
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
        this.isClick=false;
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
            self.isApplyList=false;
            console.log(data);
            console.log(userItem);
            if(userItem.friAppUserRealName){
                self.showChat();
            }
          })
          .catch((error) => {
            console.log(error)
          });
      },
      searchUser:function (n) {
        this.searchUserList=n
      },
      /* 显示好友申请 */
      showAddFriendList:function () {
        this.isApplyList=true;
        this.isClick=false;
      },
      /*  好友申请列表 */
      showApplyList:function () {
        let self=this;
        let formData = new FormData();
        formData.set('userId', self.user.userId);
        fetch(conf.getShowApplyListUrl(), {
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
            self.applyList=json;
          })
          .catch((error) => {
            console.log(error)
          });
      },
      /* (接受/拒绝)申请好友 */
      doFriendApply:function (item,type) {
        let self=this;
        let data=item;
        data['friendId']=item.friAppUserUserId;
        let formData = new FormData();
        formData.set('id', item.friAppUserId);
        formData.set('type', type);
        fetch(conf.getDoFriendApplyUrl(), {
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
            self.showApplyList();
            if(type == 0){
                self.getPersonCardInfo(data);
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
        user['fromRealName'] = self.user.userName;
        let chat = ChatListUtils.resetChatList(self, user, conf.getHostUrl(), 'p2p');
        self.$router.push({
          path: '/index/chatBox',
          query: { chat: chat }
        });
      },
      //修改备注
      bzChange:function (n) {
        this.getMyFriends(this.user.userId);
      },
    },
    created: function() {
      let self=this;
      self.user = self.$store.state.user.userId ? self.$store.state.user :JSON.parse(sessionStorage.getItem("user"));
      console.log(self.user);
      self.getMyFriends(self.user.userId);
    },
    activated: function() {
      let self = this;
      self.getMyFriends(self.user.userId);
      self.showApplyList();
    },
  }
</script>

<style lang="scss" scoped>
    @import '../../../styles/theme';
    @mixin omit{
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    @mixin top{
        top:50%;
        transform: translate(0,-50%);
    }
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
    .addFriendListTitle{
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #d8d8d8;
        cursor: default;
        p{
            padding: 10px;
            color: #8a8a8a;

        }
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
            font-size: 15px;

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
            .li-name{
                width: 100%;
                @include omit;
            }
        }
        .group-list-li:hover{
            background-color: #dbdada;
            cursor: default;
        }
        .activeClass{
            background-color: #c5c5c5;
        }
        .activeClass:hover{
            background-color: #c5c5c5;
        }
    }
    .add-friend-list{
        padding-top: 30px;
        .add-friend-list-title{
            padding: 0 30px 10px 30px;
            font-size: 18px;
            border-bottom: 1px solid #d8d8d8;
        }
        .add-friend-list-ul{
            padding: 0 70px;
            .add-friend-list-li{
                padding: 10px 120px 10px 60px;
                border-bottom: 1px solid #d8d8d8;
                position: relative;
                /*height:50px;*/
                .list-li-user-header{
                    position: absolute;
                    left: 0;
                    @include top;
                    width: 50px;
                    height: 50px;
                    line-height: 50px;
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
                .list-li-user-name{
                    line-height: 25px;
                    color: #8a8a8a;
                    font-size: 14px;
                    height: 50px;
                    line-height: 25px;
                }
                .list-li-user-name p{
                    width: 100%;
                    @include omit;
                }
                .list-li-user-name p:first-child{
                    color: #333;
                }
                .list-li-button{
                    position: absolute;
                    right: 0;
                    @include top;
                    color: #8a8a8a;
                }
            }
        }
    }
</style>