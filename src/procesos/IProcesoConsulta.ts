import { EstadoProceso } from './EstadoProceso';
import { IEventoES } from './IEventoES';

// Vista de solo lectura de un proceso: es lo único que el Simulador entrega hacia afuera.
export interface IProcesoConsulta {
    getPid(): number;
    getMemoriaRequerida(): number;
    getCpuTotal(): number;
    getCpuRestante(): number;
    getEstado(): EstadoProceso;
    getQuantumConsumido(): number;
    getBloqueoRestante(): number;
    getEventoES(): IEventoES | null;
}