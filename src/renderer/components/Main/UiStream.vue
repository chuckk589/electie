<template>
    <div class="stream-container">
        <div class="stream-block">
            <div class="recording-icon">Идет запись</div>
            <StreamBlock :recording="isRecording(0)" @violationRegistered="handleVideoUpload" @stateChange="switchView(0)" :bufferSize="backBufferSize" :source="this.$route.query.uik.stream_url_1" :active="isActive(0)"></StreamBlock>
            <!-- <StreamBlock :recording="isRecording(1)" @violationRegistered="handleVideoUpload" @stateChange="switchView(1)" :bufferSize="backBufferSize" :source="this.$route.query.uik.stream_url_2" :active="isActive(1)"></StreamBlock> -->
            <CButton @click="recording = !recording" :color="recording?'success':'danger'">{{recording?'Идет запись нарушения':'Начать запись нарушения'}}</CButton>
            <CButton @click="openFolder" color="primary" >Открыть папку с видео</CButton>
        </div>
    </div>
</template>

<script>
import StreamBlock from '../UiStream/StreamBlock.vue'
const {exec} = require('child_process')

export default {
    name: "UiStream",
    props: {
    },
    components: {
        StreamBlock
    },
    data() {
        return {
            activeCam:0,
            backBufferSize: null,
            recording:false,
        }
    },
    methods:{
        openFolder(){
            exec(`${this.$config.vlcPath} ${process.cwd()}/videos/${new Date().toLocaleDateString()}/Камера_1 ${process.cwd()}/videos/${new Date().toLocaleDateString()}/Камера_2`)
            //vlc "Song1.mp3" "Song2.mp3"
            //exec(`start ${process.cwd()}/videos/${new Date().toLocaleDateString()}`)
        },
        handleVideoUpload(res){
            console.log(res)
        },
        isRecording(id){
            return this.activeCam===id && this.recording === true
        },
        isActive(id){
            return this.activeCam===id
        },
        switchView(id){
            this.activeCam = id
        },
    },
    mounted: function(){
        this.backBufferSize = this.$config.stream_back_buffer_length
    },
}
</script>
<style >
.stream-block{
    position: relative;
    width: 100%;
}
.stream-container{
    display: flex;
    width: 100%;
    justify-content: center;
}
.recording-icon{
    right:5px;
    top:5px;
    font-weight: bold;
    color:red;
    position: absolute;
}
</style>