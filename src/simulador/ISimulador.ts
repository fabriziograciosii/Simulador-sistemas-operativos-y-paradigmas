import { IProceso } from '../procesos/IProceso';

export interface ISimulador {
    agregarProceso(proceso: IProceso): void;
    ejecutarReloj(): void;
    getProcesosNuevos(): IProceso[];
    getProcesosListos(): IProceso[];
    getProcesosTerminados(): IProceso[];
}