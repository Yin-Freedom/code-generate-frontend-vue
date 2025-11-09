<template>
  <div class="p-4">
    <a-row :gutter="[16, 16]">
      <a-col v-for="route in availableRoutes" :key="route.name" :span="6">
        <a-card hoverable @click="navigateTo(route.name)">
          <a-card-meta :title="route?.meta.description || route.name">
            <template #description>{{ route.path }}</template>
          </a-card-meta>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Row, Col, Card } from 'ant-design-vue';

defineOptions({
  name: 'HomeView',
  components: {
    'a-row': Row,
    'a-col': Col,
    'a-card': Card,
    'a-card-meta': Card.Meta
  }
});

const router = useRouter();

const availableRoutes = computed(() =>
  router.getRoutes().filter(route => route.name && route.name !== 'home')
);
const navigateTo = (routeName?: string | symbol) => {
  if (!routeName) return;
  router.push({ name: routeName });
};
</script>
