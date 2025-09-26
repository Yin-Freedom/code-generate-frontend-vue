<template>
  <a-form
    ref="formRef"
    :model="localFormData"
    :rules="rules"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 18 }"
    @validate="handleValidate"
  >
    <a-form-item label="产品名称" name="name">
      <a-input
        v-model:value="localFormData.name"
        placeholder="请输入产品名称"
        :maxlength="50"
        show-count
        @change="emitFormDataChange"
      />
    </a-form-item>

    <a-form-item label="价格" name="price">
      <a-input-number
        v-model:value="localFormData.price"
        placeholder="请输入价格"
        :min="0"
        :precision="2"
        style="width: 100%"
        addon-after="元"
        @change="emitFormDataChange"
      />
    </a-form-item>

    <a-form-item label="分类" name="category">
      <a-select
        v-model:value="localFormData.category"
        placeholder="请选择分类"
        :options="categoryOptions"
        @change="emitFormDataChange"
      />
    </a-form-item>

    <a-form-item label="状态" name="status">
      <a-switch
        v-model:checked="localFormData.status"
        checked-children="启用"
        un-checked-children="禁用"
        @change="emitFormDataChange"
      />
    </a-form-item>

    <a-form-item label="产品描述" name="description">
      <a-textarea
        v-model:value="localFormData.description"
        placeholder="请输入产品描述"
        :rows="4"
        :maxlength="500"
        show-count
        @change="emitFormDataChange"
      />
    </a-form-item>

    <a-form-item label="产品图片" name="images">
      <a-upload
        v-model:file-list="fileList"
        list-type="picture-card"
        :before-upload="beforeUpload"
        :custom-request="customRequest"
        @preview="handlePreview"
        @remove="handleRemove"
      >
        <div v-if="fileList.length < 8">
          <PlusOutlined />
          <div style="margin-top: 8px">上传图片</div>
        </div>
      </a-upload>
    </a-form-item>
  </a-form>

  <!-- 图片预览 -->
  <a-modal v-model:visible="previewVisible" title="图片预览" :footer="null">
    <img :src="previewImage" style="width: 100%" alt="预览图片" />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import type { UploadFile, UploadProps } from 'ant-design-vue';
import { uploadImage } from '@/api/product/product';

interface Product {
  name: string;
  price: number;
  category: string;
  status: 'active' | 'inactive';
  description: string;
  images: string[];
}

interface Props {
  formData: Product;
  rules: Record<string, unknown>;
}

interface Emits {
  (e: 'update:formData', value: Product): void;
  (e: 'form-valid-change', valid: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 表单引用
const formRef = ref();

// 使用本地响应式数据，避免循环更新
const localFormData = reactive<Product>({
  name: '',
  price: 0,
  category: '',
  status: 'active',
  description: '',
  images: [],
});

// 分类选项
const categoryOptions = [
  { label: '电子产品', value: 'electronics' },
  { label: '服装', value: 'clothing' },
  { label: '家居', value: 'home' },
  { label: '图书', value: 'books' },
  { label: '运动', value: 'sports' },
];

// 文件上传
const fileList = ref<UploadFile[]>([]);
const previewVisible = ref(false);
const previewImage = ref('');
const isUpdatingFileList = ref(false);

// 添加防止循环更新的标志
const isInternalUpdate = ref(false);
const isValidating = ref(false);

// 初始化文件列表
const initFileList = (images: string[]) => {
  if (isUpdatingFileList.value) return;

  fileList.value = images.map((url, index) => ({
    uid: `image-${index}-${Date.now()}`,
    name: `image-${index}`,
    status: 'done' as const,
    url,
    response: { url },
  }));
};

// 监听props变化，同步到本地数据 - 移除 deep: true，添加防循环标志
watch(
  () => props.formData,
  newFormData => {
    if (newFormData && !isInternalUpdate.value) {
      isInternalUpdate.value = true;

      Object.assign(localFormData, {
        ...newFormData,
        images: newFormData.images || [],
      });

      // 同步更新文件列表
      if (newFormData.images && Array.isArray(newFormData.images)) {
        initFileList(newFormData.images);
      }

      nextTick(() => {
        isInternalUpdate.value = false;
      });
    }
  },
  { immediate: true }
);

// 发射表单数据变化 - 移除自动验证调用
const emitFormDataChange = () => {
  if (!isInternalUpdate.value && !isValidating.value) {
    emit('update:formData', { ...localFormData });
  }
};

// 表单验证 - 移除nextTick中的checkFormValid调用
const handleValidate = () => {
  // 移除这里的checkFormValid调用，因为@validate事件已经是验证结果
};

// 优化表单验证，添加防重入保护
const checkFormValid = async () => {
  if (isInternalUpdate.value || isValidating.value) return;

  isValidating.value = true;

  try {
    await formRef.value?.validate();
    emit('form-valid-change', true);
  } catch {
    emit('form-valid-change', false);
  } finally {
    isValidating.value = false;
  }
};

// 手动触发验证的方法
const triggerValidation = () => {
  nextTick(() => {
    if (!isValidating.value) {
      checkFormValid();
    }
  });
};

// 更新表单中的图片数据 - 优化更新逻辑
const updateFormImages = () => {
  if (isUpdatingFileList.value) return;

  isUpdatingFileList.value = true;

  const images = fileList.value
    .filter(file => file.status === 'done' && (file.response?.url || file.url))
    .map(file => file.response?.url || file.url);

  // 只有当图片数组真正发生变化时才更新
  if (JSON.stringify(localFormData.images) !== JSON.stringify(images)) {
    localFormData.images = images;
    emitFormDataChange();
  }

  nextTick(() => {
    isUpdatingFileList.value = false;
  });
};

// 文件上传前检查
const beforeUpload: UploadProps['beforeUpload'] = file => {
  const isImage = file.type?.startsWith('image/');
  if (!isImage) {
    message.error('只能上传图片文件!');
    return false;
  }

  const isLt2M = file.size ? file.size / 1024 / 1024 < 2 : false;
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!');
    return false;
  }

  return true;
};

// 自定义上传
const customRequest: UploadProps['customRequest'] = async options => {
  const { file, onSuccess, onError } = options;

  try {
    // 真实的上传接口调用
    const formData = new FormData();
    formData.append('file', file as File);

    const response = await uploadImage(formData);

    onSuccess?.(response.data);
    updateFormImages();
  } catch (error) {
    message.error('上传失败');
    onError?.(error as Error);
  }
};

// 图片预览
const handlePreview = (file: UploadFile) => {
  previewImage.value = file.url || file.thumbUrl || '';
  previewVisible.value = true;
};

// 删除图片
const handleRemove = () => {
  updateFormImages();
};

// 重置验证 - 修改为手动触发
const resetValidation = () => {
  formRef.value?.resetFields();
  triggerValidation();
};

// 验证表单
const validate = () => {
  return formRef.value?.validate();
};

// 暴露方法
defineExpose({
  resetValidation,
  validate,
});
</script>

<style scoped>
:deep(.ant-upload-select-picture-card i) {
  font-size: 32px;
  color: #999;
}

:deep(.ant-upload-select-picture-card .ant-upload-text) {
  margin-top: 8px;
  color: #666;
}
</style>
