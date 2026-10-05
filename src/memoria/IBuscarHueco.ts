import { IBloqueMemoria } from './IBloqueMemoria';

export interface IBuscarHueco {
    buscarBloque(bloques: ReadonlyArray<IBloqueMemoria>, tamanoRequerido: number): IBloqueMemoria | null;
}
