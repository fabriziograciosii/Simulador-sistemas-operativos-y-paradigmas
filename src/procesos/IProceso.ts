import { EstadoProceso } from './EstadoProceso';
import { IConsultarProceso } from './IConsultarProceso';

export interface IProceso {
    obtenerVista(): IConsultarProceso;
    cambiarEstado(nuevoEstado: EstadoProceso): void;
    ejecutarUnTick(): void;
}