import { EstadoProceso } from './EstadoProceso';
import { IProceso } from './IProceso';
import { EventoES } from './EventoES';

export class Proceso implements IProceso {
    private readonly pid: number;
    private readonly memoriaRequerida: number;
    private readonly cpuTotal: number;
    
    private estado: EstadoProceso;
    private cpuRestante: number;
    private quantumConsumido: number;
    private eventoES: EventoES | null = null;
    private bloqueoRestante: number = 0;
    private yaSeBloqueo: boolean = false;

    constructor(pid: number, memoriaRequerida: number, cpuTotal: number, eventoES: EventoES | null = null) {
        this.pid = pid;
        this.memoriaRequerida = memoriaRequerida;
        this.cpuTotal = cpuTotal;
        this.eventoES = eventoES;
        
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

    esValido(): boolean {
 
        const pidValido = this.pid > 0 && this.pid % 1 === 0;
        const memoriaValida = this.memoriaRequerida > 0 && this.memoriaRequerida % 1 === 0;
        const cpuValido = this.cpuTotal > 0 && this.cpuTotal % 1 === 0;

        return pidValido && memoriaValida && cpuValido;
    }

    cambiarEstado(nuevoEstado: EstadoProceso): void {
        this.estado = nuevoEstado;
    }

    ejecutarUnTick(): void {
        this.cpuRestante = Math.max(0, this.cpuRestante - 1);
        this.quantumConsumido = this.quantumConsumido + 1;
    }

    public getTamano(): number {
        return this.memoriaRequerida;
    }

    // Métodos de E/S 
    public getEventoES(): EventoES | null { return this.eventoES; }
    public getBloqueoRestante(): number { return this.bloqueoRestante; }
    
    public iniciarBloqueo(duracion: number): void {
        this.bloqueoRestante = duracion;
        this.yaSeBloqueo = true;
    }

    public reducirBloqueo(): void {
        this.bloqueoRestante = Math.max(0, this.bloqueoRestante - 1);
    }

}