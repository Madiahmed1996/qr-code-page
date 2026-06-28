// Общие объявления типов для нестандартных импортов и библиотек.

declare module '*.sql?raw' {
  const content: string;
  export default content;
}

// При импорте wasm-файлов через Vite с суффиксом ?url возвращается
// строка URL. Без этой декларации TypeScript будет ругаться на
// неизвестный модуль sql.js/dist/sql-wasm.wasm?url.
declare module 'sql.js/dist/sql-wasm.wasm?url' {
  const url: string;
  export default url;
}

declare module 'sql.js' {
  export interface InitSqlJsConfig {
    locateFile?: (file: string) => string;
  }
  export interface SqlJsStatic {
    Database: new (data?: Uint8Array) => any;
  }
  /**
   * Инициализирует и возвращает экземпляр sql.js. Принимает опциональный
   * конфиг, содержащий функцию locateFile для указания пути к wasm файлу.
   */
  export default function initSqlJs(config?: InitSqlJsConfig): Promise<SqlJsStatic>;
}
