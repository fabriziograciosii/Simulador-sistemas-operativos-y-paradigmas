import { describe, test, expect } from 'vitest';
import { WorstFit } from '../src/memoria/WorstFit';
import { BloqueMemoria } from '../src/memoria/BloqueMemoria';

describe('Algoritmo Worst-Fit', () => {
    test('Debe encontrar el hueco libre más grande disponible', () => {
        const algoritmo = new WorstFit();
        
        const bloques = [
            new BloqueMemoria(0, 200),
            new BloqueMemoria(200, 100),
            new BloqueMemoria(300, 500), 
            new BloqueMemoria(800, 300)
        ];

        // Pedimos 90 KB
        const bloqueElegido = algoritmo.buscarBloque(bloques, 90);

        expect(bloqueElegido).not.toBeNull();
        expect(bloqueElegido?.getInicio()).toBe(300);
        expect(bloqueElegido?.getTamano()).toBe(500);
    });

    test('Debe retornar null si ningún bloque libre es lo suficientemente grande', () => {
        const algoritmo = new WorstFit();
        
        const bloques = [
            new BloqueMemoria(0, 50),
            new BloqueMemoria(50, 80)
        ];

        const bloqueElegido = algoritmo.buscarBloque(bloques, 100);

        expect(bloqueElegido).toBeNull();
    });
});