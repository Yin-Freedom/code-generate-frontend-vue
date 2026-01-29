import request from '../request';

export const findByPage = async (params: object) => {
  return await request.post('/product/findByPage', { ...params });
};

export const saveOrUpdate = async (params: object) => {
  return await request.post('/product/saveOrUpdate', { ...params });
};

export const deleteByIds = async (params: object) => {
  await request.post('/product/deleteByIds', { ...params });
};

export const uploadImage = async (formData: object) => {
  return await request.post('/product/uploadImage', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
