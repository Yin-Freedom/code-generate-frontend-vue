import request from '../request';

export const findByPage = async (params: any) => {
  return await request.post('/product/findByPage', { ...params });
};

export const saveOrUpdate = async (params: any) => {
  return await request.post('/product/saveOrUpdate', { ...params });
};

export const deleteByIds = async (params: any) => {
  await request.post('/product/deleteByIds', { ...params });
};

export const uploadImage = async (formData: any) => {
  return await request.post('/product/uploadImage', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
