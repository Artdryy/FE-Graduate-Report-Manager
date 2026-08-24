/**
 * Formato canonico de las etiquetas de semestre.
 *
 * El backend genera automaticamente los dos semestres del año en curso con
 * este mismo formato (ver utils/semesters.js en BE-Graduate-Report-Manager).
 * Los semestres antiguos se agregan a mano desde la pantalla "Semestres" y
 * deben respetarlo para que `sortSemesters` los ordene bien.
 */
export const PERIODOS = Object.freeze({
  PRIMERO: 'Enero - Junio',
  SEGUNDO: 'Agosto - Diciembre',
});

export const LISTA_PERIODOS = [PERIODOS.PRIMERO, PERIODOS.SEGUNDO];

export const buildSemesterLabel = (periodo, anio) => `${periodo} ${anio}`;

/**
 * Ordena semestres del mas reciente al mas antiguo.
 *
 * Toma el ultimo token separado por espacios como el año y busca "AGO" o "DIC"
 * en el texto anterior para saber si es el segundo periodo.
 */
export const sortSemesters = (a = '', b = '') => {
  const normalize = (s) => (typeof s === 'string' ? s.trim() : '');
  const sa = normalize(a);
  const sb = normalize(b);

  const parseValue = (semString) => {
    if (!semString) return 0;
    const parts = semString.split(' ');
    const yearToken = parts[parts.length - 1];
    const year = parseInt(yearToken, 10);
    const periodToken = parts.slice(0, parts.length - 1).join(' ').toUpperCase();
    const isSecond = periodToken.includes('AGO') || periodToken.includes('DIC');
    const periodValue = isSecond ? 2 : 1;
    if (Number.isFinite(year)) return (year * 10) + periodValue;
    return periodValue;
  };

  const valA = parseValue(sa);
  const valB = parseValue(sb);
  return valB - valA;
};

/** Igual que sortSemesters pero para objetos { id, semester }. */
export const sortSemesterObjects = (a, b) => sortSemesters(a?.semester, b?.semester);
