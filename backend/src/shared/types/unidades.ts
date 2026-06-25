//backend/src/shared/types/unidades.ts
//Lista de unidades do IFNMG
export const LISTA_CAMPUS = [
  "Teste",
  "Almenara", 
  "Araçuaí", 
  "Arinos", 
  "Diamantina", 
  "Januária", 
  "Montes Claros", 
  "Pirapora", 
  "Porteirinha", 
  "Salinas", 
  "Teófilo Otoni", 
  "Janaúba"
] as const;

export type UnidadeCampus = typeof LISTA_CAMPUS[number];
