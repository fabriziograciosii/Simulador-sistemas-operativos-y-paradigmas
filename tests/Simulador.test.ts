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

    describe('2. Registro y Avance (El Reloj)', () => {
        test('Mantiene el orden de llegada en la cola de Nuevos', () => {
            const simulador = new Simulador(new GestorMemoria(1024, new BestFit()), new Procesador(), new RoundRobin(2));
            // agregamos dos procesos en orden
            simulador.agregarProceso(new Proceso(1, 100, 3));
            simulador.agregarProceso(new Proceso(2, 200, 3));

            // validamos que se respete quien llego primero
            const nuevos = simulador.getProcesosNuevos();
            expect(nuevos.length).toBe(2);
            expect(nuevos[0].getPid()).toBe(1);
            expect(nuevos[1].getPid()).toBe(2);
        });

        test('Al avanzar el tick, los procesos migran de Nuevos a Esperando Memoria y a Listos', () => {
            const simulador = new Simulador(new GestorMemoria(1024, new BestFit()), new Procesador(), new RoundRobin(2));
            simulador.agregarProceso(new Proceso(1, 100, 3));
            
            // ejecutamos el reloj para mover el proceso de cola
            simulador.ejecutarReloj(); 
            
            // como hay memoria libre, no deberia quedar en espera
            expect(simulador.getProcesosNuevos().length).toBe(0);
            expect(simulador.getProcesosEsperandoMemoria().length).toBe(0);
        });
    });

    describe('3. Admisión y Asignación de Memoria (Best-Fit)', () => {
        test('Procesos que superan la memoria libre quedan retenidos en Esperando', () => {
            // creamos una memoria chica de 500kb
            const simulador = new Simulador(new GestorMemoria(500, new BestFit()), new Procesador(), new RoundRobin(2));
            
            simulador.agregarProceso(new Proceso(1, 400, 5)); // este entra
            simulador.agregarProceso(new Proceso(2, 200, 5)); // este rebota por falta de espacio
            
            simulador.ejecutarReloj();

            // validamos que el p2 quede trabado esperando ram
            expect(simulador.getProcesosEsperandoMemoria().length).toBe(1);
            expect(simulador.getProcesosEsperandoMemoria()[0].getPid()).toBe(2);
        });

        test('Admite procesos pequeños aunque uno grande esté esperando (Evita Deadlock)', () => {
            const simulador = new Simulador(new GestorMemoria(500, new BestFit()), new Procesador(), new RoundRobin(2));
            
            // p1 entra y sobran 100kb
            simulador.agregarProceso(new Proceso(1, 400, 5)); 
            // p2 necesita 300kb asi que tiene que esperar
            simulador.agregarProceso(new Proceso(2, 300, 5)); 
            // p3 entra justo en el hueco de 100kb
            simulador.agregarProceso(new Proceso(3, 50, 5));  

            simulador.ejecutarReloj();

            // verificamos que p2 siga esperando pero p3 haya pasado
            expect(simulador.getProcesosEsperandoMemoria().length).toBe(1);
            expect(simulador.getProcesosEsperandoMemoria()[0].getPid()).toBe(2); 
            expect(simulador.getProcesosListos().length).toBe(1);
            expect(simulador.getProcesosListos()[0].getPid()).toBe(3);
        });
    });

});