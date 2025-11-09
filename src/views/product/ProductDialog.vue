<template>
  <!-- 新增时使用Modal -->
  <a-modal
    v-if="type === 'add'"
    v-model:open="open"
    :title="title"
    width="600px"
    :confirm-loading="confirmLoading"
    :ok-button-props="{ disabled: !canSave }"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <ProductForm
      ref="formRef"
      v-model:form-data="formData"
      :rules="rules"
      @form-valid-change="handleFormValidChange"
    />
  </a-modal>

  <!-- 编辑时使用Drawer -->
  <a-drawer
    v-else
    v-model:open="open"
    :title="title"
    width="600px"
    placement="right"
    @close="handleCancel"
  >
    <ProductForm
      ref="formRef"
      v-model:form-data="formData"
      :rules="rules"
      @form-valid-change="handleFormValidChange"
    />
    <template #footer>
      <div class="absolute right-0 bottom-0 w-full border-t py-4 px-2 bg-white text-right">
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button
            type="primary"
            :loading="confirmLoading"
            :disabled="!canSave"
            @click="handleSubmit"
          >
            确定
          </a-button>
        </a-space>
      </div>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import ProductForm from './ProductForm.vue';
import { saveOrUpdate } from '@/api/product/product';

interface Product {
  id?: number;
  name: string;
  price: number;
  category: string;
  status: 'true' | 'false';
  description: string;
  images: string[];
}

interface Props {
  open: boolean;
  type: 'add' | 'edit';
  record?: Product | null;
}

interface Emits {
  (e: 'update:open', value: boolean): void;
  (e: 'success'): void;
}

const props = withDefaults(defineProps<Props>(), {
  record: null
});

const emit = defineEmits<Emits>();

const saving = ref(false);

// 表单引用
const formRef = ref();

// 表单数据 - 改为 ref 而不是 reactive，避免深度响应式导致的循环更新
const formData = ref<Product>({
  name: '',
  price: 0,
  category: '',
  status: 'true',
  description: '',
  images: []
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能小于0', trigger: 'blur' }
  ],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }]
};

// 状态
const confirmLoading = ref(false);
const isFormValid = ref(false);

// 计算属性
const open = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
});

const title = computed(() => {
  return props.type === 'add' ? '新增产品' : '编辑产品';
});

// 检查必填字段是否有值
const canSave = computed(() => {
  return !!(
    formData.value.name &&
    formData.value.name.trim() &&
    formData.value.price !== null &&
    formData.value.price !== undefined &&
    formData.value.price >= 0 &&
    formData.value.category &&
    formData.value.category.trim()
  );
});

// 监听记录变化
watch(
  () => props.record,
  newRecord => {
    if (newRecord) {
      // 使用 Object.assign 而不是展开运算符，避免触发不必要的响应式更新
      formData.value = {
        ...newRecord,
        images: newRecord.images || []
      };
    } else {
      // 重置表单
      formData.value = {
        name: '',
        price: 0,
        category: '',
        status: 'true',
        description: '',
        images: []
      };
    }
    nextTick(() => {
      formRef.value?.resetValidation();
    });
  },
  { immediate: true }
);

// 监听 open 变化，重置表单验证状态
watch(
  () => props.open,
  newOpen => {
    if (!newOpen) {
      isFormValid.value = false;
    }
  }
);

// 表单验证状态变化
const handleFormValidChange = (valid: boolean) => {
  isFormValid.value = valid;
};

// 提交表单
const handleSubmit = async () => {
  saving.value = true;
  try {
    await formRef.value?.validate();
    confirmLoading.value = true;

    const submitData = { ...formData.value };

    if (props.type === 'add') {
      await saveOrUpdate(submitData);
      message.success('新增成功');
    } else {
      await saveOrUpdate(submitData);
      message.success('编辑成功');
    }

    emit('success');
    reset();
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'errorFields' in error) {
      message.error('请检查表单填写');
    } else {
      message.error(props.type === 'add' ? '新增失败' : '编辑失败');
    }
  } finally {
    confirmLoading.value = false;
    saving.value = false;
  }
};

// 取消
const handleCancel = () => {
  open.value = false;
  saving.value = false;
  reset();
};

const reset = () => {
  formRef.value?.$refs.formRef.resetFields();
};
</script>

<style scoped></style>
