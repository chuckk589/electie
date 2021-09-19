<template>
  <div id="main-container">
    <div class="body">
      <TelegramChat :chat="this.$route.query.uik.chat"></TelegramChat>
      <UiStream></UiStream>
      <div class="phone"></div>
    </div>
  </div>
</template>

<script>
import TelegramChat from './Main/TelegramChat'
import UiStream from './Main/UiStream'

export default {
  name: 'Main',
  components: {
    TelegramChat,
    UiStream
  },
  data () {
    return {
      
    }
  },
  mounted(){
    this.getWidgetCreds()
    this.getGlobalConfigs()
  },
  methods:{
    getWidgetCreds(){
      this.$http.get(`${this.$config.server}/v1/auth/zadarma`).then(res=>{
        if(res.data.status === 'success'){
          zadarmaWidgetFn(res.data.key, res.data.full_sip, 'square' /*square|rounded*/, 'ru' /*ru, en, es, fr, de, pl, ua*/, true, "{right:'10px',bottom:'5px'}");
        }else{
          console.log('zadarma auth error')
        }
      })
    },
    getGlobalConfigs(){
      this.$http.get(`${this.$config.server}/v1/config/`).then(e=>{
        this.$config = Object.assign(this.$config, e.data.config.reduce((s,c)=>{
            s[c.name] = c.value
            return s
        },{}))
      })
    },
    logout(){
      this.$store.commit('set', ['authed',false])
      this.$router.push('/')
    }
  }
}
</script>
<style>
#main-container{
  display: flex;
  flex-direction: column;
}
.header{
  display: flex;
  justify-content: flex-end;
}
.body{
  display: flex;
}
#zdrmWPhI{
  display: none;
}
</style>
