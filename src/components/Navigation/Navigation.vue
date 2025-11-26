<template>
  <div>
    <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" @click="handleClick" />
  </div>
</template>
<script lang="ts" setup>
import { h, ref, computed } from 'vue';
import { SettingOutlined } from '@ant-design/icons-vue';
import { MenuProps } from 'ant-design-vue';
import { useRouter } from 'vue-router';

const router = useRouter();
router.afterEach(to => {
  current.value = [to.path as string];
});

const current = ref<string[]>(['/']);

// 根据路由自动生成菜单项
const items = computed<MenuProps['items']>(() => {
  return router
    .getRoutes()
    .filter(route => route.meta?.description && route.path)
    .map(route => ({
      key: route.path,
      label: route.meta.description,
      icon: route.meta.icon === 'setting' ? () => h(SettingOutlined) : undefined
    }));
});

function handleClick(e: { key: string }) {
  router.push({
    path: e.key
  });
}
</script>
