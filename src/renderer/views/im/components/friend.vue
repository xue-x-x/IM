<template>
    <div>
        <div class="addFriend">
            添加好友
        </div>
    </div>
    <!--<someComponent></someComponent>-->
</template>

<script>
  //import someComponent from './someComponent'
  export default {
    name: "",
    data() {
      return {
        msg: "Hello Vue.js"
      }
    },
    methods: {},
    component: {
      //someComponent
    }
  }
</script>

<style scoped>
.addFriend{
    position: fixed;
    top:50%;
    left: 50%;
    transform: translate();
}
</style>