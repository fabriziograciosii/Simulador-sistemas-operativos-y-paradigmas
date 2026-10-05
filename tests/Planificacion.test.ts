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
});