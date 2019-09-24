<template>
    <div>
        <ul class="faces">
            <li v-for="item in faceList">
                <img :src="url+faceMap[item]" :alt="item" :title="item" @click="insertFace(item)"/>
            </li>
        </ul>
        <div class="clear"></div>
    </div>
</template>
<script>
const { faceUtils } = require('../utils/chatUtils');
import conf from '../conf'
export default {
  components: {},
  data() {
    return {
      url:conf.url,
      faceList: faceUtils.alt,
      faceMap: faceUtils.faces()
    };
  },
  methods: {
    insertFace: function(item) {
      this.$emit('insertFace', item);
    }
  }
};
</script>

<style scoped lang="scss">
.faces {
    width: 333px;
    list-style: none;
    background-color: #ffffff;
    display: block;
    height: 200px;
    overflow: auto;
    border-radius: 3px;
    box-shadow: 0 0 5px #ccc;
    & > li {
        width: 3rem !important;
        height: 3rem !important;
        display: inline-block;
        padding: 4px;
        float: left;
        cursor: pointer;
        & > img {
          width: 100%;
          height: 100%;

        }
    }
}
</style>
