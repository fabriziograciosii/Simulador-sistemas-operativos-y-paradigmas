import { EstadoProceso } from './EstadoProceso';

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
}