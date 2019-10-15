// 格式化时间
import conf from '../conf';

export function formatDateTime(date) {
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  let d = date.getDate();
  d = d < 10 ? '0' + d : d;
  let h = date.getHours();
  h = h < 10 ? '0' + h : h;
  let minute = date.getMinutes();
  minute = minute < 10 ? '0' + minute : minute;
  let second = date.getSeconds();
  second = second < 10 ? '0' + second : second;
  return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
}

/**
 * 毫秒转换友好的显示格式
 * 输出格式：21小时前
 * @param  {[type]} date 日期
 */
export function dateStr(date) {
  // 获取js 时间戳
  let time = new Date().getTime();
  // 去掉 js 时间戳后三位
  time = parseInt((time - date * 1000) / 1000);

  // 存储转换值
  let s;
  if (time < 60 * 10) {
    // 十分钟内
    return '刚刚';
  } else if (time < 60 * 60 && time >= 60 * 10) {
    // 超过十分钟少于1小时
    s = Math.floor(time / 60);
    return s + '分钟前';
  } else if (time < 60 * 60 * 24 && time >= 60 * 60) {
    // 超过1小时少于24小时
    s = Math.floor(time / 60 / 60);
    return s + '小时前';
  } else if (time < 60 * 60 * 24 * 3 && time >= 60 * 60 * 24) {
    // 超过1天少于3天内
    s = Math.floor(time / 60 / 60 / 24);
    return s + '天前';
  } else {
    // 超过3天
    let date = new Date(parseInt(date) * 1000);
    return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
  }
}

/**
 * 聊天会话
 */
export class Chat {
  constructor(id, realName, remark, fromRealName, header,  type, isUserClick, pitchOn) {
    this.id = id;
    this.realName = realName;
    this.remark = remark;
    this.fromRealName=fromRealName;
    this.header=header;
    this.type = type;
    this.isUserClick=isUserClick;
    this.pitchOn=pitchOn;
    this.unReadCount=0;
  }
}

/**
 * 图片加载完成处理函数
 * @param arr 图片的src集合
 * @returns {Promise}
 */
function preloadImages(arr) {
  let loadedImage = 0;
  let images = [];
  return new Promise(function(resolve, reject) {
    for (let i = 0; i < arr.length; i++) {
      images[i] = new Image();
      images[i].src = arr[i];
      images[i].onload = function() {
        loadedImage++;
        if (loadedImage === arr.length) {
          resolve();
        }
      };
      images[i].onerror = function() {
        reject();
      };
    }
  });
}

/**
 * 图片加载完成，聊天对话框scroll拉到最下
 * @param id 容器id
 */
export function imageLoad(id) {
  scrollBottom(id);
  let messageBox = document.getElementById(id);
  if (messageBox) {
    let images = messageBox.getElementsByTagName('img');
    if (images) {
      let arr = [];
      for (let i = 0; i < images.length; i++) {
        arr[i] = images[i].src;
      }
      preloadImages(arr)
        .then(() => {
          scrollBottom(id);
        })
        .catch(function() {
          scrollBottom(id);
        });
    }
  }
}
/**
 * 滚动条到最下方
 * @param id 容器id
 */
function scrollBottom(id) {
  let div = document.getElementById(id);
  if (div) {
    div.scrollTop = div.scrollHeight;
  }
}
/**
 * 去掉转义字符
 * @param id 容器id
 */
export function browserType() {
  var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
  var isOpera = false;
  if (userAgent.indexOf('Edge') > -1) {
    return "Edge";
  }
  if (userAgent.indexOf('.NET') > -1) {
    return "IE";
  }
  if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
    isOpera = true;
    return "Opera"
  }; //判断是否Opera浏览器
  if (userAgent.indexOf("Firefox") > -1) {
    return "FF";
  } //判断是否Firefox浏览器
  if (userAgent.indexOf("Chrome") > -1) {
    return "Chrome";
  }
  if (userAgent.indexOf("Safari") > -1) {
    return "Safari";
  } //判断是否Safari浏览器
  if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
    return "IE";
  }//判断是否IE浏览器
}
/**
 * 去掉转义字符
 * @param id 容器id
 */
