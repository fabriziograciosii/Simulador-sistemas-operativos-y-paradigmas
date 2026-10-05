import { IGestorMemoria } from './IGestorMemoria';
import { IBuscarHueco } from './IBuscarHueco';
import { IBloqueMemoria } from './IBloqueMemoria';
import { IVistaBloque } from './IVistaBloque';
import { BloqueMemoria } from './BloqueMemoria';
import { IProceso } from '../procesos/IProceso';
import { Reglas } from '../comun/Reglas';

export class GestorMemoria implements IGestorMemoria {
    // Invariante: los bloques están siempre ordenados por dirección, sin huecos ni solapamientos.
    private bloques: IBloqueMemoria[];
    private readonly algoritmo: IBuscarHueco; 
    private readonly tamanoTotal: number;

    constructor(tamanoTotal: number, algoritmo: IBuscarHueco) {
        Reglas.exigir(Reglas.esEnteroPositivo(tamanoTotal), 'La memoria total debe ser un entero positivo');

        this.tamanoTotal = tamanoTotal;
        this.bloques = [new BloqueMemoria(0, tamanoTotal)];
        this.algoritmo = algoritmo;
    }

    asignarMemoria(proceso: IProceso): boolean {

        const bloqueElegido = this.algoritmo.buscarBloque(this.bloques, proceso.getTamano());


        const sobrante = bloqueElegido !== null ? bloqueElegido.dividir(proceso.getTamano()) : null;

        // El sobrante se inserta justo después del bloque dividido para conservar el orden por dirección.
        const posicion = bloqueElegido !== null ? this.bloques.indexOf(bloqueElegido) : -1;
        sobrante !== null ? this.bloques.splice(posicion + 1, 0, sobrante) : null;

        bloqueElegido !== null ? bloqueElegido.asignarProceso(proceso) : null;
        

        return bloqueElegido !== null;
    }

    public liberarMemoria(proceso: IProceso): void {
        for (let i = 0; i < this.bloques.length; i++) {
            const bloque = this.bloques[i];
            const esElBloqueDelProceso = bloque.getProceso() === proceso;
            
            esElBloqueDelProceso ? bloque.liberar() : null;
        }
        this.coalescer();
    }

    // Fusión automática de bloques libres adyacentes (izquierda y derecha). No mueve bloques ocupados.
    private coalescer(): void {
        const bloquesFusionados: IBloqueMemoria[] = [];
        
        for (let i = 0; i < this.bloques.length; i++) {
            const actual = this.bloques[i];
            const ultimo = bloquesFusionados.length > 0 ? bloquesFusionados[bloquesFusionados.length - 1] : null;

            const sonAdyacentesYLibres = ultimo !== null && 
                ultimo.estaLibre() && 
                actual.estaLibre() && 
                (ultimo.getInicio() + ultimo.getTamano() === actual.getInicio());

            sonAdyacentesYLibres ? ultimo.expandir(actual.getTamano()) : bloquesFusionados.push(actual);
        }

        this.bloques = bloquesFusionados;
    }

    public getMemoriaTotal(): number {
        return this.tamanoTotal;
    }

    public getMemoriaLibreTotal(): number {
        let total = 0;
        for (let i = 0; i < this.bloques.length; i++) {
                // Sumamos el tamaño si está libre, o sumamos 0 si está ocupado
            total += this.bloques[i].estaLibre() ? this.bloques[i].getTamano() : 0;
        }
        return total;
    }

    public getMayorHuecoLibre(): number {
        let mayor = 0;
        
        for (let i = 0; i < this.bloques.length; i++) {
            const esMayorHuecoLibre = this.bloques[i].estaLibre() && this.bloques[i].getTamano() > mayor;
            mayor = esMayorHuecoLibre ? this.bloques[i].getTamano() : mayor;
        }
        return mayor;
    }

    // 100 × memoria ocupada / memoria total
    public getOcupacionMemoria(): number {
        return ((this.tamanoTotal - this.getMemoriaLibreTotal()) / this.tamanoTotal) * 100;
    }

    public getMapaMemoria(): ReadonlyArray<IVistaBloque> {
        return this.bloques.map((bloque) => ({
            inicio: bloque.getInicio(),
            tamano: bloque.getTamano(),
            libre: bloque.estaLibre(),
            pid: bloque.getProceso()?.getPid() ?? null
        }));
    }
}
