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

describe('Entidad BloqueMemoria - Particion (RF04)', () => {
    test('Debe dividirse y retornar un nuevo bloque libre si sobra espacio', () => {
        const bloque = new BloqueMemoria(0, 1024);
        const nuevoBloqueSobrante = bloque.dividir(200);

        expect(bloque.getTamano()).toBe(200);
        
        expect(nuevoBloqueSobrante).not.toBeNull();
        expect(nuevoBloqueSobrante?.getInicio()).toBe(200);
        expect(nuevoBloqueSobrante?.getTamano()).toBe(824);
        expect(nuevoBloqueSobrante?.estaLibre()).toBe(true);
    });

    test('No debe dividirse ni retornar nada si la asignacion es exacta', () => {
        const bloque = new BloqueMemoria(0, 1024);
        
        const nuevoBloqueSobrante = bloque.dividir(1024);

        expect(bloque.getTamano()).toBe(1024);
        expect(nuevoBloqueSobrante).toBeNull(); 
    });
});