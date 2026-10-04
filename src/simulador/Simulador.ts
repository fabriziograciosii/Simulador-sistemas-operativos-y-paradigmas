import { IProceso } from '../procesos/IProceso';
import { EstadoProceso } from '../procesos/EstadoProceso';
import { IGestorMemoria } from '../memoria/IGestorMemoria';
import { IProcesador } from '../cpu/IProcesador';
import { IPlanificarTurno } from '../cpu/IPlanificarTurno';
import { ISimulador } from './ISimulador';

export class Simulador implements ISimulador {
    // 1. Dependencias (Hardware y Algoritmo)
    private gestorMemoria: IGestorMemoria;
    private procesador: IProcesador;
    private planificador: IPlanificarTurno;

    private procesosNuevos: IProceso[] = [];
    private procesosEsperandoMemoria: IProceso[] = []; // Primera sala de espera
    private procesosListos: IProceso[] = [];           // Segunda sala de espera
    private procesosBloqueados: IProceso[] = [];       // Tercera sala de espera
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

    // 4. Métodos simples de consulta
    public getProcesosNuevos(): IProceso[] { return this.procesosNuevos; }
    public getProcesosEsperandoMemoria(): IProceso[] { return this.procesosEsperandoMemoria; }
    public getProcesosListos(): IProceso[] { return this.procesosListos; }
    public getProcesosBloqueados(): IProceso[] { return this.procesosBloqueados; }
    public getProcesosTerminados(): IProceso[] { return this.procesosTerminados; }

    // 5. Agregar procesos funcionalmente
    public agregarProceso(proceso: IProceso): void {
        // Nace el proceso y pasa a ESPERANDO MEMORIA
        this.procesosNuevos = [...this.procesosNuevos, proceso];
        this.procesosEsperandoMemoria = [...this.procesosEsperandoMemoria, proceso];
    }

    public ejecutarReloj(): void {
        this.despertarProcesosNuevos();
        this.admitirEnMemoria();
        this.gestionarCPU();
        this.procesador.ejecutarTick();
    }

    // 2. Intentamos ubicar en RAM a los que esperan
    private admitirEnMemoria(): void {
        // filter() actúa como nuestro "if" funcional. Solo deja pasar a los que entraron en la RAM.
        const admitidos = this.procesosEsperandoMemoria.filter(p => this.gestorMemoria.asignarMemoria(p));
        
        admitidos.forEach(p => p.cambiarEstado(EstadoProceso.LISTO));
        
        this.procesosListos = [...this.procesosListos, ...admitidos];
        this.procesosEsperandoMemoria = this.procesosEsperandoMemoria.filter(p => !admitidos.includes(p));
    }

    // 3. Evaluar qué pasa con el proceso que está usando la CPU
    private gestionarCPU(): void {
        const actual = this.procesador.getProcesoActual();

        // Evaluamos estados mediante lógica booleana pura
        const termino = actual !== null && actual.getCpuRestante() === 0;
        const agotoQuantum = actual !== null && !termino && actual.getQuantumConsumido() >= this.planificador.getQuantum();
        const cpuLibre = this.procesador.estaLibre() || termino || agotoQuantum;
        const hayListos = this.procesosListos.length > 0;

        // Ejecución de acciones basada en evaluación perezosa (ternarios)
        termino ? this.finalizarProcesoActual(actual) : undefined;
        agotoQuantum ? this.rotarProcesoActual(actual) : undefined;
        
        // Si la CPU quedó libre y hay gente esperando, hacemos pasar al siguiente
        (cpuLibre && hayListos) ? this.despacharSiguienteProceso() : undefined;
    }

    
}