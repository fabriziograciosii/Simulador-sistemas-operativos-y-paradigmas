import { Proceso } from '../src/procesos/Proceso';
import { EstadoProceso } from '../src/procesos/EstadoProceso';
import { describe, test, expect } from 'vitest';

describe('Entidad Proceso', () => {
    test('Debe inicializar correctamente y corregir valores inválidos matemáticamente', () => {
        const proceso = new Proceso(1, -50, 0); 

        expect(proceso.getPid()).toBe(1);
        expect(proceso.getEstado()).toBe(EstadoProceso.NUEVO);
        expect(proceso.getMemoriaRequerida()).toBe(1); 
        expect(proceso.getCpuTotal()).toBe(1); 
    });
});