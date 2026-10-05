import { describe, test, expect } from 'vitest';
import { Simulador } from '../src/simulador/Simulador';
import { GestorMemoria } from '../src/memoria/GestorMemoria';
import { BestFit } from '../src/memoria/BestFit';
import { Procesador } from '../src/cpu/Procesador';
import { RoundRobin } from '../src/cpu/RoundRobin';
import { Proceso } from '../src/procesos/Proceso';
import { EstadoProceso } from '../src/procesos/EstadoProceso';

describe('Round-Robin y orden del tick (RF06 y RF07)', () => {
    // Simulador con la configuracion de referencia; tambien devuelve la CPU para poder consultarla
    const crear = (memoria: number = 1024, quantum: number = 2) => {
        const cpu = new Procesador();
        const simulador = new Simulador(new GestorMemoria(memoria, new BestFit()), cpu, new RoundRobin(quantum));
        return { simulador, cpu };
    };

    // Avanza un tick por vez y devuelve que PID consumio CPU en cada uno (null si la CPU estuvo ociosa)
    const trazaDe = (simulador: Simulador, procesos: Proceso[], ticks: number): Array<number | null> =>
        Array.from({ length: ticks }, () => {
            const antes = procesos.map((p) => p.getCpuRestante());
            simulador.ejecutarReloj();
            const indice = procesos.findIndex((p, i) => p.getCpuRestante() < antes[i]);
            return indice === -1 ? null : procesos[indice].getPid();
        });

    test('Con procesos largos alterna de a dos ticks: el quantum se reinicia al despachar', () => {
        const { simulador } = crear();
        const p1 = new Proceso(1, 100, 5);
        const p2 = new Proceso(2, 100, 5);
        simulador.agregarProceso(p1);
        simulador.agregarProceso(p2);

        expect(trazaDe(simulador, [p1, p2], 10)).toEqual([1, 1, 2, 2, 1, 1, 2, 2, 1, 2]);
        // 4 expulsiones por quantum; las dos finalizaciones no cuentan
        expect(simulador.getCambiosDeContexto()).toBe(4);
    });

    test('El quantum se agota recién al consumir todos sus ticks', () => {
        const rr = new RoundRobin(2);
        const p1 = new Proceso(1, 100, 5);

        p1.ejecutarUnTick();
        expect(rr.quantumAgotado(p1)).toBe(false);
        p1.ejecutarUnTick();
        expect(rr.quantumAgotado(p1)).toBe(true);
    });

    test('Con Q=2, P1 (CPU 3) y P2 (CPU 2) se ejecuta P1, P1, P2, P2, P1 con un cambio de contexto', () => {
        const { simulador } = crear();
        const p1 = new Proceso(1, 100, 3);
        const p2 = new Proceso(2, 100, 2);
        simulador.agregarProceso(p1);
        simulador.agregarProceso(p2);

        expect(trazaDe(simulador, [p1, p2], 5)).toEqual([1, 1, 2, 2, 1]);
        expect(simulador.getCambiosDeContexto()).toBe(1);
    });

    test('Un único proceso renueva su quantum sin cambio de contexto', () => {
        const { simulador, cpu } = crear();
        const p1 = new Proceso(1, 100, 6);
        simulador.agregarProceso(p1);

        trazaDe(simulador, [p1], 3);

        // agotó el quantum en el tick 2, se renovó y en el tick 3 consumió 1
        expect(p1.getQuantumConsumido()).toBe(1);
        expect(cpu.getProcesoActual()).toBe(p1);
        expect(simulador.getCambiosDeContexto()).toBe(0);
    });

    test('Finalizar justo en el límite del quantum no reencola al proceso ni cuenta cambio de contexto', () => {
        const { simulador } = crear();
        const p1 = new Proceso(1, 100, 2);
        const p2 = new Proceso(2, 100, 2);
        simulador.agregarProceso(p1);
        simulador.agregarProceso(p2);

        trazaDe(simulador, [p1, p2], 2);

        expect(simulador.getProcesosTerminados()).toEqual([p1]);
        expect(simulador.getProcesosListos()).toEqual([p2]);
        expect(simulador.getCambiosDeContexto()).toBe(0);
    });

    test('La liberación al final del tick habilita la admisión recién en el tick siguiente', () => {
        const { simulador } = crear(500);
        const p1 = new Proceso(1, 400, 1);
        const p2 = new Proceso(2, 300, 1);
        simulador.agregarProceso(p1);
        simulador.agregarProceso(p2);

        simulador.ejecutarReloj(); // p1 termina y libera su memoria; p2 todavía no fue reintentado
        expect(p1.getEstado()).toBe(EstadoProceso.TERMINADO);
        expect(simulador.getProcesosEsperandoMemoria()).toEqual([p2]);

        simulador.ejecutarReloj(); // p2 se admite en la fase de admisión y se ejecuta
        expect(p2.getEstado()).toBe(EstadoProceso.TERMINADO);
    });
});