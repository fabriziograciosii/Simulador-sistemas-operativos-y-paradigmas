import { describe, test, expect } from 'vitest';
import { BloqueMemoria } from '../src/memoria/BloqueMemoria';
import { Proceso } from '../src/procesos/Proceso';

describe('Entidad BloqueMemoria - Inicializacion (RF04)', () => {
    test('Debe inicializarse libre, sin proceso, con su inicio y tamaño correctos', () => {

        const bloque = new BloqueMemoria(0, 1024);

        expect(bloque.getInicio()).toBe(0);
        expect(bloque.getTamano()).toBe(1024); 
        expect(bloque.estaLibre()).toBe(true);
        expect(bloque.getProceso()).toBe(null); 
    });
});

describe('Entidad BloqueMemoria - Comportamiento (RF04 y RF05)', () => {
    test('Debe poder asignar un proceso y marcarse como ocupado', () => {
        const bloque = new BloqueMemoria(0, 1024);
        const proceso = new Proceso(1, 200, 5);

        bloque.asignarProceso(proceso);

        expect(bloque.estaLibre()).toBe(false);
        expect(bloque.getProceso()).toBe(proceso);
    });

    test('Debe poder liberarse y vaciar su referencia al proceso', () => {
        const bloque = new BloqueMemoria(0, 1024);
        const proceso = new Proceso(1, 200, 5);

        bloque.asignarProceso(proceso);
        
        bloque.liberar();

        expect(bloque.estaLibre()).toBe(true);
        expect(bloque.getProceso()).toBe(null);
    });
});