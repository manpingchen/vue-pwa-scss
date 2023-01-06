<template>
  <Navbar />

  <main>
    <router-view />
  </main>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
export default {
  components: {
    Navbar,
  },
};
</script>

<style lang="scss">
main {
}
</style>
