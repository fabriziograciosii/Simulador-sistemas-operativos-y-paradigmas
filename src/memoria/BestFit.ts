import { IBuscarHueco } from './IBuscarHueco';
import { IBloqueMemoria } from './IBloqueMemoria';

export class BestFit implements IBuscarHueco {
    buscarBloque(bloques: ReadonlyArray<IBloqueMemoria>, tamanoRequerido: number): IBloqueMemoria | null {
        let mejorBloque: IBloqueMemoria | null = null;

        for (let i = 0; i < bloques.length; i++) {
            const bloque = bloques[i];
            
            const esCandidatoValido = bloque.estaLibre() && bloque.getTamano() >= tamanoRequerido;
            
            const esElMasAjustado: boolean = mejorBloque === null ? true : bloque.getTamano() < mejorBloque.getTamano();

            mejorBloque = (esCandidatoValido && esElMasAjustado) ? bloque : mejorBloque;
        }

        return mejorBloque;
    }
}