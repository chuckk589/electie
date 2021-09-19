<template>
    <CContainer class="chat">
    <CRow>
      <CCol>
        <CListGroup>
          <!-- <CListGroupItem @click="collapse=!collapse" style="height: 52px;border-bottom: none;" tag="button">Карточка УИК</CListGroupItem> -->
          <CCollapse :navbar="true" class="uik-collapse" :show="collapse">
            <CListGroup>
              <CListGroupItem><b>Адрес: </b> {{this.$route.query.uik.address}}</CListGroupItem>
              <CListGroupItem><b>Email: </b>{{this.$route.query.uik.email}}</CListGroupItem>
              <CListGroupItem><b>Срок окончания полномочий: </b>{{this.$route.query.uik.exp}}</CListGroupItem>
              <CListGroupItem><b>Телефон: </b>{{this.$route.query.uik.phone}}</CListGroupItem>
              <CDataTable class="electie-table" :fields="uik_fields" :items="this.$route.query.uik.uik_members"></CDataTable>
            </CListGroup>
          </CCollapse>
          <CListGroupItem class="chat-button-group">
            <CButton @click="collapse=!collapse" class="list-group-item-action">Карточка УИК</CButton>
            <CButton @click="lawsCollapse=!lawsCollapse" class="list-group-item-action">Справочник</CButton>
          </CListGroupItem>
          <CCollapse class="laws-collapse" :navbar="true" :show="lawsCollapse">
            <CInput v-on:keyup.enter="lawsHelp" v-model="lawsRequest" placeholder = "Введите ваш вопрос"></CInput>
            <CButton color="primary" variant="outline" @click="lawsHelp">Отправить</CButton>
          </CCollapse>
          <CListGroupItem class="phone-prepend">
            <p>Председатель УИК</p>
            <div class="zdrm-webphone-call-btn-custom" @click="zadarmaWrapper($route.query.uik.phone)" :id="this.$route.query.uik.phone">
              <div class="zdrm-webphone-call-btn-ico zdrm-webphone-call-ico zdrm-webphone-call-btn-up"/>
            </div>
            <div class="phone-collapse">{{this.$route.query.uik.phone || 'Не указан'}}</div>
          </CListGroupItem>
          <CListGroupItem class="phone-prepend">
            <p>Коллега на УИК</p>
            <div class="zdrm-webphone-call-btn-custom" @click="zadarmaWrapper($route.query.uik.watcher_phone)" :id="this.$route.query.uik.watcher_phone">
              <div class="zdrm-webphone-call-btn-ico zdrm-webphone-call-ico zdrm-webphone-call-btn-up"/>
            </div>
            <div class="phone-collapse">{{this.$route.query.uik.watcher_phone || 'Не указан'}}</div>
          </CListGroupItem>
          <CListGroupItem class="phone-prepend">
            <p>Колл центр</p>
            <div class="zdrm-webphone-call-btn-custom" @click="zadarmaWrapper($config.call_center)" :id="this.$config.call_center">
              <div class="zdrm-webphone-call-btn-ico zdrm-webphone-call-ico zdrm-webphone-call-btn-up"/>
            </div>
            <div class="phone-collapse">{{this.$config.call_center || 'Не указан'}}</div>
          </CListGroupItem>
        </CListGroup>
      </CCol>
    </CRow>
    <CRow class="h-100">
      <CCol class="h-100">
        <CCard class="w-100 h-100">
          <CCardHeader>
            <div>{{chat.name}}
              <CButton 
                @click="isBack"
                style="float:right" 
                :color="calcColor" 
                variant="outline"
                v-c-popover="{
                  header:'Уведомление',
                  content: 'Подтверждайте свое присутствие не реже раза в 30 минут',
                  active: true,
                  placement: 'top-start'
                }"
                >Я на месте</CButton></div>
            <CProgress class="mt-1" show-value :max="30" :value="timer" :color="calcColor"></CProgress>
          </CCardHeader>
          <CCardBody class="overflow-y-scroll">
            <CListGroup>
              <CListGroupItem v-for="(msg, index) in existingMessages" :key="index">
                  <Message @nick-clicked="addNick(msg)" :messageEntity="msg" ></Message>
              </CListGroupItem>
            </CListGroup>
          </CCardBody>
          <CCardFooter>
            <CInput v-on:keyup.enter="sendMessage" v-model="message" type="text"/>
            <CButton color="primary" variant="outline" @click="sendMessage">Отправить</CButton>
          </CCardFooter>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>
 
<script>

import { io } from "socket.io-client";
import Message from '../TelegramChat/Message'

