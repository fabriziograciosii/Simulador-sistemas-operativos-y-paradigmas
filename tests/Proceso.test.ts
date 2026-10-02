import { describe, test, expect } from 'vitest';
import { Proceso } from '../src/procesos/Proceso';

describe('Entidad Proceso - Inicializacion', () => {
    test('Debe guardar el PID, la memoria requerida y la CPU total al crearse', () => {

        const proceso = new Proceso(1, 200, 5);

        expect(proceso.getPid()).toBe(1);
        expect(proceso.getMemoriaRequerida()).toBe(200);
        expect(proceso.getCpuTotal()).toBe(5);
    });
    
    describe('Entidad Proceso - Validacion (RF02)', () => {
    test('Un proceso con datos mayores a cero y sin decimales es valido', () => {
        const proceso = new Proceso(1, 200, 5);
        expect(proceso.esValido()).toBe(true);
    });

    test('Debe rechazar procesos con valores negativos o cero', () => {
        expect(new Proceso(0, 200, 5).esValido()).toBe(false); 
        expect(new Proceso(1, -50, 5).esValido()).toBe(false); 
        expect(new Proceso(1, 200, 0).esValido()).toBe(false); 
    });

    test('Debe rechazar procesos con valores decimales usando matematica basica', () => {
        expect(new Proceso(1.5, 200, 5).esValido()).toBe(false); 
    });
});
});