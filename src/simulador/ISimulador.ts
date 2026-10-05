import { IProceso } from '../procesos/IProceso';

export interface ISimulador {
    agregarProceso(proceso: IProceso): void;
    ejecutarReloj(): void;
    
    getProcesosNuevos(): IProceso[];
    getProcesosEsperandoMemoria(): IProceso[];
    getProcesosListos(): IProceso[];
    getProcesosBloqueados(): IProceso[];
    getProcesosTerminados(): IProceso[];

    getPorcentajeUsoCPU(): number;
    getCambiosDeContexto(): number;
    getFragmentacionExterna(): number;

}