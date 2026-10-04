import { IProceso } from '../procesos/IProceso';
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

    // Dejamos el reloj vacío por ahora
    public ejecutarReloj(): void {
        // Acá irá la lógica del tick en el próximo paso
    }
}