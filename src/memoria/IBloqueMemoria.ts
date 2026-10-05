import { IProceso } from '../procesos/IProceso';

export interface IBloqueMemoria {
    getInicio(): number;
    getTamano(): number;
    estaLibre(): boolean;
    getProceso(): IProceso | null;
    asignarProceso(proceso: IProceso): void;
    liberar(): void;
    dividir(tamanoRequerido:number): IBloqueMemoria | null;
    expandir(tamanoAdicional:number): void;
}