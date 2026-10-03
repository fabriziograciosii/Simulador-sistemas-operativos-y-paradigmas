import { IProceso } from '../procesos/IProceso';

export interface IPlanificarTurno {
    getQuantum(): number;
    rotarCola(colaListos: IProceso[]): IProceso[];
}