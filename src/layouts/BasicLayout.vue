<template>
  <div class="h-screen flex flex-col">
    <a-layout class="flex flex-col flex-1">
      <a-layout-header class="mb-4 px-5 !bg-white"><Navigation /></a-layout-header>
      <a-layout-content class="p-5 mb-5 overflow-y-auto overflow-x-hidden">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="!bg-gray-200">
        <a href="https://github.com/Yin-Freedom" target="_blank"> Yin-Freedom </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import Navigation from '@/components/Navigation/Navigation.vue';
</script>

<style scoped></style>
