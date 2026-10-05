import { IProceso } from '../procesos/IProceso';
import { IVistaBloque } from './IVistaBloque';

export interface IGestorMemoria {

    asignarMemoria(proceso: IProceso): boolean;
    
    liberarMemoria(proceso: IProceso): void;

    getMemoriaTotal(): number;
    getMemoriaLibreTotal(): number;
    getMayorHuecoLibre(): number;
    getOcupacionMemoria(): number;
    getMapaMemoria(): ReadonlyArray<IVistaBloque>;
}
