<template>
    <div class="backstage-box">
        <Top></Top>
        <iframe class="iframe" :src="iframeUrl" frameborder="0"></iframe>
    </div>
    <!--<someComponent></someComponent>-->
</template>

<script>
  //import someComponent from './someComponent'
  import Top from '../components/top.vue';
  import conf from '../conf'
  export default {
    name: "",
    components: {
      Top,
    },
    data() {
      return {
        url:conf.url,
        iframeUrl:''
      }
    },
    methods: {
      openURL:function () {
        let self=this;
        let formData = new FormData();
        formData.set('userId', self.user.userId);
        fetch(conf.getTokenUrl(), {
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
              self.iframeUrl=conf.openURL()+'?token='+json.token;
              console.log(self.iframeUrl)
            }
          })
          .catch((error) => {
            console.log(error);

          });
      }
    },
    created: function() {
      let self=this;
      self.user = self.$store.state.user.userId ? self.$store.state.user :JSON.parse(sessionStorage.getItem("user"));
    },
    activated: function() {
      this.openURL();
    },
  }
</script>

<style scoped>
.backstage-box{
    position: relative;
    padding-top: 40px;
    width: 26rem;
    height: 100%;
    background-color: #f5f5f5;
}
    .iframe{
        width: 100%;
        height: 100%;
    }
</style>