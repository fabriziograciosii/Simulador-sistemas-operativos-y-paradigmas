import { EstadoProceso } from './EstadoProceso';
import { IConsultarProceso } from './IConsultarProceso';
import { IProceso } from './IProceso';

export class Proceso implements IProceso {
    private estado: EstadoProceso = EstadoProceso.NUEVO;
    private quantumConsumido: number = 0;
    private tiempoBloqueoRestante: number = 0;
    
    private readonly pid: number;
    private readonly memoriaRequerida: number;
    private readonly cpuTotal: number;
    private cpuRestante: number;

    constructor(pid: number, memoriaRequerida: number, cpuTotal: number) {
        this.pid = pid;
   
        this.memoriaRequerida = Math.max(1, memoriaRequerida); 
        this.cpuTotal = Math.max(1, cpuTotal);
        this.cpuRestante = this.cpuTotal;
    }

    public obtenerVista(): IConsultarProceso {
        return {
            pid: this.pid,
            memoriaRequerida: this.memoriaRequerida,
            cpuTotal: this.cpuTotal,
            cpuRestante: this.cpuRestante,
            estado: this.estado,
            quantumConsumido: this.quantumConsumido,
            tiempoBloqueoRestante: this.tiempoBloqueoRestante
        };
    }

    public cambiarEstado(nuevoEstado: EstadoProceso): void {
        this.estado = nuevoEstado;
    }

    public ejecutarUnTick(): void {
    }
}