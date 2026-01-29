/*
{
  "tableName": "template",
  "dialect": "POSTGRESQL",
  "fields": []
}
 */
type Table = {
  tableName?: string;
  dialect?: string;
  fields?: JavaEntityField[];
  error?: string;
};

/*
{
  "dbFieldName": "creator_id",
  "fieldName": "creatorId",
  "fieldType": "Long",
  "length": null,
  "precision": null,
  "scale": null,
  "comment": "创建人ID",
  "dbType": "BIGINT"
}
*/
type JavaEntityField = {
  dbFieldName: string;
  fieldName: string;
  fieldType: string;
  length: number | null;
  precision: number | null;
  scale: number | null;
  comment: string;
  dbType: string;
};

export { Table, JavaEntityField };
