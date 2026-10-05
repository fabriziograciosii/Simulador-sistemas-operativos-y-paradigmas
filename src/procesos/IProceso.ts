import { EstadoProceso } from './EstadoProceso';
import { IEventoES } from './IEventoES';

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
    reiniciarQuantum(): void;
    getTamano(): number;
    getEventoES(): IEventoES | null;
    debeBloquearse(): boolean;
    getBloqueoRestante(): number;
    reducirBloqueo(): void;
    iniciarBloqueo(): void;
}
