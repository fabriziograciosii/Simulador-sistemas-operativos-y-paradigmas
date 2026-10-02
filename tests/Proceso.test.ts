import { describe, test, expect } from 'vitest';
import { Proceso } from '../src/procesos/Proceso';

describe('Entidad Proceso - Inicializacion', () => {
    test('Debe guardar el PID, la memoria requerida y la CPU total al crearse', () => {

        const proceso = new Proceso(1, 200, 5);

        expect(proceso.getPid()).toBe(1);
        expect(proceso.getMemoriaRequerida()).toBe(200);
        expect(proceso.getCpuTotal()).toBe(5);
    });
});