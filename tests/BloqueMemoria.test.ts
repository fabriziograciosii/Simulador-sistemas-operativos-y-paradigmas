import { describe, test, expect } from 'vitest';
import { BloqueMemoria } from '../src/memoria/BloqueMemoria';

describe('Entidad BloqueMemoria - Inicializacion (RF04)', () => {
    test('Debe inicializarse libre, sin proceso, con su inicio y tamaño correctos', () => {

        const bloque = new BloqueMemoria(0, 1024);

        expect(bloque.getInicio()).toBe(0);
        expect(bloque.getTamano()).toBe(1024); 
        expect(bloque.estaLibre()).toBe(true);
        expect(bloque.getProceso()).toBe(null); 
    });
});