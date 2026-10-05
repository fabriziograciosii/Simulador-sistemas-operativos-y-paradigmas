import { describe, test, expect } from 'vitest';
import { Simulador } from '../src/simulador/Simulador';
import { GestorMemoria } from '../src/memoria/GestorMemoria';
import { BestFit } from '../src/memoria/BestFit';
import { Procesador } from '../src/cpu/Procesador';
import { RoundRobin } from '../src/cpu/RoundRobin';
import { Proceso } from '../src/procesos/Proceso';
import { EventoES } from '../src/procesos/EventoES';
import { EstadoProceso } from '../src/procesos/EstadoProceso';

describe('Bloqueo por Entrada/Salida (RF08)', () => {
    const crear = (quantum: number = 2) => {
        const cpu = new Procesador();
        const gestor = new GestorMemoria(1024, new BestFit());
        return { cpu, gestor, simulador: new Simulador(gestor, cpu, new RoundRobin(quantum)) };
    };

    test('Se bloquea al cumplir sus ticks de CPU, conserva la memoria y no consume CPU mientras espera', () => {
        const { simulador, cpu, gestor } = crear();
        const p1 = new Proceso(1, 100, 3, new EventoES(1, 2));
        simulador.agregarProceso(p1);

        simulador.ejecutarReloj(); // ejecuta 1 tick de CPU, se dispara el evento y pasa a Bloqueado
        expect(p1.getEstado()).toBe(EstadoProceso.BLOQUEADO);
        expect(cpu.getProcesoActual()).toBeNull();
        expect(gestor.getMemoriaLibreTotal()).toBe(924);
        expect(simulador.getCambiosDeContexto()).toBe(1);

        simulador.ejecutarReloj(); // sigue bloqueado (temporizador 2 -> 1) y no consume CPU
        expect(p1.getBloqueoRestante()).toBe(1);
        expect(p1.getCpuRestante()).toBe(2);
    });

    test('Al vencer el temporizador vuelve a Listos, se despacha en ese mismo tick y no se bloquea de nuevo', () => {
        const { simulador } = crear();
        const p1 = new Proceso(1, 100, 3, new EventoES(1, 2));
        simulador.agregarProceso(p1);
        simulador.ejecutarReloj();
        simulador.ejecutarReloj();

        simulador.ejecutarReloj(); // temporizador 1 -> 0: retorna a Listos y se despacha
        expect(p1.getEstado()).toBe(EstadoProceso.EJECUTANDO);
        expect(p1.getCpuRestante()).toBe(1);

        simulador.ejecutarReloj();
        expect(p1.getEstado()).toBe(EstadoProceso.TERMINADO);
        expect(simulador.getCambiosDeContexto()).toBe(1);
    });

    test('Al retornar se encola al final de Listos', () => {
        const { simulador, cpu } = crear(5);
        simulador.agregarProceso(new Proceso(1, 100, 3, new EventoES(1, 1)));
        simulador.agregarProceso(new Proceso(2, 100, 4));
        simulador.agregarProceso(new Proceso(3, 100, 4));

        simulador.ejecutarReloj(); // p1 ejecuta y se bloquea 1 tick
        simulador.ejecutarReloj(); // p1 vuelve al final de Listos y se despacha p2

        expect(cpu.getProcesoActual()?.getPid()).toBe(2);
        expect(simulador.getProcesosListos().map((p) => p.getPid())).toEqual([3, 1]);
    });

    test('El bloqueo tiene prioridad sobre la rotación por quantum y cuenta un solo cambio de contexto', () => {
        const { simulador } = crear(1);
        const p1 = new Proceso(1, 100, 3, new EventoES(1, 2));
        simulador.agregarProceso(p1);
        simulador.agregarProceso(new Proceso(2, 100, 3));

        simulador.ejecutarReloj(); // p1 agota su quantum (1) justo cuando se dispara el evento

        expect(p1.getEstado()).toBe(EstadoProceso.BLOQUEADO);
        expect(simulador.getCambiosDeContexto()).toBe(1);
    });

    test('La finalización tiene prioridad sobre el bloqueo', () => {
        const { simulador } = crear();
        const p1 = new Proceso(1, 100, 2, new EventoES(2, 3));
        simulador.agregarProceso(p1);

        simulador.ejecutarReloj();
        simulador.ejecutarReloj(); // consume su última unidad justo cuando se dispararía el evento

        expect(p1.getEstado()).toBe(EstadoProceso.TERMINADO);
        expect(simulador.getProcesosBloqueados().length).toBe(0);
        expect(simulador.getCambiosDeContexto()).toBe(0);
    });

});