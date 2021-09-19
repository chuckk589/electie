<template>
    <div class="stream-video-container" :class="calcBoxClasses">
        <!-- <video controls @click="switchView" :style="calcWidth" ref="camera"></video> -->
        
  <iframe src="http://www.youtube.com/embed/Va8rk-RyDcs"></iframe>
  
  <!-- <video muted autoplay src="http://clips.vorwaerts-gmbh.de/VfE.ogv"></video> -->
        <!-- :controls="active" -->
    </div>
</template>

<script>
//const Hls = require('hls.js')

import RecordRTC from 'recordrtc';
const fs = require('fs')

const {exec} = require('child_process')

export default {
    name: "StreamBlock",
    props: {
        recording:Boolean,
        source:String,
        active:Boolean,
        bufferSize:[Number,String]
    },
    data() {
        return {
            recStartSec:0,
            recEndSec:0,
            cameraNum:0,
            currentStreamFile:'',
            currentViolationFolder:''
        }
    },
    computed:{
        calcBoxClasses(){
            return this.active? '' :'passive-vid'
        },
        calcWidth(){
            const main = 'width:100%'
            const off = 'width:30%'
            return this.active? main : off
        },
    },
    methods:{
        async initStream(){
    //        setTimeout(() => {
    //            var canvas = document.querySelector("iframe").contentWindow.document.querySelector(".video-stream");
    //         //    var canvas = document.querySelector(".video-stream");
    // console.log(canvas)
    //         // Optional frames per second argument.
    //         var stream = canvas.captureStream(25);
    //         var recordedChunks = [];

    //         console.log(stream);
    //         var options = { mimeType: "video/webm; codecs=vp9" };
    //         var mediaRecorder = new MediaRecorder(stream, options);

    //         mediaRecorder.ondataavailable = (event) =>{
    //             console.log("data-available");
    //             if (event.data.size > 0) {
    //                 recordedChunks.push(event.data);
    //                 console.log(recordedChunks);
    //             } else {
    //                 // ...
    //             }
    //         };
    //         mediaRecorder.start();


    //         // demo: to download after 9sec
    //         setTimeout(event => {
    //         console.log("stopping");
    //         mediaRecorder.stop();
    //         }, 9000);
    //        }, 5000);

            // const hls = new Hls({
            //     liveDurationInfinity:true,
            //     startPosition: 0,
            //     startLevel: 6,
            //     backBufferLength:0,
            //     // liveSyncDurationCount:1,
            //     // liveMaxLatencyDurationCount:2
            // });
            // const video = this.$refs.camera
            // const date = new Date().toLocaleDateString()
            // const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(/:/g,'-')
            // if (!fs.existsSync(`./videos/${date}/Камера_${this.cameraNum}/`)){
            //     fs.mkdirSync(`./videos/${date}/Камера_${this.cameraNum}/`, { recursive: true });
            //     fs.mkdirSync(`./videos/${date}/Нарушения/`, { recursive: true });
            // }
            // this.currentStreamFile = `videos/${date}/Камера_${this.cameraNum}/${time}.ts`
            // this.currentViolationFolder = `videos/${date}/Нарушения`
            // //hls.loadSource(this.source);
            // hls.loadSource('https://www.youtube.com/watch?v=K1JvNq7KTLY')
            // hls.attachMedia(video);
            // hls.on(Hls.Events.MANIFEST_PARSED,  (event,data) => {
            //     hls.on(Hls.Events.BUFFER_APPENDING,  (event, data) => {
            //         if(data.type == 'video'){
            //             fs.appendFile(`./videos/${date}/Камера_${this.cameraNum}/${time}.ts`, Buffer.from(data.data), (e)=>{});
            //             //hls.trigger(Event.BUFFER_FLUSHING, {startOffset: xxx , endOffset: yyy, type : 'main'});
            //         }
            //     }); 
            //     video.play();
            // });
        },
        switchView(e){
            this.$emit('stateChange')
            e.preventDefault()
        },
        startRecord(){
            console.log(this.$refs.camera.currentTime - this.$config.stream_back_buffer_length)
            this.$root.$emit('chatMessage','Внимание! Обнаружено нарушение!')
            this.recStartSec = this.$refs.camera.currentTime - this.$config.stream_back_buffer_length
        },
        endRecord(){
            this.recEndSec = this.$refs.camera.currentTime
            this.makeRecord()
        },
        makeRecord(){
            const filename = `нарушение_${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(/:/g,'_')}.ts`
            const cmd = `${process.cwd()}/node_modules/ffmpeg-static/ffmpeg.exe -i ${process.cwd()}/${this.currentStreamFile} -ss ${new Date((this.recStartSec > 0? this.recStartSec: 0) * 1000).toISOString().substr(11, 8)} -t ${new Date(this.recEndSec * 1000).toISOString().substr(11, 8)} -async 1 ${process.cwd()}/${this.currentViolationFolder}/${filename}`
            console.log(cmd)
            exec(cmd, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    this.publishVk(filename)
                }
            })
        },
        publishVk(filename){
            const group_url = `${this.$config.vk_video_group_id?`&group_id=${this.$config.vk_video_group_id}`:''}`
            const album_url = `&album_id=${this.$route.query.uik.vk_album_id}`
            const time_range = `${new Date(Date.now() - (this.recEndSec - this.recStartSec)*1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            const name = `&name=УИК ${this.$route.query.uik.uik_id} Нарушение ${new Date().toLocaleDateString()}, ${time_range}, Камера №${this.cameraNum}`
            const url = `https://api.vk.com/method/video.save?v=5.81&access_token=${this.$config.vk_access_token}${group_url}${album_url}${name}`
            this.$http.post(url)
            .then(e => {
              if(e.data.response.upload_url){
                let formData = new FormData();
                const violation = fs.readFileSync(`./${this.currentViolationFolder}/${filename}`)
                const vid = new File([violation], filename)
                formData.append('video_file', vid);
                this.$http.post(e.data.response.upload_url, formData)
                .then(e => {
                    this.registerViolation(`https://vk.com/video${e.data.owner_id}_${e.data.video_id}`)
                })
                .catch(e=>console.log(e))
              }
            }).catch(e=>console.log(e))
        },
        registerViolation(vidlink){
            this.$http.put(`${this.$config.server}/v1/uik/violation`, {
                chat:this.$route.query.uik.chat,
                user:this.$store.state.user,
                vidLink:vidlink
            }).catch(e=>console.log(e))
        }
    },
    watch:{
        recording: function(n,o){
            if(n){
                this.startRecord()
            }else{
                this.endRecord()
            }
        }
    },
    mounted() {
        this.cameraNum = +this.active + 1
        this.initStream()
    },
}
</script>
<style >
.passive-vid{
    position:absolute;
    z-index: 1;
    top: 0;
}
video{
    height: auto;
}
video:hover{
    cursor: pointer;
}
video::-webkit-media-controls-play-button{
  display: none!important;
}
</style>