import { IProceso } from '../procesos/IProceso';
import { IProcesador } from './IProcesador';

export class Procesador implements IProcesador {
    // La CPU arranca vacía (null)
    private procesoActual: IProceso | null = null;

    public getProcesoActual(): IProceso | null {
        return this.procesoActual;
    }

    public estaLibre(): boolean {
        // Devuelve true si es null, false si tiene un proceso adentro
        return this.procesoActual === null;
    }

    public asignarProceso(proceso: IProceso): void {
        this.procesoActual = proceso;
    }

    public liberarProcesador(): IProceso | null {
        // Guardamos el proceso que estaba corriendo, limpiamos la CPU y lo devolvemos
        const procesoSaliente = this.procesoActual;
        this.procesoActual = null;
        return procesoSaliente;
    }

    public ejecutarTick(): void {
  
        this.procesoActual !== null 
            ? this.procesoActual.ejecutarUnTick() 
            : undefined;
    }
}