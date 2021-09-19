<template>
  <CCard>
    <CCardHeader>
      <strong>Выбор УИК для наблюдения</strong>
    </CCardHeader>
    <CCardBody>
      <CListGroup>
        <CListGroupItem v-for="(uik) in uiks" :key="uik.id" @click="handleUik(uik.id)" tag="button">Участковая избирательная комиссия №{{uik.uik_id}}</CListGroupItem>
      </CListGroup>
    </CCardBody>
  </CCard>
</template>

<script>
export default {
  name: 'rooms',
  data () {
    return {
      uiks:[]
    }
  },
  mounted(){
    this.uiks = this.$route.query.chats.map(c=>c.uik)
  },
  methods:{
    handleUik(id){
      const chat = this.$route.query.chats.find(c=>c.uik.id === id)
      let {uik,chatAssignment, ...rest} = chat
      uik.chat = rest
      this.$router.push({ name: 'main', query: { uik: uik} })
    }
  }
}
</script>
<style>
#room-container, .single-uik{
  display: flex;
  flex-direction: column;
}
.single-uik{
  margin-bottom: 5px;
  border: 1px solid black;
}
.single-uik:hover{
  background-color: rgba(128,128,128,0.75);
  cursor: pointer;
  color:white;
}
</style>

