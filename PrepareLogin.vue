<template lang="html">
  <div v-show="PdogLoad" class="prepare-login-container">
    <img class="suki-logo" src="https://app.sellsuki.com/img/dog_loading.gif">
  </div>
</template>

<script>
export default {
  data () {
    return {
      PdogLoad: true
    }
  },
  name: 'PrepareLogin',
  props: ['storeId'],
  created () {
    if (this.storeId) {
      this.$sellsuki_auth.initLocalStorage(this.storeId)
    } else {
      this.$sellsuki_auth.initLocalStorage(0)
    }
  }
}
</script>

<style scoped>
  .suki-logo {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  }

  .prepare-login-container {
    background: white;
    position: absolute;
    left: 0px;
    right: 0px;
    top: 0px;
    bottom: 0px;
  }
</style>
