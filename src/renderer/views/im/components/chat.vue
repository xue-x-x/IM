<template>
    <div class="chat-message">
        <div class="chat-title">
            <div>{{userItem.remark || userItem.realName}}</div>
            <div><Icon type="ios-more" /></div>
        </div>
        <div class="chat-content">
            <div class="chat-records" id="message-box"  @scroll="didScroll">
                <ul>
                    <li class="view-more" v-if="isHaveMore">
                        <span v-if="isView">查看更多</span>
                        <span v-else>
                           <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                        </span>
                    </li>
                    <li class="chat-records-li" :class="{'chat-mine': item.sendRealName == user.userName}" v-for="(item,index) in messageList" :key="index">
                        <div class="chat-user">
                            <img v-if="item.sendHeader" :src="url+item.sendHeader" alt="">
                            <div v-else="">{{item.sendRealName.slice(-2)}}</div>
                            <cite v-if="item.sendRealName != user.userName">{{item.sendRealName}}<i>{{item.pubTime}}</i></cite>
                            <cite v-else=""><i>{{item.pubTime}}</i>{{item.sendRealName}}</cite>
                        </div>
                        <div class="chat-text">
                            <pre v-html="item.remark1"></pre>
                        </div>
                    </li>
                    <!--<li class="chat-records-li chat-mine">
                        <div class="chat-user">
                            <img src="../../../assets/1.jpg" alt="">
                            <cite><i>2019-09-16 14:59:28</i>管理员</cite>
                        </div>
                        <div class="chat-text">
                            <pre>
                                <a href="http://58.218.203.29/im/chatImg/20190924111028442_2470957新建 DOC 文档.doc">文档</a>
                            </pre>
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
                    <Icon type="ios-text-outline" title="聊天记录"/>
                </div>
                <div class="chat-tool-textarea">
                    <!--<textarea v-model="messageContent" @keyup.enter="mineSend()"></textarea>-->
                    <div class="chat-tool-text" v-html="messageContent" contenteditable="true" @click="closeFaceBox" @blur="changeText"></div>
                </div>
                <div class="chat-tool-send" @click="mineSend">发送</div>
            </div>
        </div>
    </div>
    <!--<someComponent></someComponent>-->
</template>

<script>
  //import someComponent from './someComponent'
  const { imageLoad, transform, ChatListUtils } = require('../utils/chatUtils');
  import conf from '../conf'
  import Faces from './faces.vue';
//  import WebsocketHeartbeatJs from '../utils/WebsocketHeartbeatJs.js';
  export default {
    components: {
      Faces
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
        }
      }
    },
    methods: {
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
//          debugger
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
      //内容转换
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
//            this.messageContent = this.messageContent + '<p>rrtFile?'+self.url+path+'</p>';
            this.messageContent = this.messageContent + '<p>rrtFile?'+self.url+path+'</p>';
          }
          // 图片
          else {
            this.messageContent = this.messageContent + '<img class="message-img" src="'+self.url+path+'" style="max-width: 160px">';
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
      // 附件和图片点击展开
      openImageProxy: function(event) {
        event.preventDefault();
        if (event.target.nodeName === 'IMG') {
          winControl.openURL(event.target.src);
        } else if (event.target.className === 'message-file') {
          winControl.openURL(event.target.href);
        }
      },
      // 本人发送信息
      mineSend() {
        debugger
        let self = this;
        let currentUser = self.$store.state.user;
        currentUser=self.user;
        console.log(self.userItem);
        console.log(self.messageContent);
//        return
        let content = self.messageContent;
//        return
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
        console.log(1111);
        self.$store.commit('sendMessage', message);
        console.log(2222);
        self.messageContent = '';
        console.log(self.messageContent);
        // 每次滚动到最底部
        self.$nextTick(() => {
          imageLoad('message-box');
        });
      },

    },
    component: {
      //someComponent
    },
    computed: {
      messageList: {
        get: function() {
          console.log(this.$store.state.messageList);
          return this.$store.state.messageList;
        },
        set: function(messageList) {
          console.log(messageList);
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
    watch: {

      // 监听每次 user 的变化
      chat: function(val) {
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
      console.log(1111);
      // 每次滚动到最底部
      this.$nextTick(() => {
        imageLoad('message-box');
      });
      this.action=conf.getUploadingUrl();
//      console.log(conf.getUploadingUrl());
    }
  }
</script>

<style lang="scss" scoped>
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