<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'electie'
  }
</script>

<style lang="scss">
  // Import Main styles for this application
  @import 'assets/scss/style';
  @font-face {
  font-family: "Inter";
  src: local("Inter"),
   url(./assets/fonts/Inter/static/Inter-Regular.ttf) format("truetype");
}
 #app{
   font-family: Inter!important;
 }
</style>