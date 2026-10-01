import { EstadoProceso } from './EstadoProceso';

export interface IConsultarProceso {
    readonly pid: number;
    readonly memoriaRequerida: number;
    readonly cpuTotal: number;
    readonly cpuRestante: number;
    readonly estado: EstadoProceso;
    readonly quantumConsumido: number;
    readonly tiempoBloqueoRestante: number;
}