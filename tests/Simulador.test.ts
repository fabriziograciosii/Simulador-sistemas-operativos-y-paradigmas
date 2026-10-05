import { describe, test, expect } from 'vitest';
import { Simulador } from '../src/simulador/Simulador';
import { GestorMemoria } from '../src/memoria/GestorMemoria';
import { WorstFit } from '../src/memoria/WorstFit';
import { Procesador } from '../src/cpu/Procesador';
import { RoundRobin } from '../src/cpu/RoundRobin';
import { Proceso } from '../src/procesos/Proceso';

describe('Simulador - Prueba de Integración AE2', () => {
    
    test('Debe simular el ingreso y Tick 1 del Proceso P1', () => {
        // 1. Configuramos el hardware según tu código real
        const gestor = new GestorMemoria(1024, new WorstFit());
        const cpu = new Procesador();
        const planificador = new RoundRobin(2); // Quantum = 2
        const simulador = new Simulador(gestor, cpu, planificador);
        
        // 2. Creamos P1 (PID 1, 200 KB, 3 Ticks) y lo agregamos
        const p1 = new Proceso(1, 200, 3);
        simulador.agregarProceso(p1);
        
        // Verificamos que esté en la sala de Nuevos
        expect(simulador.getProcesosNuevos().length).toBe(1);
        
        // --- TICK 1 ---
        // Al ejecutar, P1 pasa por Esperando -> Listo -> Ejecutando
        simulador.ejecutarReloj();
        
        expect(simulador.getProcesosNuevos().length).toBe(0);
        expect(simulador.getProcesosListos().length).toBe(0);
        expect(cpu.getProcesoActual()?.getPid()).toBe(1);
        
        // Como consumió 1 tick en la CPU, le deben quedar 2
        expect(cpu.getProcesoActual()?.getCpuRestante()).toBe(2);
    });

    test('Debe rotar el proceso cuando agota el Quantum y dar turno al siguiente', () => {
        const gestor = new GestorMemoria(1024, new WorstFit());
        const cpu = new Procesador();
        const planificador = new RoundRobin(2); // Quantum = 2
        const simulador = new Simulador(gestor, cpu, planificador);
        
        const p1 = new Proceso(1, 200, 3);
        const p2 = new Proceso(2, 300, 4);
        
        // --- TICK 1 ---
        simulador.agregarProceso(p1);
        simulador.ejecutarReloj(); // P1 entra a la CPU. Quantum consumido = 1.
        
        // --- TICK 2 ---
        simulador.agregarProceso(p2); // Llega P2
        simulador.ejecutarReloj(); // P1 sigue en CPU. Quantum consumido = 2 (¡Se le acabó el tiempo!). P2 entra a Listos.
        
        // --- TICK 3 (La Rotación) ---
        // Al ejecutar este reloj, el simulador debe sacar a P1, mandarlo al final de Listos, y meter a P2.
        simulador.ejecutarReloj(); 
        
        // Verificamos que el cambio de contexto haya ocurrido con éxito
        expect(cpu.getProcesoActual()?.getPid()).toBe(2); // P2 ahora es dueño de la CPU
        expect(simulador.getProcesosListos()[0].getPid()).toBe(1); // P1 volvió a la sala de Listos
    });

});