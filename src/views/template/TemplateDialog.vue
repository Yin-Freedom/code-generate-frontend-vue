<template>
  <a-modal
    v-model:open="modalOpen"
    :title="title"
    :confirm-loading="saving"
    :width="640"
    destroy-on-close
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form ref="formRef" layout="vertical" :model="formData" :rules="rules">
      <a-form-item label="模板名称" name="name">
        <a-input v-model:value="formData.name" :disabled="isView" placeholder="请输入模板名称" />
      </a-form-item>
      <a-form-item label="封面地址" name="coverUrl">
        <a-input
          v-model:value="formData.coverUrl"
          :disabled="isView"
          placeholder="请输入封面图片地址"
        />
      </a-form-item>
      <a-form-item label="摘要标签" name="summary">
        <a-textarea
          v-model:value="formData.summary"
          :disabled="isView"
          :rows="2"
          placeholder="使用逗号分隔多个标签"
        />
      </a-form-item>
      <a-form-item label="模板内容" name="content">
        <a-textarea
          v-model:value="formData.content"
          :disabled="isView"
          :rows="6"
          placeholder="请输入模板内容"
        />
      </a-form-item>
      <a-form-item label="状态" name="status">
        <a-select v-model:value="formData.status" :disabled="isView" placeholder="请选择状态">
          <a-select-option value="draft">草稿</a-select-option>
          <a-select-option value="published">已发布</a-select-option>
          <a-select-option value="archived">已归档</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
    <template v-if="isView" #footer>
      <a-button @click="handleCancel">关闭</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
import { saveOrUpdate } from '@/api/template/template';

interface TemplateModel {
  id?: number;
  name: string;
  coverUrl?: string;
  summary?: string;
  content?: string;
  status: 'draft' | 'published' | 'archived';
}

interface Props {
  open: boolean;
  mode: 'add' | 'edit' | 'view';
  record: TemplateModel | null;
}

interface Emits {
  (event: 'update:open', value: boolean): void;
  (event: 'success'): void;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  mode: 'add',
  record: null
});

const emit = defineEmits<Emits>();

const formRef = ref<FormInstance>();
const saving = ref(false);

const formData = reactive<TemplateModel>({
  id: undefined,
  name: '',
  coverUrl: '',
  summary: '',
  content: '',
  status: 'draft'
});

const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入模板名称' }],
  status: [{ required: true, message: '请选择状态' }]
};

const modalOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
});

const isView = computed(() => props.mode === 'view');

const title = computed(() => {
  if (props.mode === 'add') {
    return '新增模板';
  }
  if (props.mode === 'edit') {
    return '编辑模板';
  }
  return '模板详情';
});

const resetForm = () => {
  formRef.value?.resetFields();
  formData.id = undefined;
  formData.name = '';
  formData.coverUrl = '';
  formData.summary = '';
  formData.content = '';
  formData.status = 'draft';
};

const fillForm = (record: TemplateModel | null) => {
  resetForm();
  if (record) {
    formData.id = record.id;
    formData.name = record.name;
    formData.coverUrl = record.coverUrl;
    formData.summary = record.summary;
    formData.content = record.content;
    formData.status = record.status;
  }
  if (isView.value) {
    formRef.value?.clearValidate();
  }
};

watch(
  () => props.open,
  value => {
    if (value) {
      fillForm(props.record);
    } else {
      resetForm();
    }
  }
);

const handleOk = async () => {
  if (isView.value) {
    emit('update:open', false);
    return;
  }
  try {
    const valid = await formRef.value?.validate();
    if (!valid) {
      return;
    }
    saving.value = true;
    await saveOrUpdate({
      id: formData.id,
      name: formData.name,
      coverUrl: formData.coverUrl,
      summary: formData.summary,
      content: formData.content,
      status: formData.status
    });
    message.success(props.mode === 'add' ? '新增成功' : '更新成功');
    emit('success');
  } catch (error) {
    console.error('保存模板失败', error);
    message.error('保存模板失败');
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  emit('update:open', false);
};
</script>

<style scoped></style>
