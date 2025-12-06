<template>
  <div class="h-full flex flex-col p-6">
    <!-- Header -->
    <div class="px-6 py-4 mb-4 flex justify-between items-center shadow-md bg-slate-900 text-white">
      <div class="flex items-center gap-3">
        <h1 class="text-lg font-semibold tracking-wide">SQL Schema Parser</h1>
        <span class="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
          To Java Metadata
        </span>
      </div>
      <div class="text-xs text-slate-400 flex gap-4">
        <span>Support: MySQL / PostgreSQL / Oracle</span>
        <span>User: {{ currentUser }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex gap-4">
      <!-- Left Panel: Input -->
      <div
        class="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div
          class="px-4 py-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center"
        >
          <span class="font-medium text-slate-600 text-sm">Input SQL (CREATE TABLE)</span>
          <a-tag v-if="detectedDialect" color="blue">{{ detectedDialect }}</a-tag>
        </div>
        <div class="flex-1 relative">
          <a-textarea
            v-model:value="inputSql"
            placeholder="Paste your CREATE TABLE statement here..."
            class="!border-0 !rounded-none !shadow-none !resize-none text-sm font-mono h-full w-full p-4 custom-scrollbar"
            style="height: 100%"
          />
        </div>
      </div>

      <!-- Right Panel: Output -->
      <div
        class="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div
          class="px-4 py-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center"
        >
          <span class="font-medium text-slate-600 text-sm">Output JSON</span>
          <a-button
            style="height: 20px"
            type="text"
            size="small"
            :disabled="!outputResult"
            @click="copyToClipboard"
          >
            Copy JSON
          </a-button>
        </div>
        <div class="flex-1 relative bg-slate-50">
          <a-textarea
            :value="outputResult"
            readonly
            placeholder="Parsed metadata will appear here..."
            class="!border-0 !bg-slate-50 !rounded-none !shadow-none !resize-none text-sm font-mono text-green-700 h-full w-full p-4 custom-scrollbar"
            style="height: 100%"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { parseSqlToFieldMetadata } from './sqlUtil';

// --- State ---
const currentUser = 'Yin-Freedom'; // 模拟当前用户
const inputSql = ref('');
const outputResult = ref('');
const detectedDialect = ref('');

// --- Logic ---
watch(inputSql, newSql => {
  if (!newSql || !newSql.trim()) {
    outputResult.value = '';
    detectedDialect.value = '';
    return;
  }

  try {
    const result = parseSqlToFieldMetadata(newSql);

    if (result.dialect) {
      detectedDialect.value = result.dialect;
    }

    if (result.error) {
      outputResult.value = JSON.stringify({ error: result.error }, null, 4);
    } else {
      outputResult.value = JSON.stringify(result, null, 4);
    }
  } catch (e) {
    console.error(e);
    outputResult.value = 'Internal Error: ' + e.message;
  }
});

const copyToClipboard = () => {
  if (!outputResult.value) return;
  navigator.clipboard.writeText(outputResult.value).then(() => {
    message.success('JSON copied to clipboard');
  });
};
</script>

<style scoped>
/* 自定义滚动条样式，使其更符合现代 UI */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>
