import request from '../request';

export interface TemplateQuery {
  page?: number;
  pageSize?: number;
  name?: string;
  status?: string;
}

export interface TemplatePayload {
  id?: number;
  name: string;
  coverUrl?: string;
  summary?: string;
  content?: string;
  creatorId?: number;
  status?: string;
}

export const findByPage = async (params: TemplateQuery) => {
  return await request.post('/template/findByPage', { ...params });
};

export const saveOrUpdate = async (params: TemplatePayload) => {
  return await request.post('/template/saveOrUpdate', { ...params });
};

export const deleteByIds = async (ids: number[]) => {
  return await request.post('/template/deleteByIds', { ids });
};

export const getDetail = async (id: number) => {
  return await request.post('/template/detail', { id });
};
