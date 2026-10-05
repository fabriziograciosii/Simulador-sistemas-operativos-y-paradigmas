import { IProceso } from '../procesos/IProceso';
import { IPlanificarTurno } from './IPlanificarTurno';
import { Reglas } from '../comun/Reglas';

export class RoundRobin implements IPlanificarTurno {
    private readonly quantum: number;

    constructor(quantum: number) {
        Reglas.exigir(Reglas.esEnteroPositivo(quantum), 'El quantum debe ser un entero positivo');
        this.quantum = quantum;
    }

    public getQuantum(): number {
        return this.quantum;
    }

    public quantumAgotado(proceso: IProceso): boolean {
        return proceso.getQuantumConsumido() >= this.quantum;
    }

    // El primero de la cola pasa al final (orden FIFO circular).
    public rotarCola(colaListos: IProceso[]): IProceso[] {

        return colaListos.length > 1 
            ? [...colaListos.slice(1), colaListos[0]]
            : [...colaListos];
    }
}