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
        // Validación matemática sin usar "if"
        this.memoriaRequerida = Math.max(1, memoriaRequerida); 
        this.cpuTotal = Math.max(1, cpuTotal);
        
        this.cpuRestante = this.cpuTotal;
        this.estado = EstadoProceso.NUEVO;
        this.quantumConsumido = 0;
    }

    public getPid(): number { return this.pid; }
    public getMemoriaRequerida(): number { return this.memoriaRequerida; }
    public getCpuTotal(): number { return this.cpuTotal; }
    public getCpuRestante(): number { return this.cpuRestante; }
    public getEstado(): EstadoProceso { return this.estado; }
    public getQuantumConsumido(): number { return this.quantumConsumido; }

    public cambiarEstado(nuevoEstado: EstadoProceso): void {
        this.estado = nuevoEstado;
    }

    public ejecutarUnTick(): void {
        this.cpuRestante = Math.max(0, this.cpuRestante - 1);
        this.quantumConsumido = this.quantumConsumido + 1;
    }
}