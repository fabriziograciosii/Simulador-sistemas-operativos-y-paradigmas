import { IProceso } from '../procesos/IProceso';

export interface IGestorMemoria {

    asignarMemoria(proceso: IProceso): boolean;
    
    liberarMemoria(proceso: IProceso): void;

    getMemoriaLibreTotal(): number;
    getMayorHuecoLibre(): number;
}