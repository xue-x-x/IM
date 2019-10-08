<template>
    <div>
        <Modal v-model="model"
               width="520"
               @on-ok="okModal"
               @on-cancel="cancelModal">
            <div class="member-box">
                <div class="left">
                    <CheckboxGroup v-model="leftCheckAll" @on-change="checkChang">
                        <div>
                            <div class="member-title">好友</div>
                            <ul>
                                <li class="member-li" v-for="(item,index) in userFriendList" :key="index">
                                    <Checkbox :label="item.friendId" :disabled="item.isHave">
                                        <div class="member-header">
                                            <img v-if="item.header" :src="url+item.header" alt="">
                                            <div v-else>{{item.remark && item.remark.slice(-2) || item.friendName && item.friendName.slice(-2)}}</div>
                                        </div>
                                        <div class="member-name">{{item.remark || item.friendName}}{{item.isHave}}</div>
                                    </Checkbox>
                                </li>
                            </ul>
                        </div>
                        <Menu active-name="1-2" :open-names="[]"  @on-open-change="openChang">
                            <Submenu :name="index"  v-for="(item,index) in departmentList" :key="index">
                                <template slot="title">
                                    {{item.deptName}}
                                </template>
                                <MenuItem :name="index +'-'+ index1" v-for="(item1,index1) in item.users" :key="index1">
                                    <Checkbox :label="item1.userId" :disabled="item1.isHave">
                                        <div class="member-header">
                                            <img v-if="item1.header" :src="url+item1.header" alt="">
                                            <div v-else>{{item1.bzName && item1.bzName.slice(-2) || item1.realName && item1.realName.slice(-2)}}</div>
                                        </div>
                                        <!--<div class="member-name">{{item1.isHave}}</div>-->
                                        <div class="member-name">{{item1.bzName || item1.realName}}</div>
                                    </Checkbox>
                                </MenuItem>
                            </Submenu>
                        </Menu>
                    </CheckboxGroup>
                </div>
                <div class="right">
                    <div>
                        <div class="member-title">已选择（{{rightCheckAll.length}}）</div>
                        <ul>
                            <li class="member-li" v-for="(item,index) in rightCheckAll" :key="index">
                                <div class="member-header">
                                    <img v-if="item.header" :src="url+item.header" alt="">
                                    <div v-else-if="item.friendName">{{item.remark && item.remark.slice(-2) || item.friendName && item.friendName.slice(-2)}}</div>
                                    <div v-else-if="item.realName">{{item.bzName && item.bzName.slice(-2) || item.realName && item.realName.slice(-2)}}</div>
                                </div>
                                <div v-if="item.friendName" class="member-name">{{item.remark || item.friendName}}</div>
                                <div v-else-if="item.realName" class="member-name">{{item.bzName || item.realName}}</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

        </Modal>
    </div>
    <!--<someComponent></someComponent>-->
</template>

