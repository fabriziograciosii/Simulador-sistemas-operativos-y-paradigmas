import { IProceso } from '../procesos/IProceso';
import { IVistaBloque } from '../memoria/IVistaBloque';

export interface ISimulador {
    agregarProceso(proceso: IProceso): void;
    ejecutarReloj(): void;

    getTickActual(): number;
    getProcesoEnCPU(): IProceso | null;
    getProcesosNuevos(): IProceso[];
    getProcesosEsperandoMemoria(): IProceso[];
    getProcesosListos(): IProceso[];
    getProcesosBloqueados(): IProceso[];
    getProcesosTerminados(): IProceso[];
    getMapaMemoria(): ReadonlyArray<IVistaBloque>;

    getOcupacionMemoria(): number;
    getPorcentajeUsoCPU(): number;
    getCambiosDeContexto(): number;
    getMemoriaLibreTotal(): number;
    getMayorBloqueLibre(): number;
    getFragmentacionExterna(): number;

}
