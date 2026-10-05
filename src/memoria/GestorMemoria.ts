import { IGestorMemoria } from './IGestorMemoria';
import { IBuscarHueco } from './IBuscarHueco';
import { IBloqueMemoria } from './IBloqueMemoria';
import { BloqueMemoria } from './BloqueMemoria';
import { IProceso } from '../procesos/IProceso';

export class GestorMemoria implements IGestorMemoria {
    private bloques: IBloqueMemoria[];
    private algoritmo: IBuscarHueco; 

    constructor(tamanoTotal: number, algoritmo: IBuscarHueco) {

        this.bloques = [new BloqueMemoria(0, tamanoTotal)];
        this.algoritmo = algoritmo;
    }

    asignarMemoria(proceso: IProceso): boolean {

        const bloqueElegido = this.algoritmo.buscarBloque(this.bloques, proceso.getTamano());


        const sobrante = bloqueElegido !== null ? bloqueElegido.dividir(proceso.getTamano()) : null;


        sobrante !== null ? this.bloques.push(sobrante) : null;


        bloqueElegido !== null ? bloqueElegido.asignarProceso(proceso) : null;
        

        return bloqueElegido !== null;
    }

    liberarMemoria(proceso: IProceso): void {

        for (let i = 0; i < this.bloques.length; i++) {
            const bloque = this.bloques[i];
            const esElBloqueDelProceso = bloque.getProceso() === proceso;
            
            esElBloqueDelProceso ? bloque.liberar() : null;
        }
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
        let huecoContiguo = 0;
        
        for (let i = 0; i < this.bloques.length; i++) {
            const libre = this.bloques[i].estaLibre();
            const tamano = this.bloques[i].getTamano();
            
            // Si está libre, lo acumulamos con el anterior. Si no, cortamos la racha (vuelve a 0)
            huecoContiguo = libre ? huecoContiguo + tamano : 0;
            
            // Actualizamos el récord del mayor hueco encontrado
            mayor = huecoContiguo > mayor ? huecoContiguo : mayor;
        }
        return mayor;
    }
}