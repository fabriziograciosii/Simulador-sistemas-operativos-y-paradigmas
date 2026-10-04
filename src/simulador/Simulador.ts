import { IProceso } from '../procesos/IProceso';
import { EstadoProceso } from '../procesos/EstadoProceso';
import { IGestorMemoria } from '../memoria/IGestorMemoria';
import { IProcesador } from '../cpu/IProcesador';
import { IPlanificarTurno } from '../cpu/IPlanificarTurno';
import { ISimulador } from './ISimulador';

export class Simulador implements ISimulador {
    private gestorMemoria: IGestorMemoria;
    private procesador: IProcesador;
    private planificador: IPlanificarTurno;

    private procesosNuevos: IProceso[] = [];
    private procesosEsperandoMemoria: IProceso[] = [];
    private procesosListos: IProceso[] = [];
    private procesosBloqueados: IProceso[] = [];
    private procesosTerminados: IProceso[] = [];

    constructor(
        gestorMemoria: IGestorMemoria,
        procesador: IProcesador,
        planificador: IPlanificarTurno
    ) {
        this.gestorMemoria = gestorMemoria;
        this.procesador = procesador;
        this.planificador = planificador;
    }

    public getProcesosNuevos(): IProceso[] { return this.procesosNuevos; }
    public getProcesosEsperandoMemoria(): IProceso[] { return this.procesosEsperandoMemoria; }
    public getProcesosListos(): IProceso[] { return this.procesosListos; }
    public getProcesosBloqueados(): IProceso[] { return this.procesosBloqueados; }
    public getProcesosTerminados(): IProceso[] { return this.procesosTerminados; }

    public agregarProceso(proceso: IProceso): void {
        this.procesosNuevos = [...this.procesosNuevos, proceso];
    }

    public ejecutarReloj(): void {
        this.despertarProcesosNuevos();
        this.admitirEnMemoria();
        this.gestionarCPU();
        this.procesador.ejecutarTick();
    }

    // --- MÉTODOS PRIVADOS (Faltaban estos en tu archivo) ---

    private despertarProcesosNuevos(): void {
        this.procesosNuevos.forEach(p => p.cambiarEstado(EstadoProceso.ESPERANDO_MEMORIA));
        this.procesosEsperandoMemoria = [...this.procesosEsperandoMemoria, ...this.procesosNuevos];
        this.procesosNuevos = []; 
    }

    private admitirEnMemoria(): void {
        const admitidos = this.procesosEsperandoMemoria.filter(p => this.gestorMemoria.asignarMemoria(p));
        
        admitidos.forEach(p => p.cambiarEstado(EstadoProceso.LISTO));
        
        this.procesosListos = [...this.procesosListos, ...admitidos];
        this.procesosEsperandoMemoria = this.procesosEsperandoMemoria.filter(p => !admitidos.includes(p));
    }

    private gestionarCPU(): void {
        const actual = this.procesador.getProcesoActual();

        const termino = actual !== null && actual.getCpuRestante() === 0;
        const agotoQuantum = actual !== null && !termino && actual.getQuantumConsumido() >= this.planificador.getQuantum();
        const cpuLibre = this.procesador.estaLibre() || termino || agotoQuantum;
        const hayListos = this.procesosListos.length > 0;

        termino ? this.finalizarProcesoActual(actual) : undefined;
        agotoQuantum ? this.rotarProcesoActual(actual) : undefined;
        
        (cpuLibre && hayListos) ? this.despacharSiguienteProceso() : undefined;
    }

    private finalizarProcesoActual(proceso: IProceso): void {
        this.procesador.liberarProcesador();
        proceso.cambiarEstado(EstadoProceso.TERMINADO);
        this.procesosTerminados = [...this.procesosTerminados, proceso];
        this.gestorMemoria.liberarMemoria(proceso);
    }

    private rotarProcesoActual(proceso: IProceso): void {
        this.procesador.liberarProcesador();
        proceso.cambiarEstado(EstadoProceso.LISTO);
        this.procesosListos = [...this.procesosListos, proceso];
    }

    private despacharSiguienteProceso(): void {
        const siguiente = this.procesosListos[0];
        
        this.procesador.asignarProceso(siguiente);
        siguiente.cambiarEstado(EstadoProceso.EJECUTANDO);
        
        this.procesosListos = this.procesosListos.slice(1);
    }
}