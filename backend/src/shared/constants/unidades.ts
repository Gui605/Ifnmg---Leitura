/**
 * 🏛️ LISTA OFICIAL DE UNIDADES (CAMPUS) DO IFNMG
 */
export const LISTA_CAMPUS = [
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
  "Teu de Janeiro"
] as const;

/**
 * 💡 Tipo derivado para uso em Schemas e Tipagens
 */
export type UnidadeCampus = typeof LISTA_CAMPUS[number];
