import { IProceso } from '../procesos/IProceso';
import { IBloqueMemoria } from './IBloqueMemoria';

export class BloqueMemoria implements IBloqueMemoria {
    private readonly inicio: number;
    private readonly tamano: number;
    private libre: boolean;
    private proceso: IProceso | null;

    constructor(inicio: number, tamano: number) {
        this.inicio = inicio;
        this.tamano = tamano;
        this.libre = true;
        this.proceso = null;
    }

    getInicio(): number {
        return this.inicio;
    }

    getTamano(): number {
        return this.tamano;
    }

    estaLibre(): boolean {
        return this.libre;
    }

    getProceso(): IProceso | null {
        return this.proceso;
    }
}