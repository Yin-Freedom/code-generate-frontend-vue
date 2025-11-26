<template>
  <div class="h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
    <!-- Header -->
    <header class="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
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
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex gap-4 p-4 overflow-hidden">
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
          <a-button type="text" size="small" :disabled="!outputResult" @click="copyToClipboard">
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
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { message } from 'ant-design-vue';

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

// ============================================================
//   SQL Parsing Logic (Embedded from SqlParser.js)
// ============================================================

const parseSqlToFieldMetadata = sql => {
  if (!sql || typeof sql !== 'string') return {};

  // 1. Preprocessing
  let cleanSql = sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();

  // 2. Infer Dialect
  const dialect = inferDialect(cleanSql);

  // 3. Extract Body
  const createTableMatch = findCreateTableBlock(cleanSql);
  if (!createTableMatch) {
    return { error: '无法识别 CREATE TABLE 语句', dialect };
  }
  const { tableName, body } = createTableMatch;

  // 4. Split Columns
  const columnsRaw = splitColumns(body);
  const fields = [];

  // 5. Parse Columns
  columnsRaw.forEach(colDef => {
    if (!colDef) return;
    const upperDef = colDef.toUpperCase();
    if (isConstraintDefinition(upperDef)) return;

    const fieldInfo = parseColumnDefinition(colDef, dialect);
    if (fieldInfo) {
      fields.push(fieldInfo);
    }
  });

  // 6. External Comments
  applyExternalComments(cleanSql, fields);

  return {
    tableName,
    dialect,
    fields
  };
};

// --- Dialect Inference ---
function inferDialect(sql) {
  const upperSql = sql.toUpperCase();
  if (upperSql.includes('NUMBER(') || upperSql.includes('VARCHAR2') || upperSql.includes('SYSDATE'))
    return 'ORACLE';
  if (
    upperSql.includes('BIGSERIAL') ||
    upperSql.includes('TEXT[]') ||
    upperSql.includes('JSONB') ||
    upperSql.includes('BYTEA')
  )
    return 'POSTGRESQL';
  if (
    sql.includes('`') ||
    upperSql.includes('ENGINE=INNODB') ||
    upperSql.includes('AUTO_INCREMENT') ||
    upperSql.includes('TINYINT')
  )
    return 'MYSQL';
  return 'MYSQL'; // Default
}

