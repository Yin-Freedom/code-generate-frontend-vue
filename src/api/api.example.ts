// API 使用示例文件
import request, { ApiResponse } from './request';

// 定义用户数据接口
interface User {
  id: number;
  name: string;
  email: string;
}

// 定义登录请求参数
interface LoginParams {
  username: string;
  password: string;
}

// 定义登录响应数据
interface LoginResponse {
  token: string;
  user: User;
}

// API 函数示例
export const userApi = {
  // 用户登录
  login: (params: LoginParams): Promise<ApiResponse<LoginResponse>> => {
    return request.post('/auth/login', params);
  },

  // 获取用户信息
  getUserInfo: (): Promise<ApiResponse<User>> => {
    return request.get('/user/info');
  },

  // 获取用户列表
  getUserList: (page = 1, size = 10): Promise<ApiResponse<User[]>> => {
    return request.get('/users', {
      params: { page, size }
    });
  },

  // 创建用户
  createUser: (userData: Omit<User, 'id'>): Promise<ApiResponse<User>> => {
    return request.post('/users', userData);
  },

  // 更新用户
  updateUser: (id: number, userData: Partial<User>): Promise<ApiResponse<User>> => {
    return request.put(`/users/${id}`, userData);
  },

  // 删除用户
  deleteUser: (id: number): Promise<ApiResponse<null>> => {
    return request.delete(`/users/${id}`);
  }
};

// 在 Vue 组件中的使用示例：
/*
import { userApi } from '@/common/api.example';

// 在组件方法中使用
const handleLogin = async () => {
  try {
    const response = await userApi.login({
      username: 'test@example.com',
      password: 'password123'
    });
    
    if (response.code === 200) {
      // 登录成功
      console.log('用户信息:', response.data.user);
      localStorage.setItem('token', response.data.token);
    } else {
      // 处理业务错误
      console.error('登录失败:', response.message);
    }
  } catch (error) {
    // 处理网络错误或其他异常
    console.error('请求失败:', error);
  }
};
*/
