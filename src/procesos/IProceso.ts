import { EstadoProceso } from './EstadoProceso';
import { IProcesoConsulta } from './IProcesoConsulta';

// Contrato completo: consultas + operaciones que modifican el proceso (solo para colaboradores internos).
export interface IProceso extends IProcesoConsulta {
    esValido(): boolean;
    cambiarEstado(nuevoEstado: EstadoProceso): void;
    ejecutarUnTick(): void;
    reiniciarQuantum(): void;
    getTamano(): number;
    debeBloquearse(): boolean;
    reducirBloqueo(): void;
    iniciarBloqueo(): void;
}