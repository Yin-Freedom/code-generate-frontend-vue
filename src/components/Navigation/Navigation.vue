<template>
  <div>
    <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" @click="handleClick" />
  </div>
</template>
<script lang="ts" setup>
import { h, ref } from 'vue';
import { SettingOutlined } from '@ant-design/icons-vue';
import { MenuProps } from 'ant-design-vue';
import { useRouter } from 'vue-router';

const router = useRouter();
router.afterEach(to => {
  current.value = [to.path as string];
});

const current = ref<string[]>(['/']);
const items = ref<MenuProps['items']>([
  {
    key: '/',
    label: '主页',
  },
  {
    key: '/about',
    icon: () => h(SettingOutlined),
    label: '关于',
  },
  {
    key: '/product',
    label: '产品管理',
  },
]);

function handleClick(e: { key: string }) {
  router.push({
    path: e.key,
  });
}
</script>
