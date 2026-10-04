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

        test('Debe ejecutar un tick y descontar tiempo al proceso asignado', () => {
        const cpu = new Procesador();
        const procesoP2 = new Proceso(2, 100, 5);
        
        cpu.asignarProceso(procesoP2);
        
        // El proceso tenía 5 de CPU total. Le damos 1 tick.
        cpu.ejecutarTick(); 
        
        const procesoCorriendo = cpu.getProcesoActual();
        
        // Le deben quedar 4 de CPU y haber consumido 1 de quantum
        expect(procesoCorriendo?.getCpuRestante()).toBe(4);
        expect(procesoCorriendo?.getQuantumConsumido()).toBe(1);
    });

    test('Debe liberar el procesador devolviendo el proceso saliente', () => {
        const cpu = new Procesador();
        const procesoP3 = new Proceso(3, 100, 5);
        
        cpu.asignarProceso(procesoP3);
        const procesoSaliente = cpu.liberarProcesador();
        
        // Comprobamos que lo expulsó bien y la CPU quedó libre
        expect(procesoSaliente?.getPid()).toBe(3);
        expect(cpu.estaLibre()).toBe(true);
        expect(cpu.getProcesoActual()).toBeNull();
    });

});