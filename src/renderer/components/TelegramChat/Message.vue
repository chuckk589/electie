<template>
    <div class="message-body">
        <div class="message-sender" @click="addNick">{{messageEntity.user.username}}<span class="message-date">{{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}}</span></div>
        <div class="message-text" v-html="replaceURLs(messageEntity.message)"></div>
    </div>
</template>

<script>

export default {
  name: 'ChatMessage',
  props:{
      messageEntity:Object
  },
  data () {
    return {
    }
  },
  methods:{
    replaceURLs(message) {
      if (!message) return;
      const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
      return message.replace(urlRegex, function (url) {
        let hyperlink = url;
        if (!hyperlink.match('^https?:\/\/')) {
          hyperlink = 'http://' + hyperlink;
        }
        return '<a href="' + hyperlink + '" target="_blank" rel="noopener noreferrer">' + url + '</a>'
      });
    },
    addNick(){
      this.$emit('nick-clicked')
    }
  }
}
</script>
<style scoped>
 .message-text{
   width:100%
 }
 .message-date{
   font-size: 12px;
   float: right;
 }
 .message-sender{
   width:100%;
   margin-bottom:5px;
 }
 .message-sender:hover{
   cursor: pointer;
 }
</style>