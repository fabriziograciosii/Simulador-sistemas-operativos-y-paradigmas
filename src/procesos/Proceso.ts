import { EstadoProceso } from './EstadoProceso';
import { IProceso } from './IProceso';

export class Proceso implements IProceso {
    private readonly pid: number;
    private readonly memoriaRequerida: number;
    private readonly cpuTotal: number;
    
    private estado: EstadoProceso;
    private cpuRestante: number;
    private quantumConsumido: number;

    constructor(pid: number, memoriaRequerida: number, cpuTotal: number) {
        this.pid = pid;
        this.memoriaRequerida = memoriaRequerida;
        this.cpuTotal = cpuTotal;
        
        this.cpuRestante = cpuTotal;
        this.estado = EstadoProceso.NUEVO;
        this.quantumConsumido = 0;
    }

    getPid(): number {
        return this.pid;
    }

    getMemoriaRequerida(): number {
        return this.memoriaRequerida;
    }

    getCpuTotal(): number {
        return this.cpuTotal;
    }

    getCpuRestante(): number {
        return this.cpuRestante;
    }

    getEstado(): EstadoProceso {
        return this.estado;
    }

    getQuantumConsumido(): number {
        return this.quantumConsumido;
    }
}