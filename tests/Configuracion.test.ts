import { describe, test, expect } from 'vitest';
import { GestorMemoria } from '../src/memoria/GestorMemoria';
import { BestFit } from '../src/memoria/BestFit';
import { RoundRobin } from '../src/cpu/RoundRobin';
import { Simulador } from '../src/simulador/Simulador';
import { Procesador } from '../src/cpu/Procesador';
import { Proceso } from '../src/procesos/Proceso';
import { EventoES } from '../src/procesos/EventoES';

describe('Configuración y registro (RF01, RF02 y RF10)', () => {
    test('Rechaza una memoria total que no sea entero positivo', () => {
        expect(() => new GestorMemoria(0, new BestFit())).toThrow('memoria');
        expect(() => new GestorMemoria(-5, new BestFit())).toThrow('memoria');
        expect(() => new GestorMemoria(10.5, new BestFit())).toThrow('memoria');
    });

    test('Rechaza un quantum que no sea entero positivo', () => {
        expect(() => new RoundRobin(0)).toThrow('quantum');
        expect(() => new RoundRobin(-2)).toThrow('quantum');
        expect(() => new RoundRobin(1.5)).toThrow('quantum');
    });

    const crear = (memoria: number = 1024) =>
        new Simulador(new GestorMemoria(memoria, new BestFit()), new Procesador(), new RoundRobin(2));

    test('Rechaza un PID duplicado y no deja registros parciales', () => {
        const simulador = crear();
        simulador.agregarProceso(new Proceso(1, 100, 3));

        expect(() => simulador.agregarProceso(new Proceso(1, 200, 4))).toThrow('PID duplicado');
        expect(simulador.getProcesosNuevos().length).toBe(1);
    });

    test('Rechaza procesos inválidos y pedidos mayores que la memoria total', () => {
        const simulador = crear(500);

        expect(() => simulador.agregarProceso(new Proceso(0, 100, 3))).toThrow('inválido');
        expect(() => simulador.agregarProceso(new Proceso(1, 100, 3, new EventoES(0, 2)))).toThrow('inválido');
        expect(() => simulador.agregarProceso(new Proceso(2, 501, 3))).toThrow('memoria');
        expect(simulador.getProcesosNuevos().length).toBe(0);
    });

    test('Las consultas devuelven copias: modificarlas no altera las colas internas', () => {
        const simulador = crear();
        simulador.agregarProceso(new Proceso(1, 100, 3));

        simulador.getProcesosNuevos().length = 0;

        expect(simulador.getProcesosNuevos().length).toBe(1);
    });
});