export default {
  name: 'TelegramChat',
  props:{
    chat: Object
  },
  components:{
    Message
  },
  data () {
    return {
      collapse:false,
      lawsCollapse:false,
      lawsRequest:'',
      uik_fields:[
        { key: 'credential', label: 'ФИО'},
        { key: 'status', label: 'Статус'},
        { key: 'proposedBy', label: 'Кем предложен в состав комиссии'}
    ],
      isAfk:false,
      timer:30,
      message:'',
      existingMessages:[],
      socket:undefined
    }
  },
  computed:{
    calcColor(){
      if(this.timer > 15){
        return 'success'
      }else if(this.timer>10){
        return 'warning'
      }else{
        return 'danger'
      }
    }
  },
  methods:{
    zadarmaWrapper(id){
      console.log(id)
      if(!id) return
      const el = document.querySelector(`[id='${id}'] div`)
      if(zdrmWPhI.status == "wait"){
        //zdrmWPhI.callNum()
        zdrmWPhI.status = "call"
        zdrmWPhI.apiWidget.call(id)
        el.className = el.className.replace(/zdrm-webphone-call-btn-up/gi, "zdrm-webphone-call-btn-down")
      }else if(zdrmWPhI.status == "call"){
        zdrmWPhI.status = "wait",
        zdrmWPhI.apiWidget.finishCall()
        el.className = el.className.replace(/zdrm-webphone-call-btn-down/gi, "zdrm-webphone-call-btn-up")
        zdrmWPhI.ringingStop()
        zdrmWPhI.stopTimer()
      }else if(zdrmWPhI.status == "incoming"){
        zdrmWPhI.hideCancelBtn()
        zdrmWPhI.answer()
      }
    },
    lawsHelp(){
      if(this.lawsRequest){
        window.open(`https://docs.cntd.ru/search?q=${this.lawsRequest}`);
        this.lawsRequest = ''
      }
    },
    isBack(){
      if(this.isAfk){
        this.socket.emit("message", {message:'Вернулся к наблюдению', chat:this.chat, user:this.$store.state.user});
      }
      this.timer = 30;
      this.isAfk=false
    },
    addNick(msg){
      this.message += `@${msg.user.username}`
    },
    sendMessage(){
      if(this.message){
        this.socket.emit("message", {message:this.message, chat:this.chat, user:this.$store.state.user});
        this.message=''
      }
    }
  },
  mounted: function(){
    if(!window.zdrmWPhI) window.zdrmWPhI = ''
    setInterval(() => {
      if(this.timer > 0){
        this.timer --
      }else if(!this.isAfk){
        this.isAfk = true
        this.socket.emit("message", {message:'Меня нет на месте', chat:this.chat, user:this.$store.state.user});
      }
    }, 1000*60);
    this.socket = io(`${this.$config.server}/`, {
      reconnectionDelayMax: 10000,
      query: {
        telegram_id: this.chat.telegram_id
      }
    });
    this.socket.on("chatMessage", (body) => {
      this.existingMessages.push(body)
    });
    this.$root.$on('chatMessage', (msg)=>{
      this.socket.emit("message", {message:msg, chat:this.chat, user:this.$store.state.user});
    })
  }
}
</script>
<style scoped>
.laws-collapse + .list-group-item{
  border-top: none;
}
.laws-collapse{
  display: flex;
  justify-content: space-between;
}
.laws-collapse .form-group{
  margin:3px 3px 3px 0;
  width: 100%;
}
.chat-button-group{
  display: flex;
  height: 52px;
  padding: 0;
}
.chat-button-group button:first-child{
  border-right: 1px solid var(--cui-list-group-border-color, rgba(0, 0, 21, 0.125));;
}
.chat{
  flex: 0 0 400px;
  /* overflow: hidden; */
  height: calc(100vh - 10px);
  margin-bottom: 10px ;
  display: flex;
  flex-direction: column;
  /* overflow-y: scroll; */
}
header button{
  float: right;
  height: 20px;
  font-size: 15px;
  padding: 5px;
  line-height: 5px;
}
.chat footer{
  display: flex;
}
.chat footer button{
  margin-left:10px;
}
.overflow-y-scroll{
  overflow-y: scroll;
}
.chat .card-body{
  padding: 0!important;
  display: flex;
  flex-direction: column-reverse;
}
.chat header{
  display: flex;
  flex-direction: column;
}
.zdrm-webphone-call-btn-ico{
  width:20px;
  height:20px;
  top: 8px;
  left: 8px;
}
.phone-prepend{
  display: flex;
  justify-content: space-between;
}
.uik-collapse{
    position: absolute;
    z-index: 100;
    background-color: white;
    left: 400px;
    height: 100%;
    overflow-y: scroll;
}
.phone-prepend p{
  margin: auto 0;
}
.off{
  pointer-events:none;
  opacity: 0.4;
}
.electie-table{
  padding-left: 0.5rem;
  border: 1px solid var(--cui-list-group-border-color, rgba(0, 0, 21, 0.125));
  border-top: none;
}
.zdrm-webphone-call-btn-custom{
  background-color: #fff;
  box-shadow: 0 0 4px rgba(0,0,0,.14);
  cursor: pointer;
  display: inline-block;
  transition: all .3s ease-in-out;
  float: right;
  width: 35px;
  height: 35px;
}
.phone-collapse{
  position: absolute;
  white-space: nowrap;
  margin: auto 0;
  right:55px;
  top:14px;
  width:0;
  overflow: hidden;
  transition: width 0.2s;
}
.zdrm-webphone-call-btn-custom:hover+.phone-collapse{
  width:110px;
}
</style>
