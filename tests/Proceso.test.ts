import { Proceso } from '../src/procesos/Proceso';
import { EstadoProceso } from '../src/procesos/EstadoProceso';
import { describe, test, expect } from 'vitest';

describe('Entidad Proceso', () => {
    test('Debe inicializar correctamente y corregir valores inválidos', () => {

        const proceso = new Proceso(1, -50, 0); 
        const vista = proceso.obtenerVista();

        expect(vista.pid).toBe(1);
        expect(vista.estado).toBe(EstadoProceso.NUEVO);
        expect(vista.memoriaRequerida).toBe(1); 
        expect(vista.cpuTotal).toBe(1); 
    });
});