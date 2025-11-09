<template>
  <div class="p-6">
    <!-- 筛选区域 -->
    <a-card class="mb-4" :bordered="false">
      <a-form layout="inline" :model="searchForm" @finish="handleSearch">
        <a-form-item label="产品名称">
          <a-input v-model:value="searchForm.name" placeholder="请输入产品名称" :maxlength="10" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择状态"
            allow-clear
            style="width: 120px"
          >
            <a-select-option value="true">启用</a-select-option>
            <a-select-option value="false">禁用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 操作区域 -->
    <a-card :bordered="false">
      <div class="mb-4">
        <a-space>
          <a-button type="primary" @click="handleAdd">新增</a-button>
          <a-dropdown>
            <template #overlay>
              <a-menu>
                <a-menu-item v-for="col in columns" :key="col.key">
                  <a-checkbox v-model:checked="col.visible" @change="handleColumnVisibility">
                    {{ col.title }}
                  </a-checkbox>
                </a-menu-item>
              </a-menu>
            </template>
            <a-button> 列设置 <DownOutlined /> </a-button>
          </a-dropdown>
        </a-space>
      </div>

      <!-- 表格 -->
      <a-table
        :columns="visibleColumns"
        :data-source="tableData"
        :pagination="false"
        :loading="loading"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'category'">
            {{ getCategoryLabel(record.category) }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'true' ? 'green' : 'red'">
              {{ record.status === 'true' ? '启用' : '禁用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm title="确定删除吗？" @confirm="handleDelete(record.id)">
                <a-button type="link" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>

      <!-- 分页 -->
      <a-pagination
        v-model:current="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :show-size-changer="true"
        :show-quick-jumper="true"
        :show-total="(total: number) => `共 ${total} 条`"
        style="margin-top: 16px; text-align: right"
        @change="handlePageChange"
        @show-size-change="handlePageSizeChange"
      />
    </a-card>

    <!-- 产品对话框 -->
    <ProductDialog
      v-model:open="dialog.open"
      :type="dialog.type"
      :record="dialog.record"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { DownOutlined } from '@ant-design/icons-vue';
import ProductDialog from './ProductDialog.vue';
import { findByPage, deleteByIds } from '@/api/product/product';
import { categoryOptions } from './constants';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  status: 'true' | 'false';
  createTime: string;
  description: string;
  images: string[];
}

interface Column {
  key: string;
  title: string;
  dataIndex: string;
  visible: boolean;
  width?: number;
}

onMounted(() => {
  fetchData();
});

// 搜索表单
const searchForm = reactive({
  name: '',
  status: undefined
});

// 表格数据
const tableData = ref<Product[]>([]);
const loading = ref(false);

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});

// 列配置
const columns = ref<Column[]>([
  { key: 'name', title: '产品名称', dataIndex: 'name', visible: true },
  { key: 'price', title: '价格', dataIndex: 'price', visible: true, width: 120 },
  { key: 'category', title: '分类', dataIndex: 'category', visible: true },
  { key: 'status', title: '状态', dataIndex: 'status', visible: true, width: 100 },
  { key: 'createTime', title: '创建时间', dataIndex: 'createTime', visible: true, width: 180 },
  { key: 'action', title: '操作', dataIndex: 'action', visible: true, width: 150 }
]);

// 可见列
const visibleColumns = computed(() => columns.value.filter(col => col.visible));

// 对话框
const dialog = reactive({
  open: false,
  type: 'add' as 'add' | 'edit',
  record: null as Product | null
});

// 根据分类value获取label
const getCategoryLabel = (value: string) => {
  const option = categoryOptions.find(item => item.value === value);
  return option ? option.label : value;
};

// 获取列表数据
const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm
    };
    const response = await findByPage(params);
    tableData.value = response.data.list;
    pagination.total = response.data.total;
  } catch (error) {
    message.error('获取数据失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    status: undefined
  });
  handleSearch();
};

// 新增
const handleAdd = () => {
  dialog.open = true;
  dialog.type = 'add';
  dialog.record = null;
};

// 编辑
const handleEdit = (record: Product) => {
  dialog.open = true;
  dialog.type = 'edit';
  dialog.record = record;
};

// 删除
const handleDelete = async (id: number) => {
  try {
    await deleteByIds({ ids: [id] });
    message.success('删除成功');
    // 删除后如果当前页没有数据了，返回上一页
    if (tableData.value.length === 1 && pagination.current > 1) {
      pagination.current = pagination.current - 1;
    }
    await fetchData();
  } catch (error: any) {
    console.error('删除失败:', error);
    const errorMessage = error?.response?.data?.message || '删除失败';
    message.error(errorMessage);
  }
};

// 分页变化
const handlePageChange = (page: number, pageSize: number) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  fetchData();
};

const handlePageSizeChange = (current: number, size: number) => {
  pagination.current = 1;
  pagination.pageSize = size;
  fetchData();
};

// 列显示隐藏
const handleColumnVisibility = () => {
  // 触发响应式更新
};

// 对话框成功回调
const handleSuccess = () => {
  dialog.open = false;
  fetchData();
};
</script>

<style scoped></style>