<script>
  //import someComponent from './someComponent'
  import conf from '../conf'
  export default {
    name: "",
    props:{
      group:Object,
      groupPeopleIdList:Array,
      isModel:Boolean
    },
    data() {
      return {
        url:conf.url,
        model:this.isModel,
        modal_loading:false,
        leftCheckAll:[],
        rightCheckAll:[],
        userFriendList:[],
        departmentList:[],
        users:[],
        changLength:0,
        perIdStrArr:[],
        perIdStr:'',
        isHaveGroup:false
      }
    },
    methods: {
      //确定按钮
      okModal:function () {
        let self=this;
        self.$emit('addGroup', false);
        if(!self.perIdStr) return false;
        console.log(self.user.userId);
        console.log(self.group.id);
        console.log(self.perIdStr);
        let formData = new FormData();
        // 请求参数 ('key',value)
        formData.set('userId', self.user.userId);
        formData.set('groupId', self.group.id);
        formData.set('deptIdStr', '');
        formData.set('perIdStr', self.perIdStr);
        fetch(conf.getAddPersonToGroupUrl(), {
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
              self.$parent.$parent.getGroupInfo(self.group);
            }
          })
          .catch((error) => {
            console.log(error)
          });

      },
      //取消按钮
      cancelModal:function () {
        this.leftCheckAll=[];
        this.rightCheckAll=[];
        this.$emit('addGroup', false);
      },
      openChang:function (event) {
        let self=this;
        self.changLength=event.length;
      },
      checkChang:function () {
        let self=this;
        self.perIdStr=self.leftCheckAll.join(',');
        self.rightCheckAll=[];
        self.leftCheckAll.map(function (item,index) {
          self.userFriendList.map(function (item1,index1){
            if(item == item1.friendId){
              self.rightCheckAll[index]=item1;
            }
          });
          self.users.map(function (item2){
            item2.map(function (item2_1){
              if(item == item2_1.userId){
                self.rightCheckAll[index]=item2_1;
              }
            });
          });
        });
      },
      /* 获取好友列表 */
      getMyFriends:function () {
        let self=this;
        let formData = new FormData();
        // 请求参数 ('key',value)
        formData.set('userId', self.user.userId);
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
            let friends=json.friends;
            self.$store.commit('setUserFriendList', json.friends);
            self.userFriendList=json.friends;
            self.inTheGroup();
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
            self.users.push(users);
            self.groupPeopleIdList=self.group.groupPeopleIdList;
            users.map(function (item,index) {
              self.groupPeopleIdList.map(function (item1,index2) {
                if(item.userId == item1){
                  self.$set(users[index],'isHave',true);
                }
              });
            });
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
      /* 添加群成员 */
      addPersonToGroup:function () {
        let self=this;
        console.log(self.perIdStr);
        let formData = new FormData();
        // 请求参数 ('key',value)
        formData.set('userId', self.user.userId);
        formData.set('groupId', orgId);
        formData.set('deptIdStr', '');
        formData.set('perIdStr', self.perIdStr);

        fetch(conf.getAddPersonToGroupUrl(), {
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
      /* 判断是否在群里 */
        inTheGroup:function () {
          let self=this;
          let userFriendList=self.userFriendList;
          userFriendList.map(function (item,index) {
            self.groupPeopleIdList.map(function (item1,index2) {
              if(item.friendId == item1){
                self.$set(userFriendList[index],'isHave',true);
              }
            });
          });
          self.userFriendList=userFriendList;
          console.log(self.userFriendList);
        }
    },
    watch:{
      /*groupPeopleIdList(newVal,oldVal){
        console.log(newVal);
        this.isHaveGroup=true;
        this.inTheGroup();
      }*/
    },
    created: function() {
      let self=this;
      self.user = self.$store.state.user.userId ? self.$store.state.user :JSON.parse(sessionStorage.getItem("user"));
      self.getMyFriends();
      self.getFindOrgByPid(1);
      console.log(this.group);
    },
  }
</script>

<style lang="scss" scoped>
    .member-title{
        padding: 10px 0;
        border-bottom: 1px solid #e8e8e8;
    }
    .member-li{
        padding: 10px;
    }
    .member-box{
        padding-top: 20px;
        width: 100%;
        display: flex;
        >div{
            padding: 5px;
            height: 400px;
            overflow-y: auto;
            border-left: 1px solid #ccc;

        }
        >div:first-child{
            border: none;
        }
    }
    .member-header{
        margin: 0 5px;
        display: inline-block;
        width: 45px;
        height: 45px;
        line-height: 45px;
        img{
            width: 100%;
            height: 100%;
            border-radius: 3px;
            vertical-align:middle;
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
    .member-name{
        display: inline-block;
        font-size: 16px;
        max-width: 120px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align:middle;

    }
    .ivu-menu-vertical.ivu-menu-light:after{
        display: none !important;
    }
</style>