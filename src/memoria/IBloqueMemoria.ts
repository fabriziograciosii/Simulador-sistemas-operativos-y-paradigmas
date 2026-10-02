import { IProceso } from '../procesos/IProceso';

export interface IBloqueMemoria {
    getInicio(): number;
    getTamano(): number;
    estaLibre(): boolean;
    getProceso(): IProceso | null;
}