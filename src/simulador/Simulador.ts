import { IProceso } from '../procesos/IProceso';
import { EstadoProceso } from '../procesos/EstadoProceso';
import { IGestorMemoria } from '../memoria/IGestorMemoria';
import { IProcesador } from '../cpu/IProcesador';
import { IPlanificarTurno } from '../cpu/IPlanificarTurno';
import { ISimulador } from './ISimulador';

export class Simulador implements ISimulador {
    private _gestorMemoria: IGestorMemoria;
    private _procesador: IProcesador;
    private _planificador: IPlanificarTurno;

    private _procesosNuevos: IProceso[] = [];
    private _procesosEsperandoMemoria: IProceso[] = [];
    private _procesosListos: IProceso[] = [];
    private _procesosBloqueados: IProceso[] = [];
    private _procesosTerminados: IProceso[] = [];

    private _ticksTotales: number = 0;
    private _ticksCPUOcupada: number = 0;
    private _cambiosDeContexto: number = 0;

    constructor(
        gestorMemoria: IGestorMemoria,
        procesador: IProcesador,
        planificador: IPlanificarTurno
    ) {
        this._gestorMemoria = gestorMemoria;
        this._procesador = procesador;
        this._planificador = planificador;
    }

    public getProcesosNuevos(): IProceso[] { return this._procesosNuevos; }
    public getProcesosEsperandoMemoria(): IProceso[] { return this._procesosEsperandoMemoria; }
    public getProcesosListos(): IProceso[] { return this._procesosListos; }
    public getProcesosBloqueados(): IProceso[] { return this._procesosBloqueados; }
    public getProcesosTerminados(): IProceso[] { return this._procesosTerminados; }

    public agregarProceso(proceso: IProceso): void {
        this._procesosNuevos = [...this._procesosNuevos, proceso];
    }

    public ejecutarReloj(): void {
        this._ticksTotales++; 
        !this._procesador.estaLibre() ? this._ticksCPUOcupada++ : undefined;

        this.despertarProcesosNuevos();
        this.admitirEnMemoria();
        this.gestionarCPU();
        this._procesador.ejecutarTick();
    }

    // --- MÉTODOS PRIVADOS ---

    private despertarProcesosNuevos(): void {
        for (let i = 0; i < this._procesosNuevos.length; i++) {
            this._procesosNuevos[i].cambiarEstado(EstadoProceso.ESPERANDO_MEMORIA);
        }
        this._procesosEsperandoMemoria = [...this._procesosEsperandoMemoria, ...this._procesosNuevos];
        this._procesosNuevos = []; 
    }

    private admitirEnMemoria(): void {
        let siguenEsperando: IProceso[] = [];

        for (let i = 0; i < this._procesosEsperandoMemoria.length; i++) {
            const proceso = this._procesosEsperandoMemoria[i];
            const pudoEntrar = this._gestorMemoria.asignarMemoria(proceso);

            pudoEntrar ? proceso.cambiarEstado(EstadoProceso.LISTO) : undefined;
            pudoEntrar ? this._procesosListos = [...this._procesosListos, proceso] : undefined;
            !pudoEntrar ? siguenEsperando = [...siguenEsperando, proceso] : undefined;
        }

        this._procesosEsperandoMemoria = siguenEsperando;
    }

    private gestionarCPU(): void {
        const actual = this._procesador.getProcesoActual();

        const termino = actual !== null && actual.getCpuRestante() === 0;
        const agotoQuantum = actual !== null && !termino && actual.getQuantumConsumido() >= this._planificador.getQuantum();
        const cpuLibre = this._procesador.estaLibre() || termino || agotoQuantum;
        const hayListos = this._procesosListos.length > 0;

        termino ? this.finalizarProcesoActual(actual as IProceso) : undefined;
        agotoQuantum ? this.rotarProcesoActual(actual as IProceso) : undefined;
        
        (cpuLibre && hayListos) ? this.despacharSiguienteProceso() : undefined;
    }

    private finalizarProcesoActual(proceso: IProceso): void {
        this._procesador.liberarProcesador();
        proceso.cambiarEstado(EstadoProceso.TERMINADO);
        this._procesosTerminados = [...this._procesosTerminados, proceso];
        this._gestorMemoria.liberarMemoria(proceso);
    }

    private rotarProcesoActual(proceso: IProceso): void {
        this._cambiosDeContexto++;
        this._procesador.liberarProcesador();
        proceso.cambiarEstado(EstadoProceso.LISTO);
        this._procesosListos = [...this._procesosListos, proceso];
    }

    private despacharSiguienteProceso(): void {
        const siguiente = this._procesosListos[0];
        
        this._procesador.asignarProceso(siguiente);
        siguiente.cambiarEstado(EstadoProceso.EJECUTANDO);
        
        this._procesosListos = this._procesosListos.slice(1);
    }

    // CÁLCULO DE MÉTRICAS 

    public getPorcentajeUsoCPU(): number {
        return this._ticksTotales === 0 ? 0 : (this._ticksCPUOcupada / this._ticksTotales) * 100;
    }

    public getCambiosDeContexto(): number {
        return this._cambiosDeContexto;
    }

    public getFragmentacionExterna(): number {
        const libreTotal = this._gestorMemoria.getMemoriaLibreTotal();
        const mayorHueco = this._gestorMemoria.getMayorHuecoLibre();
        
        return libreTotal === 0 ? 0 : (1 - (mayorHueco / libreTotal)) * 100;
    }
}