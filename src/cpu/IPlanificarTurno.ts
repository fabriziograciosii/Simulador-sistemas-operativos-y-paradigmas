import { IProceso } from '../procesos/IProceso';

export interface IPlanificarTurno {
    getQuantum(): number;
    quantumAgotado(proceso: IProceso): boolean;
    rotarCola(colaListos: IProceso[]): IProceso[];
}