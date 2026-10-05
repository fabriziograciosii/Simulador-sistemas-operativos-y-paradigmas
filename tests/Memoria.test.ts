import { describe, test, expect } from 'vitest';
import { GestorMemoria } from '../src/memoria/GestorMemoria';
import { BestFit } from '../src/memoria/BestFit';
import { Proceso } from '../src/procesos/Proceso';
import { IBuscarHueco } from '../src/memoria/IBuscarHueco';
import { BloqueMemoria } from '../src/memoria/BloqueMemoria';
import { WorstFit } from '../src/memoria/WorstFit';
import { Simulador } from '../src/simulador/Simulador';
import { Procesador } from '../src/cpu/Procesador';
import { RoundRobin } from '../src/cpu/RoundRobin';

describe('Memoria contigua, coalescencia y fragmentación (RF04, RF05 y RF09)', () => {
    // Memoria de 700 KB llena con A(100) B(100) C(100) D(300) E(100). Al liberar B y D quedan
    // dos huecos no contiguos: 100 KB en la dirección 100 y 300 KB en la dirección 300.
    const memoriaConHuecos = (algoritmo: IBuscarHueco) => {
        const gestor = new GestorMemoria(700, algoritmo);
        const procesos = [100, 100, 100, 300, 100].map((tamano, i) => new Proceso(i + 1, tamano, 1));
        procesos.forEach((p) => gestor.asignarMemoria(p));
        gestor.liberarMemoria(procesos[1]);
        gestor.liberarMemoria(procesos[3]);
        return gestor;
    };

    test('El sobrante queda junto al bloque dividido, por lo que al liberar todo se fusiona en un solo hueco', () => {
        const gestor = new GestorMemoria(1000, new BestFit());
        const [a, b, c, d] = [100, 100, 100, 40].map((t, i) => new Proceso(i + 1, t, 1));
        [a, b, c].forEach((p) => gestor.asignarMemoria(p));
        gestor.liberarMemoria(b);

        // Best-Fit mete a D (40) en el hueco de 100: los 60 que sobran quedan entre D y C
        gestor.asignarMemoria(d);
        expect(gestor.getMemoriaLibreTotal()).toBe(760);
        expect(gestor.getMayorHuecoLibre()).toBe(700);

        // Al liberar D y C, todo lo que no es A debe fusionarse en un único hueco
        gestor.liberarMemoria(d);
        gestor.liberarMemoria(c);
        expect(gestor.getMayorHuecoLibre()).toBe(900);
    });

    test('Ante empate entre huecos del mismo tamaño elige la menor dirección (Best-Fit y Worst-Fit)', () => {
        const bloques = [new BloqueMemoria(0, 300), new BloqueMemoria(400, 300)];

        expect(new BestFit().buscarBloque(bloques, 50)?.getInicio()).toBe(0);
        expect(new WorstFit().buscarBloque(bloques, 50)?.getInicio()).toBe(0);
    });

    
});
