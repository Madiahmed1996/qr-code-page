/**
 * Вычисляет простой хеш строки объекта. Используется для поиска дублей.
 * Преобразует объект в JSON и считает хеш 32-битным методом.
 */
export function hashRow(row: Record<string, any>): string {
  const json = JSON.stringify(row);
  let hash = 0;
  for (let i = 0; i < json.length; i++) {
    const chr = json.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(16);
}

/**
 * Поиск дублей среди импортируемых записей. Принимает массив
 * объектов и callback, который определяет, есть ли уже такая запись в
 * хранилище. Возвращает массив хешей дублей.
 */
export function detectDuplicates(
  rows: Record<string, any>[],
  existsFn: (hash: string) => boolean
): { hash: string; index: number }[] {
  const duplicates: { hash: string; index: number }[] = [];
  rows.forEach((row, index) => {
    const hash = hashRow(row);
    if (existsFn(hash)) {
      duplicates.push({ hash, index });
    }
  });
  return duplicates;
}