// --- Parsing Details ---
function parseColumnDefinition(def, dialect) {
  const nameMatch = def.match(/^["`[]?(\w+)["`\]]?\s+(.*)$/);
  if (!nameMatch) return null;

  const name = nameMatch[1];
  let rest = nameMatch[2];

  const typeMatch = rest.match(/^(\w+)(?:\s*\(([^)]+)\))?/);
  if (!typeMatch) return null;

  const dbType = typeMatch[1].toUpperCase();
  const lengthPart = typeMatch[2];
  let length = null,
    precision = null,
    scale = null;

  if (lengthPart) {
    if (lengthPart.includes(',')) {
      const parts = lengthPart.split(',');
      precision = parseInt(parts[0].trim());
      scale = parseInt(parts[1].trim());
    } else {
      length = parseInt(lengthPart.trim());
    }
  }

  // Inline Comment (MySQL style)
  let comment = '';
  const commentMatch = rest.match(/COMMENT\s+['"]([^'"]+)['"]/i);
  if (commentMatch) comment = commentMatch[1];

  // Strategy Pattern Call
  let javaType = 'String';
  if (dialect === 'MYSQL') javaType = mapTypeMySQL(dbType, length, precision, scale);
  else if (dialect === 'POSTGRESQL') javaType = mapTypePostgreSQL(dbType, length, precision, scale);
  else if (dialect === 'ORACLE') javaType = mapTypeOracle(dbType, length, precision, scale);

  return {
    name: name,
    entityFieldName: toCamelCase(name),
    javaType: javaType,
    dbType: dbType,
    length: length,
    precision: precision,
    scale: scale,
    comment: comment
  };
}

// --- Type Strategies ---
function mapTypeMySQL(dbType, length, precision, scale) {
  switch (dbType) {
    case 'VARCHAR':
    case 'CHAR':
    case 'TEXT':
    case 'TINYTEXT':
    case 'MEDIUMTEXT':
    case 'LONGTEXT':
    case 'JSON':
    case 'ENUM':
    case 'SET':
      return 'String';
    case 'INT':
    case 'INTEGER':
    case 'SMALLINT':
    case 'MEDIUMINT':
      return 'Integer';
    case 'TINYINT':
      return length === 1 ? 'Boolean' : 'Integer';
    case 'BIGINT':
      return 'Long';
    case 'DECIMAL':
    case 'NUMERIC':
      return 'BigDecimal';
    case 'FLOAT':
    case 'DOUBLE':
    case 'REAL':
      return 'Double';
    case 'BIT':
      return length === 1 || length === null ? 'Boolean' : 'byte[]';
    case 'DATE':
    case 'DATETIME':
    case 'TIMESTAMP':
    case 'TIME':
    case 'YEAR':
      return 'Date';
    case 'BLOB':
    case 'LONGBLOB':
    case 'MEDIUMBLOB':
    case 'TINYBLOB':
    case 'BINARY':
    case 'VARBINARY':
      return 'byte[]';
    default:
      return 'String';
  }
}

function mapTypePostgreSQL(dbType, length, precision, scale) {
  switch (dbType) {
    case 'VARCHAR':
    case 'CHAR':
    case 'TEXT':
    case 'UUID':
    case 'INET':
    case 'JSON':
    case 'JSONB':
    case 'XML':
      return 'String';
    case 'INT4':
    case 'INT':
    case 'INTEGER':
    case 'SMALLINT':
    case 'INT2':
      return 'Integer';
    case 'INT8':
    case 'BIGINT':
    case 'BIGSERIAL':
    case 'SERIAL':
      return 'Long';
    case 'NUMERIC':
    case 'DECIMAL':
    case 'MONEY':
      return 'BigDecimal';
    case 'FLOAT4':
    case 'REAL':
    case 'FLOAT8':
    case 'DOUBLE':
      return 'Double';
    case 'BOOL':
    case 'BOOLEAN':
      return 'Boolean';
    case 'DATE':
    case 'TIMESTAMP':
    case 'TIMESTAMPTZ':
    case 'TIME':
      return 'Date';
    case 'BYTEA':
      return 'byte[]';
    default:
      return dbType.endsWith('[]') ? 'String' : 'String';
  }
}

function mapTypeOracle(dbType, length, precision, scale) {
  switch (dbType) {
    case 'VARCHAR2':
    case 'NVARCHAR2':
    case 'CHAR':
    case 'NCHAR':
    case 'CLOB':
    case 'NCLOB':
    case 'ROWID':
      return 'String';
    case 'NUMBER':
      if (scale != null && scale > 0) return 'BigDecimal';
      if (precision != null && precision > 18) return 'BigDecimal';
      if (precision != null && precision > 9) return 'Long';
      return 'Integer';
    case 'FLOAT':
    case 'BINARY_FLOAT':
    case 'BINARY_DOUBLE':
      return 'Double';
    case 'DATE':
    case 'TIMESTAMP':
      return 'Date';
    case 'BLOB':
    case 'RAW':
    case 'LONG RAW':
      return 'byte[]';
    default:
      return 'String';
  }
}

// --- Helpers ---
function findCreateTableBlock(sql) {
  const startRegex =
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:["`[]?\w+["`\]]?\.)?["`[]?(\w+)["`\]]?\s*\(/i;
  const startMatch = sql.match(startRegex);
  if (!startMatch) return null;

  const tableName = startMatch[1];
  const startIndex = startMatch.index + startMatch[0].length;
  let parenthesisLevel = 1;
  let endIndex = -1;

  for (let i = startIndex; i < sql.length; i++) {
    if (sql[i] === '(') parenthesisLevel++;
    if (sql[i] === ')') parenthesisLevel--;
    if (parenthesisLevel === 0) {
      endIndex = i;
      break;
    }
  }
  if (endIndex === -1) return null;
  return { tableName, body: sql.substring(startIndex, endIndex) };
}

function splitColumns(body) {
  const columns = [];
  let parenthesisLevel = 0;
  let lastSplitIndex = 0;
  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    if (char === '(') parenthesisLevel++;
    else if (char === ')') parenthesisLevel--;
    else if (char === ',' && parenthesisLevel === 0) {
      columns.push(body.substring(lastSplitIndex, i).trim());
      lastSplitIndex = i + 1;
    }
  }
  columns.push(body.substring(lastSplitIndex).trim());
  return columns;
}

function isConstraintDefinition(upperDef) {
  return (
    upperDef.startsWith('PRIMARY KEY') ||
    upperDef.startsWith('KEY') ||
    upperDef.startsWith('INDEX') ||
    upperDef.startsWith('UNIQUE') ||
    upperDef.startsWith('CONSTRAINT') ||
    upperDef.startsWith('FOREIGN KEY') ||
    upperDef.startsWith('CHECK')
  );
}

function toCamelCase(str) {
  if (!str) return str;
  return str.toLowerCase().replace(/_(\w)/g, (all, letter) => letter.toUpperCase());
}

function applyExternalComments(cleanSql, fields) {
  const externalCommentRegex =
    /COMMENT\s+ON\s+COLUMN\s+(?:["`[]?\w+["`\]]?\.)*["`[]?(\w+)["`\]]?\s+IS\s+['"]([^'"]*)['"]/gi;
  let match;
  while ((match = externalCommentRegex.exec(cleanSql)) !== null) {
    const colName = match[1];
    const commentText = match[2];
    const field = fields.find(
      f => f.name === colName || f.name.toLowerCase() === colName.toLowerCase()
    );
    if (field) field.comment = commentText;
  }
}
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
