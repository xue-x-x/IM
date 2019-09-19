<template>
    <div class="user-box">
        <div class="user-box-list">
            <Search :isGroup="isGroup" :list="groupList" @showSearch="showSearch" @searchUser="searchUser"></Search>
            <div class="group-box" v-if="!showSearchDiv">
                <ul class="group-list">
                    <li class="group-list-li" :class="{'activeClass': activeClass == index}" v-for="(item,index) in groupList" :key="index" @click="userClick(index,item)">
                        <div class="li-img">
                            <img v-if="item.logo" :src="url+item.logo" alt="">
                            <div v-else=""><Icon type="ios-people" /></div>
                        </div>
                        <div>{{item.name}}</div>
                    </li>
                </ul>
            </div>
            <div class="group-box" v-else="">
                <ul class="group-list" v-if="searchUserList">
                    <li class="group-list-li" v-for="(item,index) in searchUserList" :key="index">
                        <div class="li-img">
                            <img v-if="item.header" :src="url+item.header" alt="">
                            <div v-else=""><Icon type="ios-people" /></div>
                        </div>
                        <div>{{item.name}}</div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="chat-box">
            <Top></Top>
            <Welcome-group :user="user" :groupInfo="groupInfo" :isClick="isClick"></Welcome-group>
            <!--<Welcome :user="user" :userFriend="userFriend" :isClick="isClick"></Welcome>-->
        </div>
    </div>
    <!--<someComponent></someComponent>-->
</template>

<script>
  import Search from '../components/search.vue';
  import Top from '../components/top.vue';
  import WelcomeGroup from '../components/welcomeGroup.vue';
  import conf from '../conf'
  export default {
    name: "",
    components: {
      Search,
      Top,
      WelcomeGroup
    },
    data() {
      return {
        url:conf.url,
        user:{},
        groupList:[],
        groupInfo:{},
        isClick:false,

        showSearchDiv:false,
        activeClass:Number,
        searchUserList:[],
        isGroup:true
      }
    },
    methods: {
      /* 获取群列表 */
      getMyGroups:function (userId) {
        let self=this;
        console.log(userId);
        let formData = new FormData();
        // 请求参数 ('key',value)
        formData.set('userId', userId);
        fetch(conf.getMyGroupsUrl(), {
          method: 'POST',
          model: 'cros', //跨域
          headers: {
            Accept: 'application/json'
          },
          body: formData
        })
          .then(response => response.json())
          .then(json => {
            console.log(json.groups);
            self.$store.commit('setChatGroupList', json.groups);
            self.groupList=json.groups;
            console.log(self.groupList);
          })
          .catch((error) => {
            console.log(error)
          });
      },
      /* 搜索切换 */
      showSearch:function (n) {
        this.showSearchDiv=n;
      },
      /* 点击群 */
      userClick:function (index,n) {
        let self=this;
        self.activeClass=index;
        self.getPersonCardInfo(n);
      },
      /* 获取群信息 */
      getPersonCardInfo:function (n) {
        let self=this;
        let formData = new FormData();
        let groupItem=n;
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
            console.log(json);
            let data=Object.assign(json,groupItem);
            self.groupInfo=data;
            self.isClick=true;
            console.log(data);
          })
          .catch((error) => {
            console.log(error)
          });
      },
      searchUser:function (n) {
        this.searchUserList=n
      }
    },
    created: function() {
      let self=this;
      self.user = self.$store.state.user.userId ? self.$store.state.user :JSON.parse(sessionStorage.getItem("user"));
      self.getMyGroups(self.user.userId);
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