export function excludeSpecial(content) {
  // 去掉转义字符
  content = content.replace(/[\'\\\n\r\t]/g, '');
  return content;
}

export function transform(content) {
  let type='',
    href='',
    time='';
  if(typeof content == 'string'){
    content = content.replace(/[\'\\\n\r\t]/g, '');
    type=content.split('?')[0];
    href=content.split('?')[1];
    time=content.split('?')[2];
  }else if(typeof content == 'object'){
    type=content.type;
    href=content.url;
    time=content.time;
  }
  if(type == 'rrtFile'){
    return '<i class="ivu-icon ivu-icon-md-arrow-down"></i>'+href+'';
  }else if(type == 'rrtaudio'){
    // return '<Maudio src="'+href+'"></Maudio>'
    return {
      url:href,
      type:'rrtaudio',
      time:time
    }
  }else {
    return content;
  }

}

export let faceUtils = {
  alt: [
    '[微笑]',
    '[憋嘴]',
    '[色]',
    '[发呆]',
    '[得意]',
    '[流泪]',
    '[害羞]',
    '[闭嘴]',
    '[睡]',
    '[大哭]',
    '[尴尬]',
    '[发怒]',
    '[调皮]',
    '[呲牙]',
    '[惊讶]',
    '[难过]',
    '[酷]',
    '[冷汗]',
    '[抓狂]',
    '[吐]',
    '[偷笑]',
    '[愉快]',
    '[白眼]',
    '[傲慢]',
    '[饥饿]',
    '[困]',
    '[惊恐]',
    '[流汗]',
    '[憨笑]',
    '[悠闲]',
    '[奋斗]',
    '[咒骂]',
    '[疑问]',
    '[嘘]',
    '[晕]',
    '[疯了]',
    '[衰]',
    '[骷髅]',
    '[敲打]',
    '[再见]',
    '[擦汗]',
    '[抠鼻]',
    '[鼓掌]',
    '[糗大了]',
    '[坏笑]',
    '[左哼哼]',
    '[右哼哼]',
    '[哈欠]',
    '[鄙视]',
    '[委屈]',
    '[快哭了]',
    '[阴险]',
    '[亲亲]',
    '[吓]',
    '[可怜]',
    '[菜刀]',
    '[西瓜]',
    '[啤酒]',
    '[篮球]',

  ],
  faces: function() {
    let self = this;
    let arr = {};
    for (let i = 0; i < self.alt.length; i++) {
      let newI=i+1;
      if(newI < 10){
        arr[self.alt[i]] = '/im/emoj/j_000' + newI + '.gif';
      }else {
        arr[self.alt[i]]  = '/im/emoj/j_00' + newI + '.gif';
      }

    }
    console.log(arr);
    return arr;
  }

  /*alt: [],
  faces: function() {
    let self = this;
    self.alt.length=60;
    for (let i = 0; i < self.alt.length; i++) {
      let newI=i+1;
      if(newI < 10){
        self.alt[i] = '/im/emoj/j_000' + newI + '.gif';
      }else {
        self.alt[i] = '/im/emoj/j_00' + newI + '.gif';
      }

    }
    return self.alt;
  }*/
};

/*export function transform(content) {
  // 支持的html标签
  let html = function(end) {
    return new RegExp('\\n*\\[' + (end || '') + '(code|pre|div|span|p|table|thead|th|tbody|tr|td|ul|li|ol|li|dl|dt|dd|h2|h3|h4|h5)([\\s\\S]*?)]\\n*', 'g');
  };
  let fa = faceUtils.faces();
  if (content) {
    content = content
      .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&#39;')
      .replace(/"/g, '&quot;') // XSS
      .replace(/@(\S+)(\s+?|$)/g, '@<a href="javascript:;">$1</a>$2')

      .replace(/face\[([^\s\[\]]+?)]/g, function(face) {
        // 转义表情
        let alt = face.replace(/^face/g, '');
        return '<img alt="' + fa[alt] + '" title="' + fa[alt] + '" src="' + fa[alt] + '">';
      })
      .replace(/img\[([^\s]+?)]/g, function(img) {
        // 转义图片
        let href = img.replace(/(^img\[)|(]$)/g, '');
        return '<img class="message-img" src="' + href + '" alt="消息图片不能加载">';
      })
      .replace(/file\([\s\S]+?\)\[[\s\S]*?]/g, function(str) {
        // 转义文件
        let href = (str.match(/file\(([\s\S]+?)\)\[/) || [])[1];
        let text = (str.match(/\)\[([\s\S]*?)]/) || [])[1];
        if (!href) return str;
        return '<a class="message-file" href="' + href + '"><i class="ivu-icon ivu-icon-md-arrow-down"></i>' + (text || href) + '</a>';
      })
      .replace(/audio\[([^\s]+?)]/g, function(audio) {
        // 转义音频
        return '<div class="message-audio" data-src="' + audio.replace(/(^audio\[)|(]$)/g, '') + '"><i class="layui-icon">&#xe652;</i><p>音频消息</p></div>';
      })
      .replace(/video\[([^\s]+?)]/g, function(video) {
        // 转义音频
        return '<div class="message-video"  data-src="' + video.replace(/(^video\[)|(]$)/g, '') + '"><i class="layui-icon">&#xe652;</i></div>';
      })
      .replace(/a\([\s\S]+?\)\[[\s\S]*?]/g, function(str) {
        // 转义链接
        let href = (str.match(/a\(([\s\S]+?)\)\[/) || [])[1];
        let text = (str.match(/\)\[([\s\S]*?)]/) || [])[1];
        if (!href) return str;
        return '<a href="' + href + '" target="_blank">' + (text || href) + '</a>';
      })
      .replace(html(), '<$1 $2>')
      .replace(html('/'), '</$1>') // 转移HTML代码
      .replace(/\n/g, '<br>'); // 转义换行
  }
  return content;
}*/

export const ChatListUtils = {
  listKey: '_chatList',
  setChatList: function(userId, chatList) {
    localStorage.setItem(userId + this.listKey, JSON.stringify(chatList));
  },
  //从缓存中获取已经保存的会话
  getChatList: function(userId) {
    let str = localStorage.getItem(userId + this.listKey);
    if (!str) {
      return [];
    }
    return JSON.parse(str);
  },
  //删除聊天会话框
  delChat: function(userId, chat) {
    let tempChatList = [];
    for (let item of this.getChatList(userId)) {
      if (String(item.id) !== String(chat.id)) {
        tempChatList.push(item);
      }
    }
    // 放入缓存
    this.setChatList(userId, tempChatList);
    return tempChatList;
  },
  /**
   * 刷新会话列表
   * @param self 当前对象
   * @param user 用户
   * @param host 主机名
   * @returns {Chat} 当前会话
   */
  resetChatList: function(self, user, host, type) {
    let chatList = this.getChatList(self.$store.state.user.id);
    let msgTop=[];
    let tempChatList=[];
    let newList=[];
    // 删除当前用户已经有的会话
    let newChatList = chatList.filter(function(element) {
      return String(element.id) !== String(user.friendId);
    });
    // 重新添加会话，放到第一个
    console.log(newChatList);
    newChatList.map(function (item) {
      item.pitchOn=false;
      item.isUserClick=false;
      console.log(item);
      if(item.msgTopTime == 1){
        msgTop.push(item);
      } else {
        tempChatList.push(item);
      }
    });
    let chat = new Chat(user.friendId, user.realName, user.remark, user.fromRealName, user.header, type, true, true);
    tempChatList.unshift(chat);
    newList=tempChatList;
    if(msgTop.length)newList=msgTop.concat(tempChatList);
    // 存储到localStorage 的 chatList
    this.setChatList(self.$store.state.user.id, chatList);
    self.$store.commit('setChatList', newList);
    return chat;
  }
};
//信息的类型 MSG_PING 心跳 、MSG_READY 链接就绪  MSG_MESSAGE 消息
export const MessageInfoType = {
  MSG_PING: '0',
  MSG_READY: '1',
  MSG_MESSAGE: '2'
};
//信息的目标类型 FRIEND 私聊 、CHAT_GROUP 群聊
export const MessageTargetType = {
  FRIEND: 'p2p',
  CHAT_GROUP: 'group'
};

/**
 * 退出登录
 * @param self vue this对象
 */
export function logout(self) {
  console.log(self);
  self.$store.commit('closeConnect');
  self.$store.commit('clear');
  self.$router.push({
    path: '/',
    params: {}
  });
}

/**
 * 重新封装的fetch，支持超时操作。
 * @param fetchPromise 真正要执行的promise
 * @param timeout 超时时间
 * @returns {Promise<any>} 返回一个 promise
 */
export function timeoutFetch(fetchPromise, timeout) {
  let abortFn = null;

  //这是一个可以被reject的promise
  let abortPromise = new Promise(function(resolve, reject) {
    abortFn = function() {
      reject(ErrorType.TIMEOUT_ERROR);
    };
  });

  //这里使用Promise.race，以最快 resolve 或 reject 的结果来传入后续绑定的回调
  let abortAblePromise = Promise.race([fetchPromise, abortPromise]);

  setTimeout(function() {
    abortFn();
  }, timeout);

  return abortAblePromise;
}

/**
 * 封装的ajax 跨域请求
 * @param url 请求路径
 * @param formData 请求参数 formData 类型
 * @param resultFun 返回结果处理函数
 * @param self vue this 对象
 */
export function fetchPost(url, formData, resultFun, self) {
  timeoutFetch(tokenFetch(url, formData, self), 5000)
    .then(response => {
      //token 失效，需要刷新
      if (response.status === 401) {
        return new Promise((resolve, reject) => {
          reject(ErrorType.TOKEN_ERROR);
        });
      } else if (response.status === 200) {
        return response.json();
      } else {
        return new Promise((resolve, reject) => {
          reject(ErrorType.SERVER_ERROR);
        });
      }
    })
    .then(json => {
      if (typeof json != 'undefined') {
        resultFun(json);
      }
    })
    .catch(error => {
      if (error === ErrorType.SERVER_ERROR) {
        self.$Message.error('服务器错误');
      } else if (error === ErrorType.TIMEOUT_ERROR) {
        self.$Message.error('服务器响应超时');
      } else {
        self.$Message.error(error);
      }
    });
}

/**
 * 带有token 的fetch 请求
 * @param url url
 * @param formData 参数
 * @param self vue this 对象
 * @returns {Promise<any | never>}
 */
export function tokenFetch(url, formData) {
  console.log(formData);
  let token = sessionStorage.getItem('token');
  formData.set('access_token', token);
  return fetch(url, {
    method: 'POST',
    model: 'cros', //跨域
    headers: {
      Accept: 'application/json'
    },
    body: formData
  });
}


export const ErrorType = {
  TIMEOUT_ERROR: 9, //超时
  TOKEN_ERROR: 401, //token 失效错误
  PARAM_ERROR: 400, //参数错误
  FLUSH_TOKEN_ERROR: 7, //刷新token错误
  SERVER_ERROR: 500 //刷新token错误
};
