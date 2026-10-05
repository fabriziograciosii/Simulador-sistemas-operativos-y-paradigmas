// Copia de solo lectura de un bloque, para consultar el mapa de memoria sin exponer el estado interno.
export interface IVistaBloque {
    readonly inicio: number;
    readonly tamano: number;
    readonly libre: boolean;
    readonly pid: number | null;
}
