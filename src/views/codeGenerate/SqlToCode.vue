<template>
  <div class="space-y-4">
    <a-card :bordered="false" class="shadow-sm">
      <a-typography-title :level="4">输入 SQL</a-typography-title>
      <a-textarea
        v-model:value="inputSql"
        :rows="10"
        show-count
        placeholder="粘贴 CREATE TABLE 语句..."
        class="!mt-2 font-mono"
      />
    </a-card>

    <div class="flex justify-center">
      <a-space>
        <a-button type="primary" :loading="parsing" @click="handleParse">解析模板</a-button>
        <a-button @click="handleReset">清空</a-button>
      </a-space>
    </div>

    <a-card :bordered="false" class="shadow-sm">
      <div class="flex items-center mb-4">
        <a-typography-title :level="4" class="mr-1">解析结果</a-typography-title>
        <a-button
          class="mb-2"
          type="text"
          size="small"
          :disabled="!parsedContent"
          @click="copyToClipboard"
          >复制结果</a-button
        >
      </div>
      <a-alert v-if="errorMessage" :message="errorMessage" type="error" show-icon class="mb-4" />
      <pre v-if="parsedContent" class="result-output">{{ parsedContent }}</pre>
      <a-empty v-else-if="!errorMessage" description="解析结果将显示在这里" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { parseSqlToFieldMetadata } from './sqlUtil';
import { Entity } from './template/Entity';

interface TemplateField {
  comment: string;
  javaType: string;
  entityFieldName: string;
}

interface TemplateEntity {
  tableName: string;
  fields: TemplateField[];
}

const inputSql = ref('');
const parsedContent = ref('');
const errorMessage = ref('');
const parsing = ref(false);

const handleParse = async () => {
  if (!inputSql.value.trim()) {
    message.warning('请输入 SQL 语句');
    return;
  }

  parsing.value = true;
  errorMessage.value = '';
  parsedContent.value = '';

  try {
    const result = parseSqlToFieldMetadata(inputSql.value);
    if (result.error) {
      errorMessage.value = result.error;
      return;
    }
    if (!result.tableName || !result.fields || result.fields.length === 0) {
      errorMessage.value = '未解析出有效字段信息';
      return;
    }

    const entity: TemplateEntity = {
      tableName: toPascalCase(result.tableName),
      fields: result.fields.map(field => ({
        comment: field.comment || field.name,
        javaType: field.javaType,
        entityFieldName: field.entityFieldName
      }))
    };

    parsedContent.value = Entity(entity).trim();
    message.success('解析成功');
  } catch (error) {
    console.error('解析 SQL 失败:', error);
    errorMessage.value = error instanceof Error ? error.message : '解析 SQL 失败';
  } finally {
    parsing.value = false;
  }
};

const handleReset = () => {
  inputSql.value = '';
  parsedContent.value = '';
  errorMessage.value = '';
};

const toPascalCase = (value: string): string =>
  value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const copyToClipboard = () => {
  if (!parsedContent.value) return;
  navigator.clipboard.writeText(parsedContent.value).then(() => {
    message.success('结果已复制到剪贴板');
  });
};
</script>

<style scoped>
.result-output {
  background-color: #0f172a;
  color: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  font-family: 'Fira Code', 'JetBrains Mono', Consolas, monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  height: 200px;
  overflow: auto;
}
</style>
