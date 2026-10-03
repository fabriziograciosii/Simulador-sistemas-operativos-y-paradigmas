import { IProceso } from '../procesos/IProceso';
import { IPlanificarTurno } from './IPlanificarTurno';

export class RoundRobin implements IPlanificarTurno {
    private readonly quantum: number;

    constructor(quantum: number) {
        this.quantum = quantum;
    }

    public getQuantum(): number {
        return this.quantum;
    }

    public rotarCola(colaListos: IProceso[]): IProceso[] {

        return colaListos.length > 1 
            ? [...colaListos.slice(1), colaListos[0]]
            : [...colaListos];
    }
}