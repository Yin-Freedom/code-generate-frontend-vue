export const Entity = (entity: any) =>
  `
@Entity
@Table
public class ${entity.tableName} {
    ${entity.fields
      .map((field: any) => {
        return `
        // ${field.comment}
        private ${field.javaType} ${field.entityFieldName};
        `;
      })
      .join('')}
}
`;
