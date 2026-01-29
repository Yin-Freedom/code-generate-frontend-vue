import request from '../request';

export const login = async (params: object) => {
  return await request.post('/user/login', { ...params });
};

export const logout = async (params: object) => {
  return await request.post('/user/logout', { ...params });
};

export const getCurrentUser = async () => {
  return await request.post('/user/getCurrentUser', {});
};
