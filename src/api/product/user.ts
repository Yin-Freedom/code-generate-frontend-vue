import request from '../request';

export const login = async (params: any) => {
  return await request.post('/user/login', { ...params });
};

export const logout = async (params: any) => {
  return await request.post('/user/logout', { ...params });
};

export const getCurrentUser = async () => {
  return await request.post('/user/getCurrentUser', {});
};
