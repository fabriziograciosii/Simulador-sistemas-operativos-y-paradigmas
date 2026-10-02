import { IBloqueMemoria } from './IBloqueMemoria';

export interface IBuscarHueco {
    buscarBloque(bloques: IBloqueMemoria[], tamanoRequerido: number): IBloqueMemoria | null;
}