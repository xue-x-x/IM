<template>
    <div>
        <Modal v-model="model"
               width="535"
               :loading="loading"
               :mask-closable="false"
               @on-ok="okModal"
               @on-cancel="cancelModal">
            <div class="member-box">
                <div class="left">
                    <CheckboxGroup v-model="leftCheckAll" @on-change="checkChang">
                        <div>
                            <div class="member-title">好友</div>
                            <ul>
                                <li class="member-li" v-for="(item,index) in userFriendList" :key="index">
                                    <Checkbox :label="item.friendId">
                                        <div class="member-header">
                                            <img v-if="item.header" :src="url+item.header" alt="">
                                            <div v-else>{{item.remark && item.remark.slice(-2) || item.friendName && item.friendName.slice(-2)}}</div>
                                        </div>
                                        <div class="member-name">{{item.remark || item.friendName}}</div>
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
                                    <Checkbox :label="item1.userId">
                                        <div class="member-header">
                                            <img v-if="item1.header" :src="url+item1.header" alt="">
                                            <div v-else>{{item1.bzName && item1.bzName.slice(-2) || item1.realName && item1.realName.slice(-2)}}</div>
                                        </div>
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
        <Modal  v-model="groupNameModal"
                :autofocus="true"
                :mask-closable="false"
                :loading="loading"
                width="260"
                title="群名称"
                @on-ok="okGroupName"
                @on-cancel="cancelModal">
            <div>
                <input class="model-input" v-model="groupName" type="text" placeholder="请填写群名称">
            </div>
        </Modal>
    </div>
</template>
<script>
  import conf from '../conf'
  const { Chat, ChatListUtils } = require('../utils/chatUtils.js');
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
        isHaveGroup:false,
        groupNameModal:false,
        loading:true,
        groupName:'',
        groupInfo:{}
      }
    },
    methods: {
      //确定按钮
      okModal:function () {
        let self=this;
        if(self.leftCheckAll.length < 2){
          self.$Message.success('需要添加多名成员');
          self.setLoading(false,1000);
          self.setLoading(true,2000);
          return false
        }
        self.model=false;
        self.groupNameModal=true;
        console.log(self.perIdStr)
      },
      //取消按钮
      cancelModal:function () {
        this.leftCheckAll=[];
        this.rightCheckAll=[];
        this.$emit('addGroup', false);
      },
      //群名称确认按钮
      okGroupName:function () {
        let self=this;
        if(!self.groupName){
          self.$Message.success('群名称不能为空');
          self.setLoading(false,1000);
          self.setLoading(true,2000);
          return false;
        }
        let formData = new FormData();
        // 请求参数 ('key',value)
        formData.set('userId', self.user.userId);
        formData.set('groupName', self.groupName);
        formData.set('deptIdStr', '');
        formData.set('perIdStr', self.perIdStr);
        fetch(conf.getCreateNewGroupUrl(), {
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
              self.$Message.success('创建成功');
              this.$emit('addGroup', false);
              self.groupNameModal=false;
              self.getGroupInfo(json.groupId);
            }
//            self.$parent.$parent.getMyChatLogList();
          })
          .catch((error) => {
            console.log(error)
          });

      },

      //设置loading
      setLoading:function (boolean,time) {
        let self=this;
        setTimeout(function () {
          self.loading=boolean;
          console.log(self.loading);
        },time)
      },
      /* 获取群信息 */
      getGroupInfo:function (n) {
        let self=this;
        let update=false;
        let groupItem=n;
        let formData = new FormData();
        formData.set('userId', self.user.userId);
        formData.set('groupId', n);
        formData.set('time', new Date().getTime());
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
            self.groupInfo=json;
            self.showChat();
          })
          .catch((error) => {
            console.log(error)
          });
      },
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
      aaa:function () {
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
    },

    created: function() {
      let self=this;
      self.user = self.$store.state.user.userId ? self.$store.state.user :JSON.parse(sessionStorage.getItem("user"));
      self.getMyFriends();
      self.getFindOrgByPid(1);
    },
    mounted: function() {
      let self=this;
      let data={
        header:self.user.headImg,
        friendName:self.user.userName
      };
      self.leftCheckAll.push(self.user.userId);
      self.rightCheckAll.push(data);
      self.perIdStr=self.leftCheckAll.join(',');
     console.log(this.user);
    }
  }
</script>

<style lang="scss" scoped>
    .member-title{
        padding: 10px 0;
        border-bottom: 1px solid #e8e8e8;
        font-size: 14px;
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
        width: 251.5px;
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
    .model-input{
        display: block;
        width: 100%;
        height: 30px;
        line-height: 30px;
        border: none;
        font-size: 14px;
    }
</style>