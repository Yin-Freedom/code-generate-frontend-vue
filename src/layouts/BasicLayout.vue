<template>
  <div class="flex flex-col min-h-screen" style="min-width: 1200px; min-height: 600px">
    <a-layout class="flex flex-col min-h-screen">
      <a-layout-header class="mb-4 px-5 !bg-white"><Navigation /></a-layout-header>
      <a-layout-content class="flex-auto overflow-y-auto p-5 mb-5">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="fixed text-center bottom-0 left-0 right-0 p-4 !bg-gray-200">
        <a href="https://github.com/Yin-Freedom" target="_blank"> Yin-Freedom </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import Navigation from '@/components/Navigation/Navigation.vue';
</script>

<style scoped></style>
