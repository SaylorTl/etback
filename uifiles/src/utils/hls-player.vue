<template>
    <div class="container">
        <div class="player">
            <video-player class="video-player vjs-custom-skin" ref="videoPlayer" :playsinline="true" :options="playerOptions" v-if='isPlaying' @play="onPlayerPlay($event)" @pause="onPlayerPause($event)">
            </video-player>
        </div>
    </div>
</template>

<script>
import { videoPlayer } from 'vue-video-player';
import videojs from 'video.js'
window.videojs = videojs
require('videojs-contrib-hls/dist/videojs-contrib-hls');
export default {
    props: ['src'],
    data() {
        return {
            isPlaying:true,
            playerOptions: {
                autoplay: false,  
                muted: false,  
                loop: false,  
                live: true,
                preload: 'auto', 
                language: 'zh-CN',
                aspectRatio: '16:9',  
                fluid: true, 
                sources: {
                    type: "application/x-mpegURL",
                    src: this.src
                },
                notSupportedMessage: '此视频暂无法播放，请稍后再试', //
            }
        }
    },
    watch:{
        src(val){
            console.log(val)
            this.isPlaying=!!val;
            this.playerOptions.sources.src=val
        }
    },
    
    components: {
        videoPlayer
    },
    methods: {
        onPlayerPlay(player) {
            console.log("play");
        },
        onPlayerPause(player) {
            console.log("pause");
        },
    },
    
    computed: {
        player() {
            return this.$refs.videoPlayer.player
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style type="text/css" scoped>
 .container {
    background-color: #efefef;
    min-height: 100%;
 }
</style>