<template>
    <div class="chat-message">
        <div class="chat-title">
            <div>{{userItem.remark || userItem.realName}} <span v-if="userItem.imGrouperNum">（{{userItem.imGrouperNum}}）</span> </div>
            <div class="ios-more" @click="unfold(userItem)"><Icon type="ios-more" /></div>
        </div>
        <div class="chat-content">
            <div class="chat-records" id="message-box"  @scroll="didScroll">
            <!--<div class="chat-records" id="message-box">-->
                <ul>
                    <li class="view-more" v-if="isHaveMore">
                        <span v-if="isView">查看更多</span>
                        <span v-else>
                           <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                        </span>
                    </li>
                    <li class="chat-records-li" :class="{'chat-mine': item.sendRealName == user.userName}" v-for="(item,index) in messageList" :key="index">
                        <div class="chat-user">
                            <img v-if="item.sendHeader" preview="" :src="url+item.sendHeader" alt="">
                            <div v-else-if="item.sendRealName == user.userName">{{item.sendRealName.slice(-2)}}</div>
                            <div v-else="">{{item.remark && item.remark.slice(-2) || item.sendRealName.slice(-2)}}</div>
                            <cite v-if="item.sendRealName != user.userName">{{item.remark || item.sendRealName}}<i>{{item.pubTime}}</i></cite>
                            <cite v-else=""><i>{{item.pubTime}}</i>{{item.sendRealName}}</cite>
                        </div>
                        <div v-if="!item.remark1.type" class="chat-text">
                            <!--<pre v-html="item.remark1" v-on:click="openImageProxy($event)"></pre>-->
                            <pre v-html="item.remark1"></pre>
                        </div>
                        <div v-else="" class="chat-text">
                            <pre><maudio :src="item.remark1.url" :time="item.remark1.time"></maudio></pre>
                        </div>
                    </li>
                   <!-- <li class="chat-records-li chat-mine">
                        <div class="chat-user">
                            <img src="../../../assets/1.jpg" alt="">
                            <cite><i>2019-09-16 14:59:28</i>管理员</cite>
                        </div>
                        <div class="chat-text">
                            <pre><maudio src="http://58.218.203.29/im/chatImg/1566871441328.mp3"></maudio></pre>
                        </div>
                    </li>-->
                </ul>
            </div>
            <div class="chat-tool">
                <div class="chat-tool-title">
                    <Icon type="ios-happy-outline" @click="showFaceBox()" title="表情"/>
                    <Faces v-show="showFace"  @click="showFace = true" class="insertFace" @insertFace="insertFace"></Faces>
                    <div class="uload">
                        <Upload :action="action" name="files"
                                :format="imgFormat"
                                :show-upload-list="false"
                                :headers="headers"
                                :max-size="5120"
                                :with-credentials="true"
                                :on-progress="handleStart"
                                :on-format-error="handleFormatError"
                                :on-exceeded-size="handleImgMaxSize"
                                :on-success="handleSuccess"
                                :on-error="handleError">
                            <Icon type="ios-image-outline" title="图片"/>
                        </Upload>
                    </div>
                    <div class="uload">
                        <Upload :action="action" name="files"
                                :format="fileFormat"
                                :show-upload-list="false"
                                :headers="headers"
                                :max-size="102400"
                                :with-credentials="true"
                                :on-progress="handleStart"
                                :on-format-error="handleFormatError"
                                :on-exceeded-size="handleFileMaxSize"
                                :on-success="handleSuccess"
                                :on-error="handleError">
                            <Icon type="ios-folder-open-outline"></Icon>
                        </Upload>
                    </div>
                </div>
                <div class="chat-tool-textarea">
                    <!--<textarea v-model="messageContent" @keyup.enter="mineSend()"></textarea>-->
                    <div class="chat-tool-text" v-html="messageContent" contenteditable="true" @click="closeFaceBox" @blur="changeText"></div>
                </div>
                <div class="chat-tool-send" @click="mineSend">发送</div>
            </div>
        </div>
        <Modal
                v-model="modal"
                title="请确认发送"
                width="300"
                :mask-closable="false"
                @on-ok="ok">
            <div class="modal-alert">
                <div>
                    <img src="/static/document.png" alt="">
                </div>
                <div>{{modalName}}</div>
            </div>
        </Modal>
        <div class="chat-drawer">
            <!-- 好友 -->
            <Drawer :closable="true" v-model="p2p" >
                <div class="chat-drawer-title">
                    <div class="chat-drawer-header">
                        <img v-if="userItem.header" :src="url+userItem.header" alt="">
                        <div v-else>{{userItem.remark && userItem.remark.slice(-2) || userItem.realName && userItem.realName.slice(-2)}}</div>
                    </div>
                    <div class="chat-drawer-name">{{userItem.remark || userItem.realName}}</div>
                </div>
                <div class="chat-drawer-switch" v-if="userItem.status == 2">
                    <p>置顶消息</p>
                    <i-switch v-model="roofButoon" @on-change="roofChange" />
                </div>
                <div class="chat-drawer-switch">
                    <p>好友状态</p>
                    <Button v-if="userItem.status == 2" type="error" @click="deleteFriend = true">删除好友</Button>
                    <!--<Button v-else-if="userItem.status == 1" type="warning">已经申请</Button>-->
                    <Button v-else="" type="success"  @click="addFriend = true">添加好友</Button>
                </div>

            </Drawer>
            <!-- 群 -->
            <Drawer :closable="true" v-model="group">
                <div class="chat-drawer-title">
                    <div class="chat-drawer-header">
                        <img v-if="userItem.header" :src="url+userItem.imGroupLogo" alt="">
                        <div v-else>{{userItem.remark && userItem.remark.slice(-2) || userItem.imGroupName && userItem.imGroupName.slice(-2)}}</div>
                    </div>
                    <div class="chat-drawer-name">{{userItem.remark || userItem.imGroupName}}</div>
                </div>
                <div>
                    <ul class="group-members">
                        <li class="members-li" @click="isGroupAdd = true">
                        <!--<li class="members-li" @click="getGroupInfo">-->
                            <div class="addMember">
                                <Icon type="ios-add" />
                            </div>
                            <p class="members-name">添加</p>
                        </li>
                        <li class="members-li" v-if="groupPeopleList" v-for="(item,index) in groupPeopleList" :key="index">
                            <div class="members-header">
                                <img v-if="item.header" :src="url+item.header" alt="">
                                <div v-else="">{{item.remark && item.remark.slice(-2) || item.realName.slice(-2)}}</div>
                            </div>
                            <p class="members-name">{{item.remark || item.realName}}</p>
                        </li>
                    </ul>
                    <div v-if="iosArrowDown" class="ios-arrow" @click="arrowDown">查看更多成员<Icon type="ios-arrow-down" /></div>
                    <div v-if="iosArrowUp" class="ios-arrow" @click="arrowUp">收起群成员<Icon type="ios-arrow-up" /></div>
                </div>
                <div class="chat-drawer-switch">
                    <p>群名</p>
                    <div v-if="!nameClick" @click="groupNameClick">{{userItem.imGroupName}}</div>
                    <div v-else="">
                        <input type="text" v-focus v-model="groupName" autofocus="autofocus"  @blur="groupNameChang">
                    </div>
                </div>
                <div class="chat-drawer-switch">
                    <p>群介绍</p>
                    <div v-if="!desClick" @click="groupDesClick">{{userItem.imGroupDes || '点击编辑群介绍'}}</div>
                    <div v-else="">
                        <textarea v-model="groupDes" class="addFriend-textarea" v-focus autofocus="autofocus"  @blur="groupNameChang"></textarea>
                    </div>
                </div>
                <div class="chat-drawer-switch">
                    <p>置顶消息</p>
                    <i-switch v-model="roofButoon" @on-change="setRoof" />
                </div>
                <div class="chat-drawer-switch">
                    <p>消息免打扰</p>
                    <i-switch v-model="noDisturb" @on-change="setNoDisturb" />
                </div>
                <div v-if="userItem.groupCreater == user.userId" class="chat-drawer-switch chat-drawer-buttons">
                    <Button type="error" @click="delPersonFromGroup">退出群聊</Button>
                    <Button type="success" @click="delGroup">删除群聊</Button>
                </div>
                <div v-else="" class="chat-drawer-switch chat-drawer-buttons">
                    <Button class="noGroupOwner" type="error" @click="delPersonFromGroup">退出群聊</Button>
                </div>
            </Drawer>
        </div>
        <Modal v-model="addFriend" width="360">
            <p slot="header" class="addFriend-header">
                <span>加为好友</span>
            </p>
            <div style="text-align:center">
                <textarea v-model="addFriendTextarea" class="addFriend-textarea" id="" placeholder="请输入验证信息，限制40字"></textarea>
            </div>
            <div slot="footer">
                <Button type="success" size="large" long :loading="modal_loading" @click="sendAddCode">发送验证消息</Button>
            </div>
        </Modal>
        <Modal
                v-model="deleteFriend"
                title="提示"
                width="300"
                :mask-closable="false"
                @on-ok="deleteFriendF">
            <div>
                确定删除吗？
            </div>
        </Modal>
        <addGroupMember v-if="isGroupAdd" :isModel="isGroupAdd" :group="userItem" :groupPeopleIdList="userItem.groupPeopleIdList" @addGroup="addGroup"></addGroupMember>
    </div>
