<template>
  <div class="basic-layout">
    <a-layout class="min-h-screen">
      <a-layout-header class="mb-4 px-5 !bg-white"><Navigation /></a-layout-header>
      <a-layout-content class="p-5 mb-5">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="!bg-gray-200 text-center fixed bottom-0 left-0 right-0 p-4">
        <a href="https://github.com/Yin-Freedom" target="_blank"> Yin-Freedom </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import Navigation from '@/components/Navigation/Navigation.vue';
</script>

<style scoped>
.basic-layout {
  display: flex;
  flex-direction: column;
}
</style>
