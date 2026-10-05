import { EstadoProceso } from './EstadoProceso';
import { IProceso } from './IProceso';
import { IEventoES } from './IEventoES';
import { Reglas } from '../comun/Reglas';

export class Proceso implements IProceso {
    // Transiciones permitidas del modelo de seis estados. Cualquier otra se rechaza.
    private static readonly TRANSICIONES: Record<EstadoProceso, EstadoProceso[]> = {
        [EstadoProceso.NUEVO]: [EstadoProceso.ESPERANDO_MEMORIA],
        [EstadoProceso.ESPERANDO_MEMORIA]: [EstadoProceso.LISTO],
        [EstadoProceso.LISTO]: [EstadoProceso.EJECUTANDO],
        [EstadoProceso.EJECUTANDO]: [EstadoProceso.LISTO, EstadoProceso.BLOQUEADO, EstadoProceso.TERMINADO],
        [EstadoProceso.BLOQUEADO]: [EstadoProceso.LISTO],
        [EstadoProceso.TERMINADO]: []
    };

    private readonly pid: number;
    private readonly memoriaRequerida: number;
    private readonly cpuTotal: number;
    private readonly eventoES: IEventoES | null;
    
    private estado: EstadoProceso;
    private cpuRestante: number;
    private quantumConsumido: number;
    private bloqueoRestante: number = 0;
    private yaSeBloqueo: boolean = false;

    constructor(pid: number, memoriaRequerida: number, cpuTotal: number, eventoES: IEventoES | null = null) {
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
        const pidValido = Reglas.esEnteroPositivo(this.pid);
        const memoriaValida = Reglas.esEnteroPositivo(this.memoriaRequerida);
        const cpuValido = Reglas.esEnteroPositivo(this.cpuTotal);
        const eventoValido = this.eventoES === null || this.eventoES.esValido();

        return pidValido && memoriaValida && cpuValido && eventoValido;
    }

    cambiarEstado(nuevoEstado: EstadoProceso): void {
        const permitido = Proceso.TRANSICIONES[this.estado].includes(nuevoEstado);
        Reglas.exigir(permitido, `Transición no permitida: ${this.estado} -> ${nuevoEstado}`);
        this.estado = nuevoEstado;
    }

    ejecutarUnTick(): void {
        this.cpuRestante = Math.max(0, this.cpuRestante - 1);
        this.quantumConsumido = this.quantumConsumido + 1;
    }

    reiniciarQuantum(): void {
        this.quantumConsumido = 0;
    }

    public getTamano(): number {
        return this.memoriaRequerida;
    }

    // Métodos de E/S 
    public getEventoES(): IEventoES | null { return this.eventoES; }
    public getBloqueoRestante(): number { return this.bloqueoRestante; }

    // El evento se dispara una sola vez, cuando el proceso consumió los ticks de CPU indicados y todavía no terminó.
    public debeBloquearse(): boolean {
        const consumido = this.cpuTotal - this.cpuRestante;
        return this.eventoES !== null
            && !this.yaSeBloqueo
            && this.cpuRestante > 0
            && consumido >= this.eventoES.getTickDisparo();
    }
    
    public iniciarBloqueo(): void {
        this.bloqueoRestante = this.eventoES?.getDuracion() ?? 0;
        this.yaSeBloqueo = true;
    }

    public reducirBloqueo(): void {
        this.bloqueoRestante = Math.max(0, this.bloqueoRestante - 1);
    }

}