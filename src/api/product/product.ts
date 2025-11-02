import request from '../request';

export const findByPage = async (params: any) => {
  return await request.post('/api/code-generate/product/findByPage', { ...params });
};

export const saveOrUpdate = async (params: any) => {
  return await request.post('/api/code-generate/product/saveOrUpdate', { ...params });
};

export const deleteByIds = async (params: any) => {
  await request.post('/api/code-generate/product/deleteByIds', { ...params });
};

export const uploadImage = async (formData: any) => {
  return await request.post('/api/code-generate/product/uploadImage', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
