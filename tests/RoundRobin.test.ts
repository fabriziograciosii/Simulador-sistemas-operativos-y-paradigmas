import { describe, test, expect } from 'vitest';
import { RoundRobin } from '../src/cpu/RoundRobin';
import { Proceso } from '../src/procesos/Proceso';

describe('Algoritmo de Planificación: Round Robin', () => {
    
    test('Debe inicializarse con el quantum asignado', () => {
        const rr = new RoundRobin(3);
        expect(rr.getQuantum()).toBe(3);
    });

    test('No debe alterar la cola si está vacía o tiene un solo proceso', () => {
        const rr = new RoundRobin(2);
        const p1 = new Proceso(1, 100, 5); 
        
        // Cola vacía
        const colaVacia = rr.rotarCola([]);
        expect(colaVacia.length).toBe(0);

        // Cola con 1 solo elemento
        const colaUnProceso = rr.rotarCola([p1]);
        expect(colaUnProceso[0].getPid()).toBe(1);
        expect(colaUnProceso.length).toBe(1);
    });

    test('Debe rotar la cola correctamente (el primero pasa al final)', () => {
        const rr = new RoundRobin(2);
        const p1 = new Proceso(1, 100, 5);
        const p2 = new Proceso(2, 200, 3);
        const p3 = new Proceso(3, 300, 4);

        const colaOriginal = [p1, p2, p3];
        const colaRotada = rr.rotarCola(colaOriginal);

        // El orden original era: p1, p2, p3
        // El nuevo orden debe ser: p2, p3, p1
        expect(colaRotada.length).toBe(3);
        expect(colaRotada[0].getPid()).toBe(2);
        expect(colaRotada[1].getPid()).toBe(3);
        expect(colaRotada[2].getPid()).toBe(1);
    });
});