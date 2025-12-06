export interface FieldMetadata {
  name: string;
  entityFieldName: string;
  javaType: string;
  dbType: string;
  length: number | null;
  precision: number | null;
  scale: number | null;
  comment: string;
}

export interface ParseResult {
  tableName?: string;
  dialect?: string;
  fields?: FieldMetadata[];
  error?: string;
}

export const parseSqlToFieldMetadata = (sql: string): ParseResult => {
  if (!sql || typeof sql !== 'string') {
    return {};
  }

  const cleanSql = sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();

  const dialect = inferDialect(cleanSql);

  const createTableMatch = findCreateTableBlock(cleanSql);
  if (!createTableMatch) {
    return { error: '无法识别 CREATE TABLE 语句', dialect };
  }
  const { tableName, body } = createTableMatch;

  const columnsRaw = splitColumns(body);
  const fields: FieldMetadata[] = [];

  columnsRaw.forEach(colDef => {
    if (!colDef) {
      return;
    }
    const upperDef = colDef.toUpperCase();
    if (isConstraintDefinition(upperDef)) {
      return;
    }

    const fieldInfo = parseColumnDefinition(colDef, dialect);
    if (fieldInfo) {
      fields.push(fieldInfo);
    }
  });

  applyExternalComments(cleanSql, fields);

  return {
    tableName,
    dialect,
    fields
  };
};

const inferDialect = (sql: string): string => {
  const upperSql = sql.toUpperCase();
  if (
    upperSql.includes('NUMBER(') ||
    upperSql.includes('VARCHAR2') ||
    upperSql.includes('SYSDATE')
  ) {
    return 'ORACLE';
  }
  if (
    upperSql.includes('BIGSERIAL') ||
    upperSql.includes('TEXT[]') ||
    upperSql.includes('JSONB') ||
    upperSql.includes('BYTEA')
  ) {
    return 'POSTGRESQL';
  }
  if (
    sql.includes('`') ||
    upperSql.includes('ENGINE=INNODB') ||
    upperSql.includes('AUTO_INCREMENT') ||
    upperSql.includes('TINYINT')
  ) {
    return 'MYSQL';
  }
  return 'MYSQL';
};

const parseColumnDefinition = (def: string, dialect: string): FieldMetadata | null => {
  const nameMatch = def.match(/^["`[]?(\w+)["`\]]?\s+(.*)$/);
  if (!nameMatch) {
    return null;
  }

  const name = nameMatch[1];
  const rest = nameMatch[2];

  const typeMatch = rest.match(/^(\w+)(?:\s*\(([^)]+)\))?/);
  if (!typeMatch) {
    return null;
  }

  const dbType = typeMatch[1].toUpperCase();
  const lengthPart = typeMatch[2];

  let length: number | null = null;
  let precision: number | null = null;
  let scale: number | null = null;

  if (lengthPart) {
    if (lengthPart.includes(',')) {
      const parts = lengthPart.split(',');
      precision = parseInt(parts[0].trim(), 10);
      scale = parseInt(parts[1].trim(), 10);
    } else {
      length = parseInt(lengthPart.trim(), 10);
    }
  }

  let comment = '';
  const commentMatch = rest.match(/COMMENT\s+['"]([^'"]+)['"]/i);
  if (commentMatch) {
    comment = commentMatch[1];
  }

  let javaType = 'String';
  if (dialect === 'MYSQL') {
    javaType = mapTypeMySQL(dbType, length);
  } else if (dialect === 'POSTGRESQL') {
    javaType = mapTypePostgreSQL(dbType);
  } else if (dialect === 'ORACLE') {
    javaType = mapTypeOracle(dbType, length, precision, scale);
  }

  return {
    name,
    entityFieldName: toCamelCase(name),
    javaType,
    dbType,
    length,
    precision,
    scale,
    comment
  };
};

const mapTypeMySQL = (dbType: string, length: number | null): string => {
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
};

const mapTypePostgreSQL = (dbType: string): string => {
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
};

const mapTypeOracle = (
  dbType: string,
  length: number | null,
  precision: number | null,
  scale: number | null
): string => {
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
      if (scale != null && scale > 0) {
        return 'BigDecimal';
      }
      if (precision != null && precision > 18) {
        return 'BigDecimal';
      }
      if (precision != null && precision > 9) {
        return 'Long';
      }
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
};

const findCreateTableBlock = (sql: string): { tableName: string; body: string } | null => {
  const startRegex =
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:["`[]?\w+["`\]]?\.)?["`[]?(\w+)["`\]]?\s*\(/i;
  const startMatch = sql.match(startRegex);
  if (!startMatch || startMatch.index === undefined) {
    return null;
  }

  const tableName = startMatch[1];
  const startIndex = startMatch.index + startMatch[0].length;
  let parenthesisLevel = 1;
  let endIndex = -1;

  for (let i = startIndex; i < sql.length; i += 1) {
    if (sql[i] === '(') {
      parenthesisLevel += 1;
    }
    if (sql[i] === ')') {
      parenthesisLevel -= 1;
    }
    if (parenthesisLevel === 0) {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    return null;
  }

  return { tableName, body: sql.substring(startIndex, endIndex) };
};

const splitColumns = (body: string): string[] => {
  const columns: string[] = [];
  let parenthesisLevel = 0;
  let lastSplitIndex = 0;
  for (let i = 0; i < body.length; i += 1) {
    const char = body[i];
    if (char === '(') {
      parenthesisLevel += 1;
    } else if (char === ')') {
      parenthesisLevel -= 1;
    } else if (char === ',' && parenthesisLevel === 0) {
      columns.push(body.substring(lastSplitIndex, i).trim());
      lastSplitIndex = i + 1;
    }
  }
  columns.push(body.substring(lastSplitIndex).trim());
  return columns;
};

const isConstraintDefinition = (upperDef: string): boolean =>
  upperDef.startsWith('PRIMARY KEY') ||
  upperDef.startsWith('KEY') ||
  upperDef.startsWith('INDEX') ||
  upperDef.startsWith('UNIQUE') ||
  upperDef.startsWith('CONSTRAINT') ||
  upperDef.startsWith('FOREIGN KEY') ||
  upperDef.startsWith('CHECK');

const toCamelCase = (str: string): string =>
  str.toLowerCase().replace(/_(\w)/g, (_all, letter: string) => letter.toUpperCase());

const applyExternalComments = (cleanSql: string, fields: FieldMetadata[]): void => {
  const externalCommentRegex =
    /COMMENT\s+ON\s+COLUMN\s+(?:["`[]?\w+["`\]]?\.)*["`[]?(\w+)["`\]]?\s+IS\s+['"]([^'"]*)['"]/gi;
  let match: RegExpExecArray | null;
  while ((match = externalCommentRegex.exec(cleanSql)) !== null) {
    const colName = match[1];
    const commentText = match[2];
    const field = fields.find(
      f => f.name === colName || f.name.toLowerCase() === colName.toLowerCase()
    );
    if (field) {
      field.comment = commentText;
    }
  }
};
