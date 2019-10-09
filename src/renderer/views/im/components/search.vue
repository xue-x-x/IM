<template>
    <div class="search-box clearfix">
        <div class="search-input">
            <Input prefix="ios-search" v-model="search" placeholder="搜索" size="small" class="search" @on-focus="showSearch()" @on-keyup="searchUser"/>
            <Icon v-if="showSearchDiv" class="close" @click="closeSearchDiv" type="md-close" />
        </div>
        <Icon class="fr" type="ios-add" @click="isModel = true" />
        <createNewGroup v-if="isModel" :isModel="isModel" @addGroup="addGroup"></createNewGroup>
    </div>
</template>
<script>
import conf from '../conf';
import { pinyin } from '../utils/pinyin.js';
import { fetchPost } from '../utils/chatUtils';
import createNewGroup from './createNewGroup.vue';

export default {
  components:{
    createNewGroup,
  },
  props:{
    isUser:Boolean,
    isGroup:Boolean,
    list:Array
  },
  data() {
    return {
      url:conf.url,
      search: '',
      userList: this.list,
      searchUserList: [],
      showSearchDiv: false,
      activeClass:Number,
      isModel:false,
    };
  },
  methods: {
    showSearch: function() {
      let self=this;
      this.search = '';
      this.showSearchDiv = true;
      this.searchUserList = [];
      self.$emit('showSearch', this.showSearchDiv);
      self.$emit('searchUser', this.searchUserList);
    },
    searchUser: function() {
      let self=this;
//      self.$emit('getSearchUser', this.search.trim().toUpperCase());
      this.searchUserList = [];
      console.log(this.list);
      for (let i = 0; i < this.list.length; i++) {
        let name,remark;
        if(self.isUser){
          name = this.list[i].friendName || this.list[i].realName;
          remark = this.list[i].remark;
        }
        if(self.isGroup){
          name = this.list[i].name;
          remark = this.list[i].name;
        }
        let searchTemp = this.search.trim().toUpperCase();
        if (searchTemp !== '') {
          // 支持拼音查询
          if (
            name.indexOf(searchTemp) !== -1 ||
            remark.indexOf(searchTemp) !== -1 ||
            pinyin
              .getFullChars(name)
              .toUpperCase()
              .indexOf(searchTemp) !== -1 ||
            pinyin
              .getFullChars(remark)
              .toUpperCase()
              .indexOf(searchTemp) !== -1 ||
            pinyin.getCamelChars(name).indexOf(searchTemp) !== -1 ||
            pinyin.getCamelChars(remark).indexOf(searchTemp) !== -1
          ) {
            this.searchUserList.push(this.list[i]);
            self.$emit('searchUser', this.searchUserList);
          }
        }
      }
    },
    closeSearchDiv: function() {
      let self=this;
      self.showSearchDiv = false;
      self.search = '';
      self.$emit('showSearch', this.showSearchDiv);
    },
    //关闭弹窗
    addGroup:function (boolean) {
      this.isModel=boolean;
    },
  },
  created: function() {

  }
};
</script>
<style lang="scss" scoped>
@import '../../../styles/theme';

.user-box-list {
    height: 100%;
    width: 240px;
    display: flex;
    flex-direction: column;
    background: #eae8e7;
}
.search-box{
    padding: 15px 10px;
    background: #eeebe9;
    .search-input{
        position: relative;
        width: 86%;
        float: left;
        .close{
            position: absolute;
            top:50%;
            right: 10px;
            transform: translate(0,-50%);
            padding: 2px;
            font-size: 13px;
            color: #585858;
            background-color: #dcd9d8;
            border-radius: 50%;
        }
    }
    .search{
        width: 100%;
        height: 26px;
        input{
            background: #dbd9d8 !important;
        }
    }
    .fr{
        float: right;
        display: block;
        width: 26px;
        height: 26px;
        background-color: #fff;
        text-align: center;
        font-size: 26px;
    }
}

</style>
