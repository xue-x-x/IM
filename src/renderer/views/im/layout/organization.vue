<template>
    <div class="user-box">
        <div class="user-box-list">
            <Search :isUser="isUser" :list="usersList" @showSearch="showSearch" @searchUser="searchUser"></Search>
            <div class="organization-box" v-if="!showSearchDiv">
                <Menu theme="light">
                    <Submenu :name="index" v-for="(item,index) in  departmentList" :key="index">
                        <template slot="title">
                            <span class="organization-title">{{item.deptName}}</span>
                        </template>
                        <MenuItem class="friend-information" :name="index +'-'+ index1" v-for="(item1,index1) in item.users" :key="index1" @on-select="userClick(item1)">
                            <div class="friend-information-click" @click="userClick(item1)"></div>
                            <div class="friend-img">
                                <img v-if="item1.header" :src="url+item1.header" alt="">
                                <div v-else>{{item1.bzName && item1.bzName.slice(-2) || item1.realName && item1.realName.slice(-2)}}</div>
                            </div>
                            <div class="friend-name">{{item1.bzName || item1.realName}}</div>

                        </MenuItem>
                    </Submenu>
                </Menu>
            </div>
            <div class="organization-box" v-else="">
                <ul class="organization-ul" v-if="searchUserList">
                    <li class="friend-information" :class="{'activeClass': activeClass == index}"  v-for="(item,index) in searchUserList" :key="index"  @click="userClick(item,index)">
                        <div>
                            <div class="friend-img">
                                <img v-if="item.header" :src="url+item.header" alt="">
                                <div v-else="">{{item.realName.slice(-2)}}</div>
                            </div>
                            <div class="friend-name">{{item.bzName || item.realName}}</div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="chat-box">
            <Top></Top>
            <Welcome v-if="isClick" :user="user" :userFriend="userFriend" :isClick="isClick"></Welcome>
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
        isUser:true,
        departmentList:[],
        users:[],
        usersList:[],
        userFriend:[],
        isClick:false,
        showSearchDiv:false,
        searchUserList:[],
      }
    },
    methods: {
      /* 搜索切换 */
      showSearch:function (n) {
        this.showSearchDiv=n;
        this.isClick=false;
      },
      searchUser:function (n) {
        this.searchUserList=n;
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
      /* 查找部门列表 */
      getFindOrgByPid:function (orgId) {
        let self=this;
        let formData = new FormData();
        // 请求参数 ('key',value)
        formData.set('orgId', orgId);
        fetch(conf.getFindOrgByPidUrl(), {
          method: 'POST',
          model: 'cros', //跨域
          headers: {
            Accept: 'application/json'
          },
          body: formData
        })
          .then(response => response.json())
          .then(json => {
            self.departmentList=json;
            self.setMemberList();
          })
          .catch((error) => {
            console.log(error)
          });
      },
      /* 查询部门人员信息 */
      getFindUsersByDeptId:function (orgId,index) {
        let self=this;
        let formData = new FormData();
        // 请求参数 ('key',value)
        formData.set('deptId', orgId);
        formData.set('userId', self.user.userId);
        fetch(conf.getFindUsersByDeptIdUrl(), {
          method: 'POST',
          model: 'cros', //跨域
          headers: {
            Accept: 'application/json'
          },
          body: formData
        })
          .then(response => response.json())
          .then(json => {
            let users=json.users;
            self.usersList.push(...users);
            self.$set(self.departmentList[index],'users',users);
          })
          .catch((error) => {
            console.log(error)
          });
      },
      /* 遍历添加部门人员信息 */
      setMemberList:function () {
        let self=this;
        self.departmentList.map(function (item,index) {
          self.getFindUsersByDeptId(item.deptId,index);
        })
      },
      /* 点击好友 */
      userClick:function (n,index) {
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
            self.userFriend=data;
            self.userFriend['isOrganization']=true;
            self.isClick=true;
            console.log(self.userFriend);
          })
          .catch((error) => {
            console.log(error)
          });
      },
    },
    created: function() {
      let self=this;
      self.user = self.$store.state.user.userId ? self.$store.state.user :JSON.parse(sessionStorage.getItem("user"));
      console.log(self.user);
//      self.getMyFriends(self.user.userId);
      self.getFindOrgByPid(1);
    },
    /*activated: function() {
      let self = this;
      self.getMyFriends(self.user.userId);
      self.showApplyList();
    },*/
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
    .organization-box{
        width: 100%;
        height: calc(100% - 56px);
        overflow-y: auto;
        .ivu-menu-light{
            background: #eae8e7 !important;

        }
    }
    .organization-title{
        display: block;
        margin-left: -11px;
        font-size: 12px;
    }
    .friend-information{
        width: 100%;
        position: relative;
        padding: 10px 10px 10px 60px !important;
        line-height: 40px;
        font-size: 15px;
        cursor: default;
        .friend-information-click{
            position: absolute;
            top:0;
            right: 0;
            bottom: 0;
            left: 0;
            opacity: 0;
            z-index: 2;
        }
        .friend-img{
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
        .friend-name{
            width: 100%;
            @include omit;
        }
    }
    .friend-information:hover{
        background-color: #dbdada;
        color: #333 !important;
        cursor: default;
    }
    .activeClass{
        background-color: #c5c5c5;
    }
    .activeClass:hover{
        background-color: #c5c5c5;
    }
    .ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu) {
        color: #333 !important;
        background: #c5c5c5 !important;
        z-index: 2;
    }
</style>