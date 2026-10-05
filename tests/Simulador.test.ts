import { describe, test, expect } from 'vitest';
import { Simulador } from '../src/simulador/Simulador';
import { GestorMemoria } from '../src/memoria/GestorMemoria';
import { BestFit } from '../src/memoria/BestFit';
import { Procesador } from '../src/cpu/Procesador';
import { RoundRobin } from '../src/cpu/RoundRobin';
import { Proceso } from '../src/procesos/Proceso';

describe('Batería Exhaustiva de Pruebas AE2 - Simulador OS', () => {

    describe('1. Estado Inicial y Configuración', () => {
        test('El simulador debe arrancar con todas las colas de estado vacías', () => {
            // inicializamos el simulador con memoria, cpu y planificador
            const simulador = new Simulador(new GestorMemoria(1024, new BestFit()), new Procesador(), new RoundRobin(2));
            
            // al principio no deberia haber ningun proceso cargado
            expect(simulador.getProcesosNuevos().length).toBe(0);
            expect(simulador.getProcesosEsperandoMemoria().length).toBe(0);
            expect(simulador.getProcesosListos().length).toBe(0);
            expect(simulador.getProcesosBloqueados().length).toBe(0);
            expect(simulador.getProcesosTerminados().length).toBe(0);
        });

        test('Las métricas deben iniciar en 0 absoluto', () => {
            const simulador = new Simulador(new GestorMemoria(1024, new BestFit()), new Procesador(), new RoundRobin(2));
            
            // comprobamos que los calculos arranquen en cero
            expect(simulador.getPorcentajeUsoCPU()).toBe(0);
            expect(simulador.getCambiosDeContexto()).toBe(0);
            expect(simulador.getFragmentacionExterna()).toBe(0);
        });
    });

});