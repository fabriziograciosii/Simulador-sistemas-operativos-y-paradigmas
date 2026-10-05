import { EstadoProceso } from './EstadoProceso';
import { EventoES } from './EventoES';

export interface IProceso {
    getPid(): number;
    getMemoriaRequerida(): number;
    getCpuTotal(): number;
    getCpuRestante(): number;
    getEstado(): EstadoProceso;
    getQuantumConsumido(): number;
    esValido():boolean;
    cambiarEstado(nuevoEstado: EstadoProceso): void;
    ejecutarUnTick(): void;
    getTamano(): number;
    getEventoES(): EventoES | null;
    getBloqueoRestante(): number;
    reducirBloqueo(): void;
    iniciarBloqueo(duracion: number): void;
}