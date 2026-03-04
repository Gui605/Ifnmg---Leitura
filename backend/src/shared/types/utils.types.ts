/**
 * Define o tipo de um valor após a sanitização.
 * É um tipo recursivo para suportar objetos e arrays aninhados.
 */
export type SanitizedValue =
  | string
  | number
  | boolean
  | null
  | Date
  | SanitizedValue[]
  | { [key: string]: SanitizedValue };
