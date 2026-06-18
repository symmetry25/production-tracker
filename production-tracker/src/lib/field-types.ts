export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency"
  | "percentage"
  | "date"
  | "datetime"
  | "select"
  | "multiselect"
  | "user"
  | "status"
  | "rating"
  | "score"
  | "boolean"
  | "url"
  | "email"
  | "phone"
  | "file"
  | "image"
  | "relation"
  | "formula"
  | "auto_number"
  | "created_at"
  | "updated_at"
  | "created_by";

export type FieldOption = {
  value: string;
  label: string;
  color?: string;
};

export type FieldConfig = {
  min?: number;
  max?: number;
  precision?: number;
  unit?: string;
  currency?: string;
  scoreMin?: number;
  scoreMax?: number;
  scoreStep?: number;
  targetEntityTypeId?: string;
  displayField?: string;
  expression?: string;
  prefix?: string;
  padding?: number;
  statusColors?: Record<string, string>;
};

export type FieldDefinition = {
  id: string;
  name: string;
  key: string;
  type: FieldType;
  required: boolean;
  defaultValue?: unknown;
  options?: FieldOption[];
  config?: FieldConfig;
  order: number;
  width?: number;
  hidden?: boolean;
  readOnly?: boolean;
};
