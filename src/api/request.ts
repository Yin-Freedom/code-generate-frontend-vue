import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// 定义响应数据的通用接口
interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 创建axios实例
const instance: AxiosInstance = axios.create({
  baseURL: process.env.NODE_ENV ? process.env.VUE_APP_API_BASE_URL || '/api' : 'https://baidu.com/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加token
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加请求日志
    console.log(
      `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
      config.params || config.data
    );

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;

    // 添加响应日志
    console.log(`[API Response] ${response.config.url}`, data);

    // 检查业务状态码
    if (data.code !== undefined && data.code !== 200) {
      const errorMessage = data.message || '请求失败';
      console.error('[API Business Error]', errorMessage);
      return Promise.reject(new Error(errorMessage));
    }

    // 直接返回响应数据包（保持 AxiosResponse 类型）
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    console.error('[API Response Error]', error);

    // 处理HTTP状态码错误
    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = data?.message || '请求失败';

      switch (status) {
        case 401:
          errorMessage = '未授权，请重新登录';
          // 清除token并跳转到登录页
          localStorage.removeItem('token');
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
        case 403:
          errorMessage = '权限不足';
          break;
        case 404:
          errorMessage = '请求资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        case 502:
          errorMessage = '网关错误';
          break;
        case 503:
          errorMessage = '服务不可用';
          break;
        default:
          errorMessage = `请求失败 (${status})`;
      }

      return Promise.reject(new Error(errorMessage));
    }

    // 处理网络错误
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时'));
    }

    if (!window.navigator.onLine) {
      return Promise.reject(new Error('网络连接失败'));
    }

    return Promise.reject(new Error('网络错误'));
  }
);

// 导出类型，方便其他文件使用
export type { ApiResponse };

export default instance;
