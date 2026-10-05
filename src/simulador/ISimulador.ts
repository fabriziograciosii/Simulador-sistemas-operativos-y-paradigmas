import { IProceso } from '../procesos/IProceso';
import { IProcesoConsulta } from '../procesos/IProcesoConsulta';
import { IVistaBloque } from '../memoria/IVistaBloque';

export interface ISimulador {
    agregarProceso(proceso: IProceso): void;
    ejecutarReloj(): void;

    getTickActual(): number;
    getProcesoEnCPU(): IProcesoConsulta | null;
    getProcesosNuevos(): IProcesoConsulta[];
    getProcesosEsperandoMemoria(): IProcesoConsulta[];
    getProcesosListos(): IProcesoConsulta[];
    getProcesosBloqueados(): IProcesoConsulta[];
    getProcesosTerminados(): IProcesoConsulta[];
    getMapaMemoria(): ReadonlyArray<IVistaBloque>;

    getOcupacionMemoria(): number;
    getPorcentajeUsoCPU(): number;
    getCambiosDeContexto(): number;
    getMemoriaLibreTotal(): number;
    getMayorBloqueLibre(): number;
    getFragmentacionExterna(): number;

}