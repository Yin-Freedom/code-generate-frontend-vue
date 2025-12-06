<template>
  <div class="template-page p-6">
    <a-card :bordered="false" class="mb-4">
      <a-form layout="inline" :model="searchForm" @finish="handleSearch">
        <a-form-item label="模板名称">
          <a-input
            v-model:value="searchForm.name"
            allow-clear
            placeholder="请输入模板名称"
            @press-enter="handleSearch"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="searchForm.status"
            allow-clear
            placeholder="请选择状态"
            style="width: 160px"
          >
            <a-select-option value="draft">草稿</a-select-option>
            <a-select-option value="published">已发布</a-select-option>
            <a-select-option value="archived">已归档</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card :bordered="false">
      <div class="mb-4 flex justify-between items-center">
        <div class="font-medium text-base">模板列表</div>
        <a-button type="primary" @click="handleAdd">新增模板</a-button>
      </div>

      <a-spin :spinning="loading">
        <a-row :gutter="[16, 16]">
          <a-col v-for="item in list" :key="item.id" :span="6">
            <a-card class="template-card" hoverable @click="handleView(item)">
              <template #cover>
                <div class="card-cover">
                  <a-image
                    v-if="item.coverUrl"
                    :src="item.coverUrl"
                    :alt="`${item.name}-cover`"
                    :preview="false"
                    class="cover-image"
                    fit="contain"
                    fallback="https://via.placeholder.com/320x180?text=No+Image"
                  />
                  <div v-else class="cover-placeholder">无封面</div>
                </div>
              </template>
              <a-card-meta :title="item.name">
                <template #description>
                  <div class="card-description">
                    <a-tag :color="getStatusMeta(item.status).color" class="status-tag">
                      {{ getStatusMeta(item.status).label }}
                    </a-tag>
                    <a-space v-if="item.tags.length" size="small" wrap>
                      <a-tag v-for="tag in item.tags" :key="tag" color="blue">{{ tag }}</a-tag>
                    </a-space>
                    <div class="meta-line">
                      创建人：{{ item.creatorName || getCreatorFallback(item) }}
                    </div>
                    <div class="meta-line">使用次数：{{ item.usageCount }}</div>
                  </div>
                </template>
              </a-card-meta>
              <template #actions>
                <a-button type="link" @click.stop="handleEdit(item)">编辑</a-button>
                <a-popconfirm title="确定删除该模板吗？" @confirm="handleDelete(item.id)">
                  <a-button type="link" danger @click.stop>删除</a-button>
                </a-popconfirm>
              </template>
            </a-card>
          </a-col>
        </a-row>
        <a-empty v-if="!loading && !list.length" class="mt-8" description="暂无模板数据" />
      </a-spin>

      <div class="pagination">
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-size-options="['8', '16', '24', '32']"
          :show-size-changer="true"
          :show-quick-jumper="true"
          :show-total="(total: number) => `共 ${total} 条`"
          @change="handlePageChange"
          @show-size-change="handlePageSizeChange"
        />
      </div>
    </a-card>

    <TemplateDialog
      v-model:open="dialog.open"
      :mode="dialog.mode"
      :record="dialog.record"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import TemplateDialog from './TemplateDialog.vue';
import { findByPage, deleteByIds } from '@/api/template/template';

type TemplateStatus = 'draft' | 'published' | 'archived';

interface TemplateModel {
  id?: number;
  name: string;
  coverUrl?: string;
  summary?: string;
  content?: string;
  status: TemplateStatus;
}

interface TemplateListItem extends TemplateModel {
  creatorId?: number;
  creatorName?: string;
  usageCount: number;
  createdTime?: string;
  updatedTime?: string;
  tags: string[];
}

interface TemplateResponseItem {
  id: number;
  name: string;
  coverUrl?: string;
  summary?: string;
  content?: string;
  status?: TemplateStatus;
  creatorId?: number;
  creatorName?: string;
  usageCount?: number;
  createdTime?: string;
  updatedTime?: string;
}

const loading = ref(false);
const list = ref<TemplateListItem[]>([]);

const searchForm = reactive({
  name: '',
  status: undefined as TemplateStatus | undefined
});

const pagination = reactive({
  current: 1,
  pageSize: 8,
  total: 0
});

const dialog = reactive({
  open: false,
  mode: 'add' as 'add' | 'edit' | 'view',
  record: null as TemplateModel | null
});

const statusMetaMap: Record<TemplateStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  published: { label: '已发布', color: 'green' },
  archived: { label: '已归档', color: 'orange' }
};

const getStatusMeta = (status: TemplateStatus) => statusMetaMap[status] || statusMetaMap.draft;

const getCreatorFallback = (item: TemplateListItem) =>
  item.creatorId ? `用户 #${item.creatorId}` : '未知创建人';

const parseTags = (summary?: string) =>
  summary
    ? summary
        .split(/[，,]/)
        .map(tag => tag.trim())
        .filter(Boolean)
    : [];

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined,
      status: searchForm.status || undefined
    };
    const response = await findByPage(params);
    const source = (response?.data?.list ?? []) as TemplateResponseItem[];
    const records: TemplateListItem[] = source.map(item => ({
      id: item.id,
      name: item.name,
      coverUrl: item.coverUrl,
      summary: item.summary,
      content: item.content,
      status: item.status || 'draft',
      creatorId: item.creatorId,
      creatorName: item.creatorName,
      usageCount: item.usageCount ?? 0,
      createdTime: item.createdTime,
      updatedTime: item.updatedTime,
      tags: parseTags(item.summary)
    }));
    list.value = records;
    pagination.total = response?.data?.total ?? 0;
  } catch (error) {
    console.error('获取模板列表失败', error);
    message.error('获取模板列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

const handleReset = () => {
  searchForm.name = '';
  searchForm.status = undefined;
  handleSearch();
};

const handleAdd = () => {
  dialog.mode = 'add';
  dialog.record = null;
  dialog.open = true;
};

const toTemplateModel = (item: TemplateListItem): TemplateModel => ({
  id: item.id,
  name: item.name,
  coverUrl: item.coverUrl,
  summary: item.summary,
  content: item.content,
  status: item.status
});

const handleView = (item: TemplateListItem) => {
  dialog.mode = 'view';
  dialog.record = toTemplateModel(item);
  dialog.open = true;
};

const handleEdit = (item: TemplateListItem) => {
  dialog.mode = 'edit';
  dialog.record = toTemplateModel(item);
  dialog.open = true;
};

const handleDelete = async (id?: number) => {
  if (!id) {
    return;
  }
  try {
    await deleteByIds([id]);
    message.success('删除成功');
    if (list.value.length === 1 && pagination.current > 1) {
      pagination.current -= 1;
    }
    fetchData();
  } catch (error) {
    console.error('删除模板失败', error);
    message.error('删除模板失败');
  }
};

const handlePageChange = (page: number) => {
  pagination.current = page;
  fetchData();
};

const handlePageSizeChange = (_: number, size: number) => {
  pagination.current = 1;
  pagination.pageSize = size;
  fetchData();
};

const handleSuccess = () => {
  dialog.open = false;
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.template-page {
  min-height: 100%;
}

.template-card {
  height: 100%;
}

.card-cover {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  overflow: hidden;
  padding: 12px;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cover-placeholder {
  color: #999;
  font-size: 14px;
}

.card-description {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #595959;
}

.status-tag {
  width: fit-content;
}

.meta-line {
  line-height: 1.4;
}

.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
