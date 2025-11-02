import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getCurrentUser } from '@/api/product/user';

export const loginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<any>({
    userName: '未登录',
  });

  const fetchLoginUser = async () => {
    const res = await getCurrentUser();
    if (res.data.code === 0 && res.data.data) {
      loginUser.value = res.data.data;
    }
  };

  return { loginUser, fetchLoginUser };
});
