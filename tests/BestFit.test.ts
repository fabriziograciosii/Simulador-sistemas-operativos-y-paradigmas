import { describe, test, expect } from 'vitest';
import { BestFit } from '../src/memoria/BestFit';
import { BloqueMemoria } from '../src/memoria/BloqueMemoria';

describe('Algoritmo Best-Fit (RF04)', () => {
    test('Debe encontrar el hueco libre más ajustado', () => {
        const algoritmo = new BestFit();
        
        const bloques = [
            new BloqueMemoria(0, 200),
            new BloqueMemoria(500, 100),
            new BloqueMemoria(600, 424)
        ];

        const bloqueElegido = algoritmo.buscarBloque(bloques, 90);

        expect(bloqueElegido).not.toBeNull();
        expect(bloqueElegido?.getInicio()).toBe(500);
        expect(bloqueElegido?.getTamano()).toBe(100);
    });

    test('Debe retornar null si ningún bloque libre es lo suficientemente grande', () => {
        const algoritmo = new BestFit();
        
        // Memoria con bloques chiquitos
        const bloques = [
            new BloqueMemoria(0, 50),
            new BloqueMemoria(50, 80)
        ];

        // Un proceso pide 100 KB (no entra en ninguno)
        const bloqueElegido = algoritmo.buscarBloque(bloques, 100);

        // El algoritmo debe rendirse y devolver null
        expect(bloqueElegido).toBeNull();
    });

    test('Debe elegir el bloque exacto si hay uno del mismo tamaño (sobrante cero)', () => {
        const algoritmo = new BestFit();
        
        const bloques = [
            new BloqueMemoria(0, 500),
            new BloqueMemoria(500, 100), // Encaje perfecto
            new BloqueMemoria(600, 200)
        ];

        // Pide exactamente 100
        const bloqueElegido = algoritmo.buscarBloque(bloques, 100);

        expect(bloqueElegido).not.toBeNull();
        expect(bloqueElegido?.getTamano()).toBe(100);
    });
});