</template>

<script>0
  const { imageLoad, transform, ChatListUtils } = require('../utils/chatUtils');
  import conf from '../conf'
  import Faces from './faces.vue';
  import maudio from './audio.vue';
  import addGroupMember from './addGroupMember.vue';
//  import WebsocketHeartbeatJs from '../utils/WebsocketHeartbeatJs.js';
  export default {
    components: {
      Faces,
      maudio,
      addGroupMember
    },
    name: "",
    props:{
      user:Object,
      userItem:Object,
      isHaveMore:Boolean,
    },
    data() {
      return {
        url:conf.url,
        isView:true,
        pageNo:0,
        messageContent:'',
        caretPosition:Number,
        input:'',
        imgFormat: ['jpg', 'jpeg', 'png', 'gif'],
        fileFormat: ['doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'xls', 'xlsx', 'pdf', 'gif', 'exe', 'msi', 'swf', 'sql', 'apk', 'psd'],
        action: '',
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        //发送文件弹窗
        modal:false,
        modalName:'',
        modalUrl:'',
        //展开好友、群信息
        groupPeopleList:[],
        isGroupAdd:false,
        number:11,
        p2p:false,
        group:false,
        roofButoon:false,
        noDisturb:false,
        iosArrowDown:false,
        iosArrowUp:false,
        //群信息
        groupName:'',
        nameClick:false,
        groupDes:'',
        desClick:false,
        //添加好友
        addFriendTextarea:'',
        addFriend:false,
        deleteFriend:false,
        modal_loading:false,
      }
    },
    methods: {
      changeSwitch:function (status) {
        this.$Message.info('开关状态：' + status);
      },
      //展开好友、群信息
      unfold:function (n) {
        let self=this;
        let userItem= n;
        self.roofButoon=userItem.msgTopTime == 1 ? true : false;
        if(userItem.type == 'p2p'){
          self.p2p=true
        }else {
          self.group=true;
          if(userItem.groupPeopleList.length > self.number){
            self.groupPeopleList=userItem.groupPeopleList.slice(0,self.number);
            self.iosArrowDown=true;
          }else {
            self.groupPeopleList=userItem.groupPeopleList;
          }
        }

      },
      //查看更多群成员
      arrowDown:function () {
        let self=this;
        self.groupPeopleList=self.userItem.groupPeopleList;
        self.iosArrowDown=false;
        self.iosArrowUp=true;
      },
      //收起群成员
      arrowUp:function () {
        let self=this;
        self.groupPeopleList=self.userItem.groupPeopleList.slice(0,self.number);
        self.iosArrowDown=true;
        self.iosArrowUp=false;
      },
      //添加群成员
      addGroup:function (boolean) {
        this.isGroupAdd=boolean;
      },
      //好友消息设置置顶
      roofChange:function (status) {
        let self=this;
        let msgTop=0;
        if(status)msgTop=1;
        let formData = new FormData();
        // 请求参数 ('key',value)
        formData.set('userId', self.user.userId);
        formData.set('otherId', self.userItem.id);
        formData.set('msgTop', msgTop);
        fetch(conf.getMsgTopChangeUrl(), {
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
              if(status)self.$emit('getMyChatLogList',self.user.userId);
              status && self.$Message.success('设置成功') || self.$Message.success('取消成功');
            }
          })
          .catch((error) => {
            console.log(error)
          });
      },
      //群消息设置置顶
      setRoof:function (status) {
        let self=this;
        let msgTop=0;
        if(status)msgTop=1;
        let formData = new FormData();
        // 请求参数 ('key',value)
        formData.set('groupId', self.userItem.id);
        formData.set('msgTop', msgTop);
        fetch(conf.getGroupMsgTopChangeUrl(), {
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
              if(status)self.$emit('getMyChatLogList',self.user.userId)
              status && self.$Message.success('设置成功') || self.$Message.success('取消成功');
            }
          })
          .catch((error) => {
            console.log(error)
          });
      },
      //群设置免打扰
      setNoDisturb:function (status) {
        console.log(status);
        let self=this;
        let msgCall=0;
        if(status)msgCall=1;
        let formData = new FormData();
        // 请求参数 ('key',value)
        formData.set('groupId', self.userItem.id);
        formData.set('msgCall', msgCall);
        fetch(conf.getMsgCallChangeUrl(), {
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
              status && self.$Message.success('设置成功') || self.$Message.success('取消成功');
            }
          })
          .catch((error) => {
            console.log(error)
          });
      },
      //点击群名
      groupNameClick:function () {
        this.groupName=this.userItem.realName;
        this.nameClick=true
      },
      //点击群介绍
      groupDesClick:function () {
        this.desClick=true;
        this.groupDes=this.userItem.imGroupDes
      },
      //修改群名和群介绍
      groupNameChang:function () {
        let self=this;
        if(self.groupName == self.userItem.realName && !self.desClick){
          self.nameClick=false;
          return false;
        }
        if(self.groupDes == self.userItem.imGroupDes && !self.nameClick){
          self.desClick=false;
          return false;
        }
        if(!self.nameClick) self.groupName=this.userItem.realName;
        if(!self.desClick) self.groupDes=this.userItem.imGroupDes;

        console.log(self.groupDes);
        let formData = new FormData();
        // 请求参数 ('key',value)
        formData.set('groupId', self.userItem.id);
        formData.set('name', self.groupName);
        formData.set('des', self.groupDes);
        fetch(conf.getNameAndDesChangeUrl(), {
          method: 'POST',
          model: 'cros', //跨域
          headers: {
            Accept: 'application/json'
          },
          body: formData
        })
          .then(response => response.json())
          .then(json => {
            if(json.sign){
              if(self.nameClick){
                self.userItem.remark=self.groupName;
                self.nameClick=false;
                self.$emit('getMyChatLogList',self.user.userId);
              }else if(self.desClick){
                self.userItem.imGroupDes=self.groupDes;
                self.desClick=false;
              }

            }
          })
          .catch((error) => {
            console.log(error)
          });
      },
      //删除群聊
      delGroup:function () {
        let self=this;
        let formData = new FormData();
        formData.set('groupId', self.userItem.id);
        fetch(conf.getDelGroupUrl(), {
          method: 'POST',
          model: 'cros', //跨域
          headers: {
            Accept: 'application/json'
          },
          body: formData
        })
          .then(response => response.json())
          .then(json => {
            if(json.sign){
              self.$emit('getMyChatLogList',self.user.userId);
            }
          })
          .catch((error) => {
            console.log(error)
          });
      },
      //退出群聊
      delPersonFromGroup:function () {
        let self=this;
        let formData = new FormData();
        formData.set('groupId', self.userItem.id);
        formData.set('perId', self.user.userId);
        fetch(conf.getDelPersonFromGroupUrl(), {
          method: 'POST',
          model: 'cros', //跨域
          headers: {
            Accept: 'application/json'
          },
          body: formData
        })
          .then(response => response.json())
          .then(json => {
            if(json.sign){
              self.$emit('getMyChatLogList',self.user.userId);
            }
          })
          .catch((error) => {
            console.log(error)
          });
      },
      //确认发送文档
      ok:function(){
        let self=this;
        console.log(self.$store.state.user);
        let currentUser = self.user;
        let currentMessage = {
          "communicationType":self.userItem.type,
          "content":'rrtFile?'+self.url+self.modalUrl,
          "from":currentUser.userId,
          "fromRealName":currentUser.userName,
          "to":self.userItem.id,
          "date":"",
          "msgId":"",
          "color":"17c295",
          "header":currentUser.headImg
        };
        let content='rrtFile?'+self.url+self.modalUrl;
        self.send(currentMessage);
      },
      /* 下拉加载更多 */
      didScroll:function () {
        let self=this;
        let div = document.getElementById('message-box');
        if(div.scrollTop == 0 && self.isHaveMore){
          self.pageNo++;
          let data={
            pageNo:self.pageNo,
            userItem:self.userItem,
            isScroll:true
          };
          self.$emit('didScroll', data);
          setTimeout(function () {
            self.isView=false;
          },300)
        }
      },
      //发送内容
      changeText:function (event) {
        var index = this.getCaretPosition(event.target);
        this.caretPosition=index;
        this.input=event.target;
        this.messageContent=event.target.innerHTML;
      },
      //显示表情列表
      showFaceBox:function () {
//        this.showFace = !this.showFace;
        this.showFace = true;
      },
      //关闭表情列表
      closeFaceBox:function () {
        this.showFace = false;
      },
      //选中表情
      insertFace:function (n) {
        console.log(n);
        let messageContent=this.messageContent;
        let index=this.caretPosition;
        let input=document.querySelectorAll('.chat-tool-text')[0];
        this.setCaretPosition(input,n);
        this.showFace = false;
        /*  this.messageContent=messageContent;
          this.messageContent=messageContent;*/
      },
      //获取光标位置
      getCaretPosition:function (oField) {
        var iCaretPos = 0;
        var doc = oField.ownerDocument || oField.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;
        if (typeof win.getSelection != "undefined") {
          sel = win.getSelection();
          if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(oField);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            iCaretPos = preCaretRange.toString().length;
          }
        } else if ( (sel = doc.selection) && sel.type !== 'Control') {
          var textRange = sel.createRange();
          var preCaretTextRange = doc.body.createTextRange();
          preCaretTextRange.moveToElementText(oField);
          preCaretTextRange.setEndPoint('EndToEnd', textRange);
          iCaretPos = preCaretTextRange.text.length;
        }
        return (iCaretPos);
      },
      //添加表情，设置光标位置
      setCaretPosition:function (ctrl,val) {
        var lastEditRange;
        // 获取编辑框对象
        var edit = ctrl;
        // 获取输入框对象
        var emojiInput = val;
        // 编辑框设置焦点
        edit.focus();
        // 获取选定对象
        var selection = getSelection();
        // 判断是否有最后光标对象存在
        if (lastEditRange) {
          // 存在最后光标对象，选定对象清除所有光标并添加最后光标还原之前的状态
          selection.removeAllRanges();
          selection.addRange(lastEditRange)
        }
        // 判断选定对象范围是编辑框还是文本节点

        if (selection.anchorNode.nodeName != '#text') {
          // 如果是编辑框范围。则创建表情文本节点进行插入
          var emojiText = document.createTextNode(emojiInput)

          if (edit.childNodes.length > 0) {
            // 如果文本框的子元素大于0，则表示有其他元素，则按照位置插入表情节点
            for (var i = 0; i < edit.childNodes.length; i++) {
              if (i == selection.anchorOffset) {
                edit.insertBefore(emojiText, edit.childNodes[i])
              }
            }
          } else {
            // 否则直接插入一个表情元素
            edit.appendChild(emojiText)
          }
          // 创建新的光标对象
          var range = document.createRange()
          // 光标对象的范围界定为新建的表情节点
          range.selectNodeContents(emojiText)
          // 光标位置定位在表情节点的最大长度
          range.setStart(emojiText, emojiText.length)
          // 使光标开始和光标结束重叠
          range.collapse(true)
          // 清除选定对象的所有光标对象
          selection.removeAllRanges()
          // 插入新的光标对象
          selection.addRange(range)
        } else {
          // 如果是文本节点则先获取光标对象
          var range = selection.getRangeAt(0)
          // 获取光标对象的范围界定对象，一般就是textNode对象
          var textNode = range.startContainer;
          // 获取光标位置
          var rangeStartOffset = this.caretPosition;
          // 文本节点在光标位置处插入新的表情内容
          textNode.insertData(rangeStartOffset, emojiInput)
          // 光标移动到到原来的位置加上新内容的长度
          range.setStart(textNode, rangeStartOffset + emojiInput.length)
          // 光标开始和光标结束重叠
          range.collapse(true)
          // 清除选定对象的所有光标对象
          selection.removeAllRanges()
          // 插入新的光标对象
          selection.addRange(range)
        }
        // 无论如何都要记录最后光标对象
        lastEditRange = selection.getRangeAt(0)
      },
      //表情转换
      transition:function () {
        var msg1=this.messageContent;
        var emojiPath=this.url+"/im/emoj/";
        var json = '[{"title":"微笑","src":"<img src=\''+emojiPath+'j_0001.gif\'>"},{"title":"憋嘴","src":"<img src=\''+emojiPath+'j_0002.gif\'>"},{"title":"色","src":"<img src=\''+emojiPath+'j_0003.gif\'>"},{"title":"发呆","src":"<img src=\''+emojiPath+'j_0004.gif\'>"},{"title":"得意","src":"<img src=\''+emojiPath+'j_0005.gif\'>"},{"title":"流泪","src":"<img src=\''+emojiPath+'j_0006.gif\'>"},{"title":"害羞","src":"<img src=\''+emojiPath+'j_0007.gif\'>"},{"title":"闭嘴","src":"<img src=\''+emojiPath+'j_0008.gif\'>"},{"title":"睡","src":"<img src=\''+emojiPath+'j_0009.gif\'>"},{"title":"大哭","src":"<img src=\''+emojiPath+'j_0010.gif\'>"},{"title":"尴尬","src":"<img src=\''+emojiPath+'j_0011.gif\'>"},{"title":"发怒","src":"<img src=\''+emojiPath+'j_0012.gif\'>"},{"title":"调皮","src":"<img src=\''+emojiPath+'j_0013.gif\'>"},{"title":"呲牙","src":"<img src=\''+emojiPath+'j_0014.gif\'>"},{"title":"惊讶","src":"<img src=\''+emojiPath+'j_0015.gif\'>"},{"title":"难过","src":"<img src=\''+emojiPath+'j_0016.gif\'>"},{"title":"酷","src":"<img src=\''+emojiPath+'j_0017.gif\'>"},{"title":"冷汗","src":"<img src=\''+emojiPath+'j_0018.gif\'>"},{"title":"抓狂","src":"<img src=\''+emojiPath+'j_0019.gif\'>"},{"title":"吐","src":"<img src=\''+emojiPath+'j_0020.gif\'>"},{"title":"偷笑","src":"<img src=\''+emojiPath+'j_0021.gif\'>"},{"title":"愉快","src":"<img src=\''+emojiPath+'j_0022.gif\'>"},{"title":"白眼","src":"<img src=\''+emojiPath+'j_0023.gif\'>"},{"title":"傲慢","src":"<img src=\''+emojiPath+'j_0024.gif\'>"},{"title":"饥饿","src":"<img src=\''+emojiPath+'j_0025.gif\'>"},{"title":"困","src":"<img src=\''+emojiPath+'j_0026.gif\'>"},{"title":"惊恐","src":"<img src=\''+emojiPath+'j_0027.gif\'>"},{"title":"流汗","src":"<img src=\''+emojiPath+'j_0028.gif\'>"},{"title":"憨笑","src":"<img src=\''+emojiPath+'j_0029.gif\'>"},{"title":"悠闲","src":"<img src=\''+emojiPath+'j_0030.gif\'>"},{"title":"奋斗","src":"<img src=\''+emojiPath+'j_0031.gif\'>"},{"title":"咒骂","src":"<img src=\''+emojiPath+'j_0032.gif\'>"},{"title":"疑问","src":"<img src=\''+emojiPath+'j_0033.gif\'>"},{"title":"嘘","src":"<img src=\''+emojiPath+'j_0034.gif\'>"},{"title":"晕","src":"<img src=\''+emojiPath+'j_0035.gif\'>"},{"title":"疯了","src":"<img src=\''+emojiPath+'j_0036.gif\'>"},{"title":"衰","src":"<img src=\''+emojiPath+'j_0037.gif\'>"},{"title":"骷髅","src":"<img src=\''+emojiPath+'j_0038.gif\'>"},{"title":"敲打","src":"<img src=\''+emojiPath+'j_0039.gif\'>"},{"title":"再见","src":"<img src=\''+emojiPath+'j_0040.gif\'>"},{"title":"擦汗","src":"<img src=\''+emojiPath+'j_0041.gif\'>"},{"title":"抠鼻","src":"<img src=\''+emojiPath+'j_0042.gif\'>"},{"title":"鼓掌","src":"<img src=\''+emojiPath+'j_0043.gif\'>"},{"title":"糗大了","src":"<img src=\''+emojiPath+'j_0044.gif\'>"},{"title":"坏笑","src":"<img src=\''+emojiPath+'j_0045.gif\'>"},{"title":"左哼哼","src":"<img src=\''+emojiPath+'j_0046.gif\'>"},{"title":"右哼哼","src":"<img src=\''+emojiPath+'j_0047.gif\'>"},{"title":"哈欠","src":"<img src=\''+emojiPath+'j_0048.gif\'>"},{"title":"鄙视","src":"<img src=\''+emojiPath+'j_0049.gif\'>"},{"title":"委屈","src":"<img src=\''+emojiPath+'j_0050.gif\'>"},{"title":"快哭了","src":"<img src=\''+emojiPath+'j_0051.gif\'>"},{"title":"阴险","src":"<img src=\''+emojiPath+'j_0052.gif\'>"},{"title":"亲亲","src":"<img src=\''+emojiPath+'j_0053.gif\'>"},{"title":"吓","src":"<img src=\''+emojiPath+'j_0054.gif\'>"},{"title":"可怜","src":"<img src=\''+emojiPath+'j_0055.gif\'>"},{"title":"菜刀","src":"<img src=\''+emojiPath+'j_0056.gif\'>"},{"title":"西瓜","src":"<img src=\''+emojiPath+'j_0057.gif\'>"},{"title":"啤酒","src":"<img src=\''+emojiPath+'j_0058.gif\'>"},{"title":"篮球","src":"<img src=\''+emojiPath+'j_0059.gif\'>"},{"title":"乒乓","src":"<img src=\''+emojiPath+'j_0060.gif\'>"}]';
        json = eval('('+ json +')');
        var src='';
        var pattern1 = /\[[\u4e00-\u9fa5]+\]/g;
        var pattern2 = /\[[\u4e00-\u9fa5]+\]/;
        var content = msg1.match(pattern1);
        if(content!=null){
          for(let i=0;i<content.length;i++){
            for(let j=0;j<json.length;j++){
              if("["+ json[j].title +"]" == content[i]){
                src = json[j].src;
                break;
              }
            }
            msg1 = msg1.replace(pattern2,src);
          }
        }
        //发送到后台时候  注意看下实际 入库格式""：<img src="http://58.218.203.29/im/emoj/j_0010.gif">
        msg1 = msg1.replace(/'/g, '\\\"');
        console.log(msg1);
        return msg1;
      },
      // 错误提示
      openMessage(error) {
        this.$Message.error(error);
      },
      handleStart() {
        this.$Loading.start();
      },
      handleFormatError(file) {
        this.$Message.warning('文件 ' + file.name + ' 格式不正确。');
      },
      handleImgMaxSize(file) {
        this.$Message.warning('图片 ' + file.name + ' 太大，不能超过 512K！');
      },
      handleFileMaxSize(file) {
        this.$Message.warning('文件 ' + file.name + ' 太大，不能超过 10M！');
      },
      handleSuccess(res, file) {
        let self = this;
        console.log(res);
        console.log(file);
        if (res.result == 1) {
          let path = res.attachmentPath;
          let fileName = file.name;
          // 文件后缀
          let suffix = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length);
          // 文件
          console.log(self.imgFormat.indexOf(suffix));
          if (self.imgFormat.indexOf(suffix) === -1) {
            //显示弹窗
            self.modal=true;
            self.modalName=file.name;
            self.modalUrl=path;
          }
          // 图片
          else {
//            this.messageContent = this.messageContent + '<img class="message-img" src="'+self.url+path+'" style="max-width: 160px">';
            this.messageContent = this.messageContent + '<img class="message-img" preview="1" src="'+self.url+path+'" style="max-width: 160px">';
            console.log(this.messageContent);
          }
          this.$Loading.finish();
        } else {
          this.$Message.error('文件上传错误，请重试');
        }
      },
      handleError: function() {
        this.$Loading.finish();
        this.$Message.error('上传错误！');
      },
      // 本人发送信息
      mineSend() {
        let self = this;
        let currentUser = self.user;
        let content = self.messageContent;
        if (content !== '' && content !== '\n') {
          if (content.length > 2000) {
            self.openMessage('不能超过2000个字符');
          } else {
            let currentMessage = {
              "communicationType":self.userItem.type,
              "content":self.transition(),
              "from":currentUser.userId,
              "fromRealName":currentUser.userName,
              "to":self.userItem.id,
              "date":"",
              "msgId":"",
              "color":"17c295",
              "header":currentUser.headImg
            };
            console.log(self.messageList);
            console.log(currentMessage);
            self.send(currentMessage);
          }
        }
      },
      // 发送消息的基础方法
      send(message) {
        let self = this;
        console.log(message);
        let currentUser = self.$store.state.user;
        let newList={};
        self.$store.commit('sendMessage', message);
        self.messageContent = '';
        // 每次滚动到最底部
        self.$nextTick(() => {
          imageLoad('message-box');
        });
      },
      //添加好友，发送验证信息
      sendAddCode:function () {
        let self=this;
        console.log(self.addFriendTextarea);
        self.modal_loading = true;
        let formData = new FormData();
        // 请求参数 ('key',value)
        formData.set('userId', self.user.userId);
        formData.set('friendId', self.userItem.id);
        formData.set('content', self.addFriendTextarea);
        formData.set('type', self.userItem.status);
        fetch(conf.getApplyFriendUrl(), {
          method: 'POST',
          model: 'cros', //跨域
          headers: {
            Accept: 'application/json'
          },
          body: formData
        })
          .then(response => response.json())
          .then(json => {
            if(json.sign){
              self.modal_loading = false;
              self.$Message.success(json.msg);
              self.addFriend=false;
            }
          })
          .catch((error) => {
            console.log(error)
          });
      },
      //删除好友
      deleteFriendF:function () {
        let self=this;
        let formData = new FormData();
        // 请求参数 ('key',value)
        formData.set('userId', self.user.userId);
        formData.set('id', self.userItem.id);
        fetch(conf.getDelFriendUrl(), {
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
              self.$Message.success(json.msg);
              self.deleteFriend=false;
              self.userItem.status=0;
            }
          })
          .catch((error) => {
            console.log(error)
          });
      },
    },
    component: {
      //someComponent
    },
    computed: {
      messageList: {
        get: function() {
          return this.$store.state.messageList;
        },
        set: function(messageList) {
          this.$store.commit('setMessageList', messageList);
        }
      },
      showFace: {
        get: function() {
          return this.$store.state.showFace;
        },
        set: function(showFace) {
          this.$store.commit('setShowFace', showFace);
        }
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
    watch: {
      // 监听每次 user 的变化
      userItem: function(val) {
        console.log(val);
        /*let self = this;
        self.messageList = [];
        // 从内存中取聊天信息
        let cacheMessages = self.$store.state.messageListMap.get(self.chat.id);
        if (cacheMessages.list) {
          self.messageList = cacheMessages.list;
        }*/
        // 每次滚动到最底部
        /*this.$nextTick(() => {
          imageLoad('message-box');
        });*/
        /*if (self.chat.type === '1') {
          let param = new FormData();
          param.set('chatId', self.chat.id);
          fetchPost(
            conf.getChatUsersUrl(),
            param,
            function(json) {
              self.userList = json;
            },
            self
          );
        }*/
      }
    },
    mounted: function() {
      // 每次滚动到最底部
      this.$nextTick(() => {
        imageLoad('message-box');
      });
      this.action=conf.getUploadingUrl();
    }
  }
</script>

<style lang="scss" scoped>
    /* 展开好友 */
    .chat-drawer-title{
        padding: 30px 0 20px;
        text-align: center;
        border-bottom: 1px solid #e8e8e8;
        .chat-drawer-header{
            margin: 0 auto;
            width: 45px;
            height: 45px;
            line-height: 45px;
            >img{
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
        .chat-drawer-name{
            margin-top: 10px;
            font-size: 14px;
        }
    }
    .chat-drawer-switch{
        margin-top: 25px;
        font-size: 15px;
        color: #999;
        p{
            margin-bottom: 5px;
        }
        >div{
            width: 100%;
            font-size: 14px;
            color: #515a6e;
        }
        input{
            display: block;
            width: 100%;
            border: 0 none;
            color: #515a6e;
        }
        textarea{
            padding: 0;
            min-height: 40px;
            color: #515a6e;
        }
    }
    .chat-drawer-buttons{
        padding: 20px 0 4px 0;
        display: flex;
        justify-content: space-between;
        border-top: 1px solid #f5f5f5;
        button{
            width: 48%;
            border-radius: 3px;
            font-size: 14px;
        }
        .noGroupOwner{
            width: 100%;
        }
    }
    /* 展开群信息 */
    .group-members{
        margin-top: 25px;
        display: flex;
        flex-wrap: wrap;
    }
    .ios-arrow{
        margin-top: 10px;
        text-align: center;
        cursor: pointer;
    }
    .members-li{
        margin-top: 5px;
        width: 54px;
        text-align: center;
        cursor: default;
        .addMember{
            i{
                width: 40px;
                height: 40px;
                line-height: 40px;
                border:1px solid #ccc;
                font-size: 26px;
                border-radius: 3px;
            }
        }
        .members-header{
            margin: 0 auto;
            width: 40px;
            height: 40px;
            line-height: 40px;
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
        .members-name{
            padding: 5px 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
    /* 添加、删除好友 */
    .addFriend-header{
        color:#19be6b;
        text-align:center;
        font-size: 16px;
    }
    .addFriend-textarea{
        padding: 5px;
        width: 100%;
        min-height: 80px;
        border: none;
        background-color: #fff;
        resize:none;
        font-size: 14px;
        color: #666;
    }
    /* 文件弹窗 */
    .modal-alert{
        margin: 0 auto;
        width: 90%;
        text-align: center;
        font-size: 16px;
        img{
            width: 100px;
        }
        div{
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
    .demo-spin-icon-load{
        animation: ani-demo-spin 1s linear infinite;
    }
    @keyframes ani-demo-spin {
        from { transform: rotate(0deg);}
        50%  { transform: rotate(180deg);}
        to   { transform: rotate(360deg);}
    }
    .chat-message{
        height: 100%;
    }
    .chat-title{
        padding: 30px 30px 20px 30px;
        display: flex;
        justify-content: space-between;
        font-size: 20px;
        border-bottom: 1px solid #e7e7e7;
        color: #000;
        .ios-more{
            cursor: pointer;
        }
    }
    .chat-content{
        /*padding: 0 30px;*/
        height: calc(100% - 81px);
        .chat-records{
            padding: 0 30px;
            width: 100%;
            height: 75%;
            background-color: #f5f5f5;
            overflow-y: auto;
            overflow-x: hidden;
            .view-more{
                padding: 10px 0;
                text-align: center;
                color: #54a0ff;
            }
            .chat-records-li{
                position: relative;
                padding-left: 60px;
                margin-bottom: 15px;
                min-height: 68px;
                font-size: 0;
                .chat-user{
                    position: absolute;
                    top:0;
                    left: 0;
                    vertical-align: top;
                    >div{
                        width: 40px;
                        height: 40px;
                        line-height: 40px;
                        background-color: #3498db;
                        color: #fff;
                        border-radius: 50%;
                        text-align: center;
                        font-size: 14px;
                    }
                    img{
                        width: 40px;
                        height: 40px;
                        border-radius: 8px;
                    }
                    cite {
                        position: absolute;
                        left: 60px;
                        top: -2px;
                        width: 500px;
                        line-height: 24px;
                        font-size: 12px;
                        white-space: nowrap;
                        color: #999;
                        text-align: left;
                        font-style: normal;
                        i {
                            font-style: normal;
                            padding-left: 15px;
                        }
                    }
                }
                .chat-text{
                    position: relative;
                    line-height: 22px;
                    margin-top: 25px;
                    padding: 8px 10px;
                    max-width: 60%;
                    background-color: #fff;
                    border-radius: 3px;
                    color: #333;
                    word-break: break-all;
                    display: inline-block;
                    vertical-align: top;
                    font-size: 14px;
                    text-align: left;
                    &:after {
                         content: '';
                         position: absolute;
                         left: -10px;
                         top: 13px;
                         width: 0;
                         height: 0;
                         border-style: solid dashed dashed;
                         border-color: #fff transparent transparent;
                         overflow: hidden;
                         border-width: 10px;
                     }
                    .message-img{
                     display: block;
                    }
                    pre {
                        width: 100%;
                        white-space: pre-wrap;
                        word-break: break-all;
                    }
                }
                .chat-text:hover{
                    background-color: #fdfdfd;
                    &:after{
                         border-color: #fdfdfd transparent transparent;
                     }
                }
            }
            .chat-mine{
                padding-left: 0;
                padding-right: 60px;
                text-align: right;
                .chat-user{
                    right: 0;
                    left: auto;
                    cite{
                        right: 60px;
                        left: auto;
                        text-align: right;
                        i{
                            padding-right: 15px;
                            padding-left: 0;
                        }
                    }
                }
                .chat-text{
                    background-color: #b3d675;
                    &:after{
                        left: auto;
                        right: -10px;
                         border-color: #b3d675 transparent transparent;
                     }
                }
                .chat-text:hover{
                    background-color: #add070;
                    &:after{
                         border-color: #add070 transparent transparent;
                     }
                }
            }
        }
        .chat-tool{
            padding: 0 30px;
            width: 100%;
            height: 25%;
            background-color: #fff;
            >div{
                width: 100%;
            }
            .chat-tool-title{
                position: relative;
                color: #5e5e5e;
                font-size: 24px;
                .insertFace {
                    position: absolute;
                    bottom: 36px;
                    left: -30px;
                }
                .uload{
                    display: inline-block;
                }
            }
            .chat-tool-textarea{
                height: 61.5px;
                .chat-tool-text{
                    width: 100%;
                    height: 100%;
                    line-height: 20px;
                    font-size: 14px;
                    outline:none;
                    border:0 none;
                    resize: none;
                    overflow: auto;

                }

            }
            .chat-tool-send{
                margin: 8px 0;
                float: right;
                width: 70px;
                height: 26px;
                line-height: 26px;
                text-align: center;
                font-size: 14px;
                color: #606060;
                background-color: #f5f5f5;
                border: 1px solid #e5e5e5;
                cursor: pointer;
            }
        }
    }
</style>