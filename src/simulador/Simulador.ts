import { IProceso } from '../procesos/IProceso';
import { EstadoProceso } from '../procesos/EstadoProceso';
import { IGestorMemoria } from '../memoria/IGestorMemoria';
import { IVistaBloque } from '../memoria/IVistaBloque';
import { IProcesador } from '../cpu/IProcesador';
import { IPlanificarTurno } from '../cpu/IPlanificarTurno';
import { ISimulador } from './ISimulador';
import { Reglas } from '../comun/Reglas';

export class Simulador implements ISimulador {
    private _gestorMemoria: IGestorMemoria;
    private _procesador: IProcesador;
    private _planificador: IPlanificarTurno;

    private _pidsRegistrados: Set<number> = new Set<number>();
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

    // Las consultas devuelven copias: modificar el arreglo recibido no altera el estado interno.
    public getTickActual(): number { return this._ticksTotales; }
    public getProcesoEnCPU(): IProceso | null { return this._procesador.getProcesoActual(); }
    public getProcesosNuevos(): IProceso[] { return [...this._procesosNuevos]; }
    public getProcesosEsperandoMemoria(): IProceso[] { return [...this._procesosEsperandoMemoria]; }
    public getProcesosListos(): IProceso[] { return [...this._procesosListos]; }
    public getProcesosBloqueados(): IProceso[] { return [...this._procesosBloqueados]; }
    public getProcesosTerminados(): IProceso[] { return [...this._procesosTerminados]; }
    public getMapaMemoria(): ReadonlyArray<IVistaBloque> { return this._gestorMemoria.getMapaMemoria(); }

    public agregarProceso(proceso: IProceso): void {
        // Se valida todo antes de tocar el estado: un rechazo no deja registros parciales.
        Reglas.exigir(proceso.esValido(), 'Proceso inválido: PID, memoria y CPU deben ser enteros positivos y el evento de E/S, válido');
        Reglas.exigir(!this._pidsRegistrados.has(proceso.getPid()), `PID duplicado: ${proceso.getPid()}`);
        Reglas.exigir(proceso.getMemoriaRequerida() <= this._gestorMemoria.getMemoriaTotal(), 'El proceso solicita más memoria que la memoria total');

        this._pidsRegistrados.add(proceso.getPid());
        this._procesosNuevos = [...this._procesosNuevos, proceso];
    }

    // Un tick = cuatro fases en orden: 1) admisión, 2) bloqueados, 3) despacho y ejecución Round-Robin, 4) reloj y métricas.
    public ejecutarReloj(): void {
        this.despertarProcesosNuevos();
        this.admitirEnMemoria();
        this.actualizarBloqueados();
        this.ejecutarCPU();
        this._ticksTotales++;
    }

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

    private actualizarBloqueados(): void {
        let siguenBloqueados: IProceso[] = [];
        for (let i = 0; i < this._procesosBloqueados.length; i++) {
            const p = this._procesosBloqueados[i];
            p.reducirBloqueo();
            const terminoBloqueo = p.getBloqueoRestante() === 0;

            terminoBloqueo ? p.cambiarEstado(EstadoProceso.LISTO) : undefined;
            terminoBloqueo ? this._procesosListos = [...this._procesosListos, p] : undefined;
            !terminoBloqueo ? siguenBloqueados = [...siguenBloqueados, p] : undefined;
        }
        this._procesosBloqueados = siguenBloqueados;
    }

    private ejecutarCPU(): void {
        const hayListos = this._procesosListos.length > 0;
        (this._procesador.estaLibre() && hayListos) ? this.despacharSiguienteProceso() : undefined;

        const actual = this._procesador.getProcesoActual();
        actual !== null ? this.ejecutarYEvaluar(actual) : undefined;
    }

    // Ejecuta una unidad de CPU y resuelve el resultado en este mismo tick.
    // Prioridad: finalización > bloqueo por E/S > agotamiento de quantum.
    private ejecutarYEvaluar(proceso: IProceso): void {
        this._procesador.ejecutarTick();
        this._ticksCPUOcupada++;

        const termino = proceso.getCpuRestante() === 0;
        const pideBloqueo = !termino && proceso.debeBloquearse();
        const agotoQuantum = !termino && !pideBloqueo && this._planificador.quantumAgotado(proceso);
        const hayOtrosListos = this._procesosListos.length > 0;

        termino ? this.finalizarProcesoActual(proceso) : undefined;
        pideBloqueo ? this.bloquearProcesoActual(proceso) : undefined;
        (agotoQuantum && hayOtrosListos) ? this.rotarProcesoActual(proceso) : undefined;
        (agotoQuantum && !hayOtrosListos) ? proceso.reiniciarQuantum() : undefined;
    }

    private bloquearProcesoActual(proceso: IProceso): void {
        this._cambiosDeContexto++; // Un bloqueo por E/S cuenta como cambio de contexto (convención RF09)
        this._procesador.liberarProcesador();
        proceso.cambiarEstado(EstadoProceso.BLOQUEADO);
        proceso.iniciarBloqueo();
        this._procesosBloqueados = [...this._procesosBloqueados, proceso];
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
        // rotarCola pasa el primero al final: con el proceso expulsado al frente, queda último en la cola de Listos.
        this._procesosListos = this._planificador.rotarCola([proceso, ...this._procesosListos]);
    }

    private despacharSiguienteProceso(): void {
        const siguiente = this._procesosListos[0];

        siguiente.reiniciarQuantum();
        this._procesador.asignarProceso(siguiente);
        siguiente.cambiarEstado(EstadoProceso.EJECUTANDO);
        
        this._procesosListos = this._procesosListos.slice(1);
    }

    // CÁLCULO DE MÉTRICAS

    public getOcupacionMemoria(): number {
        return this._gestorMemoria.getOcupacionMemoria();
    }

    public getPorcentajeUsoCPU(): number {
        return this._ticksTotales === 0 ? 0 : (this._ticksCPUOcupada / this._ticksTotales) * 100;
    }

    public getCambiosDeContexto(): number {
        return this._cambiosDeContexto;
    }

    public getMemoriaLibreTotal(): number {
        return this._gestorMemoria.getMemoriaLibreTotal();
    }

    public getMayorBloqueLibre(): number {
        return this._gestorMemoria.getMayorHuecoLibre();
    }

    public getFragmentacionExterna(): number {
        const libreTotal = this._gestorMemoria.getMemoriaLibreTotal();
        const mayorHueco = this._gestorMemoria.getMayorHuecoLibre();
        
        return libreTotal === 0 ? 0 : (1 - (mayorHueco / libreTotal)) * 100;
    }
}