import { describe, test, expect } from 'vitest';
import { Procesador } from '../src/cpu/Procesador';
import { Proceso } from '../src/procesos/Proceso';

describe('Hardware Virtual: Procesador', () => {
    
    test('Debe iniciar libre y sin procesos', () => {
        const cpu = new Procesador();
        
        expect(cpu.estaLibre()).toBe(true);
        expect(cpu.getProcesoActual()).toBeNull();
    });

    test('Debe poder asignar un proceso y marcarse como ocupado', () => {
        const cpu = new Procesador();
        // Creamos un proceso que necesita 5 ticks de CPU
        const procesoP1 = new Proceso(1, 100, 5); 
        
        cpu.asignarProceso(procesoP1);
        
        expect(cpu.estaLibre()).toBe(false);
        expect(cpu.getProcesoActual()?.getPid()).toBe(1);
    });


});