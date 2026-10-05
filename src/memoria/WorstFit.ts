import { IBuscarHueco } from './IBuscarHueco';
import { IBloqueMemoria } from './IBloqueMemoria';

export class WorstFit implements IBuscarHueco {
    buscarBloque(bloques: ReadonlyArray<IBloqueMemoria>, tamanoRequerido: number): IBloqueMemoria | null {
        let peorBloque: IBloqueMemoria | null = null;

        for (let i = 0; i < bloques.length; i++) {
            const bloque = bloques[i];
            
            const esCandidatoValido = bloque.estaLibre() && bloque.getTamano() >= tamanoRequerido;
            
            const esElMasHolgado: boolean = peorBloque === null ? true : bloque.getTamano() > peorBloque.getTamano();

            peorBloque = (esCandidatoValido && esElMasHolgado) ? bloque : peorBloque;
        }

        return peorBloque;
    }
}