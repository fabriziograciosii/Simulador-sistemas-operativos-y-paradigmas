import { describe, test, expect } from 'vitest';
import { Proceso } from '../src/procesos/Proceso';
import { EventoES } from '../src/procesos/EventoES';
import { EstadoProceso } from '../src/procesos/EstadoProceso';

describe('Proceso: validación, estados y E/S (RF02, RF03 y RF08)', () => {
    test('Un proceso con evento de E/S inválido o con decimales no es válido', () => {
        expect(new Proceso(1, 200, 5, new EventoES(0, 2)).esValido()).toBe(false);
        expect(new Proceso(1, 200, 5, new EventoES(2, 0)).esValido()).toBe(false);
        expect(new Proceso(1, 200.5, 5).esValido()).toBe(false);
        expect(new Proceso(1, 200, 5, new EventoES(2, 3)).esValido()).toBe(true);
    });

    test('Recorre el ciclo de vida por transiciones válidas', () => {
        const proceso = new Proceso(1, 100, 5);

        proceso.cambiarEstado(EstadoProceso.ESPERANDO_MEMORIA);
        proceso.cambiarEstado(EstadoProceso.LISTO);
        proceso.cambiarEstado(EstadoProceso.EJECUTANDO);
        proceso.cambiarEstado(EstadoProceso.BLOQUEADO);
        proceso.cambiarEstado(EstadoProceso.LISTO);
        proceso.cambiarEstado(EstadoProceso.EJECUTANDO);
        proceso.cambiarEstado(EstadoProceso.TERMINADO);

        expect(proceso.getEstado()).toBe(EstadoProceso.TERMINADO);
    });

    test('Rechaza un salto imposible y un Terminado no vuelve a ninguna cola', () => {
        const proceso = new Proceso(1, 100, 5);

        expect(() => proceso.cambiarEstado(EstadoProceso.EJECUTANDO)).toThrow('Transición no permitida');
        expect(proceso.getEstado()).toBe(EstadoProceso.NUEVO);

        proceso.cambiarEstado(EstadoProceso.ESPERANDO_MEMORIA);
        proceso.cambiarEstado(EstadoProceso.LISTO);
        proceso.cambiarEstado(EstadoProceso.EJECUTANDO);
        proceso.cambiarEstado(EstadoProceso.TERMINADO);
        expect(() => proceso.cambiarEstado(EstadoProceso.LISTO)).toThrow();
    });

    test('Reinicia el quantum consumido sin tocar la CPU restante', () => {
        const proceso = new Proceso(2, 100, 5);
        proceso.ejecutarUnTick();
        proceso.ejecutarUnTick();

        proceso.reiniciarQuantum();

        expect(proceso.getQuantumConsumido()).toBe(0);
        expect(proceso.getCpuRestante()).toBe(3);
    });
});