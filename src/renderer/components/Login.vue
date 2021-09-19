<template>
  <!-- <div id="login-container">
    <span>Для авторизации перейдите в тг бот <a target="_blank" href="https://t.me/electieBot">@electieBot</a></span>
    <input type="text" v-model="chat_id">
    <CButton color="primary" @click="login">Войти</CButton>
  </div> -->
  <div class="c-app flex-row align-items-center">
    <CContainer class="login-container">
      <CRow class="justify-content-center">
        <CCol>
          <CCard class="p-4">
              <CCardBody>
                <CForm>
                  <h1>Вход в ЛК</h1>
                  <p class="text-muted">Авторизируйтесь</p>
                  <CRow>
                    <a href="https://t.me/electieBot" target="_blank" rel="noopener noreferrer">Получить №УИК и пароль</a>
                  </CRow>
                  <CInput
                    v-model="chat_id"
                    placeholder="Пароль"
                  >
                    <template #prepend-content><CIcon width="20" height="25" name="cilUser"/></template>
                  </CInput>
                  <CRow>
                    <CCol col="6" class="text-left">
                      <CButton color="primary" @click="login" class="px-4">Войти</CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
const fs = require('fs')
const unzipper = require('unzipper')
export default {
  name: 'Login',
  data () {
    return {
      chat_id:''
    }
  },
  mounted(){
    this.$config.vlcPath = `${process.cwd()}/vlc/vlc.exe`
    if(!fs.existsSync(`${process.cwd()}/vlc/vlc.exe`)){
      fs.createReadStream(`${process.cwd()}/vlc/VLC.zip`)
      .pipe(unzipper.Extract({ path: `${process.cwd()}/vlc/` }))
      .promise()
      .then( () => {
        console.log('vlc extracted')
      });
    }
  },
  methods:{
    login(){
      this.$http.post(`${this.$config.server}/v1/auth/login`, {
          chat_id:this.chat_id
      }).then(e=>{
        if(e.data.status){
          this.$store.commit('updateUser', [e.data.user])
          if(e.data.user.chats.length > 1){
            this.$router.push({ name: 'rooms', query: { chats: e.data.user.chats}})
          }else{
            const chat = e.data.user.chats[0]
            let {uik,chatAssignment, ...rest} = chat
            uik.chat = rest
            this.$router.push({ name: 'main', query: { uik: uik} })
          }
        }
      })
    }
  },
}
</script>
<style>
.login-container{
  width: 500px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.login-container p{
  margin-bottom: 0;
}
.login-container .form-group{
  margin: 8px 0 15px 0;
}
.c-app{
    display: flex;
    color: #3c4b64;
    background-color: #ebedef;
    flex-direction: row;
 }
</style>
