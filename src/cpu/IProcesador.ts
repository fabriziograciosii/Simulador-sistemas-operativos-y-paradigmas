import { IProceso } from '../procesos/IProceso';

export interface IProcesador {
    getProcesoActual(): IProceso | null;
    estaLibre(): boolean;
    asignarProceso(proceso: IProceso): void;
    liberarProcesador(): IProceso | null;
    ejecutarTick(): void;
}