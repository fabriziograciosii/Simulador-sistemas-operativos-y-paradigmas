// DEMO DE CONSOLA - solo para observar y sacar capturas del simulador.
// No forma parte de la biblioteca ni de los tests: usa las clases de ../src tal cual están.
//
// Uso:
//   npm start                 -> simula con Best-Fit
//   npm run start:worst       -> simula con Worst-Fit
//   npm run comparar          -> corre el mismo lote con las dos políticas y compara
declare const process: { argv: string[] };
import { Simulador } from '../src/simulador/Simulador';
import { GestorMemoria } from '../src/memoria/GestorMemoria';
import { BestFit } from '../src/memoria/BestFit';
import { WorstFit } from '../src/memoria/WorstFit';
import { IBuscarHueco } from '../src/memoria/IBuscarHueco';
import { Procesador } from '../src/cpu/Procesador';
import { RoundRobin } from '../src/cpu/RoundRobin';
import { Proceso } from '../src/procesos/Proceso';
import { EventoES } from '../src/procesos/EventoES';
import { IProceso } from '../src/procesos/IProceso';
import { IProcesoConsulta } from '../src/procesos/IProcesoConsulta';

const MEMORIA_TOTAL = 1024;
const QUANTUM = 2;
const MAX_TICKS = 60;

const POLITICAS: Record<string, { nombre: string; crear: () => IBuscarHueco }> = {
    best: { nombre: 'Best-Fit', crear: () => new BestFit() },
    worst: { nombre: 'Worst-Fit', crear: () => new WorstFit() }
};

// Lote de procesos: [tick de llegada, proceso]. Se crean nuevos en cada corrida para poder comparar políticas.
const crearLote = (): Array<[number, IProceso]> => [
    // Los cinco primeros llenan casi toda la memoria. P1, P3 y P5 terminan rápido y dejan huecos de distinto tamaño.
    [0, new Proceso(1, 250, 1)],
    [0, new Proceso(2, 300, 9, new EventoES(3, 2))],   // se bloquea por E/S tras 3 ticks de CPU y queda 2 ticks bloqueado
    [0, new Proceso(3, 100, 1)],
    [0, new Proceso(4, 150, 9)],
    [0, new Proceso(5, 100, 1)],
    // Llegan con huecos de 250, 100 y 224 KB disponibles: cada política elige uno distinto.
    [6, new Proceso(6, 80, 2)],
    [6, new Proceso(7, 90, 2)],
    [6, new Proceso(8, 240, 2)],
    [7, new Proceso(9, 400, 2)]                         // no entra hasta que se libere/fusione memoria: queda Esperando Memoria
];

const AZUL = '\x1b[36m', VERDE = '\x1b[32m', AMARILLO = '\x1b[33m', ROJO = '\x1b[31m', GRIS = '\x1b[90m', NEGRITA = '\x1b[1m', FIN = '\x1b[0m';
const linea = (n: number = 78) => '─'.repeat(n);
const pids = (lista: ReadonlyArray<IProcesoConsulta>) => lista.length === 0 ? '—' : lista.map((p) => `P${p.getPid()}`).join(', ');
const pct = (n: number) => `${n.toFixed(1)}%`;

// Barra de memoria: cada caracter representa MEMORIA_TOTAL / 64 KB. Dígito = pid del dueño, punto = libre.
const barraMemoria = (sim: Simulador): string => {
    const ANCHO = 64;
    const porCaracter = MEMORIA_TOTAL / ANCHO;
    return sim.getMapaMemoria().map((b) => {
        const celdas = Math.max(1, Math.round(b.tamano / porCaracter));
        return b.pid === null ? `${GRIS}${'.'.repeat(celdas)}${FIN}` : `${AZUL}${String(b.pid % 10).repeat(celdas)}${FIN}`;
    }).join('');
};

const mapaTexto = (sim: Simulador): string => sim.getMapaMemoria()
    .map((b) => `[${b.inicio}-${b.inicio + b.tamano - 1}] ${b.pid === null ? 'LIBRE' : `P${b.pid}`} (${b.tamano} KB)`)
    .join('  ');

const COLOR_ESTADO: Record<string, string> = {
    'Nuevo': GRIS, 'Esperando Memoria': AMARILLO, 'Listo': VERDE, 'Ejecutando': AZUL, 'Bloqueado': ROJO, 'Terminado': GRIS
};

interface Resultado {
    politica: string;
    ticks: number;
    maxFragmentacion: number;
    sumaFragmentacion: number;
    cambiosContexto: number;
    usoCpu: number;
    ocupacionFinal: number;
}

const simular = (clave: string, mostrar: boolean): Resultado => {
    const politica = POLITICAS[clave];
    const sim = new Simulador(new GestorMemoria(MEMORIA_TOTAL, politica.crear()), new Procesador(), new RoundRobin(QUANTUM));
    const lote = crearLote();
    const registrados: IProceso[] = [];
    const log = (texto: string) => mostrar ? console.log(texto) : undefined;

    log(`\n${NEGRITA}SIMULADOR DE PROCESOS Y MEMORIA${FIN}   Política: ${NEGRITA}${politica.nombre}${FIN} | Memoria: ${MEMORIA_TOTAL} KB | Quantum: ${QUANTUM}`);
    log(linea());
    log(`Lote: ${lote.map(([t, p]) => `P${p.getPid()}(${p.getMemoriaRequerida()}KB, CPU ${p.getCpuTotal()}, llega t${t}${p.getEventoES() === null ? '' : ', con E/S'})`).join('  ')}`);

    let fragmentacionMax = 0, fragmentacionSuma = 0, ticks = 0;
    const consumidoAntes = new Map<number, number>();

    for (let t = 0; t < MAX_TICKS && (t === 0 || sim.getProcesosTerminados().length < lote.length); t++) {
        lote.filter(([llegada]) => llegada === t).forEach(([, p]) => { sim.agregarProceso(p); registrados.push(p); });

        sim.ejecutarReloj();
        ticks = sim.getTickActual();

        const ejecuto = registrados.filter((p) => p.getCpuRestante() < (consumidoAntes.get(p.getPid()) ?? p.getCpuTotal()));
        registrados.forEach((p) => consumidoAntes.set(p.getPid(), p.getCpuRestante()));
        fragmentacionMax = Math.max(fragmentacionMax, sim.getFragmentacionExterna());
        fragmentacionSuma += sim.getFragmentacionExterna();

        log(`\n${NEGRITA}── TICK ${ticks} ${linea(68)}${FIN}`);
        log(`Ejecutó en CPU : ${ejecuto.length === 0 ? `${GRIS}nadie (CPU ociosa)${FIN}` : ejecuto.map((p) => `${AZUL}P${p.getPid()}${FIN} (le quedan ${p.getCpuRestante()})`).join(', ')}`);
        log(`CPU ahora      : ${sim.getProcesoEnCPU() === null ? `${GRIS}libre${FIN}` : `P${sim.getProcesoEnCPU()?.getPid()}`}`);
        log(`Cola de Listos : ${pids(sim.getProcesosListos())}`);
        log(`Esperando mem. : ${pids([...sim.getProcesosNuevos(), ...sim.getProcesosEsperandoMemoria()])}`);
        log(`Bloqueados     : ${sim.getProcesosBloqueados().map((p) => `P${p.getPid()} (faltan ${p.getBloqueoRestante()})`).join(', ') || '—'}`);
        log(`Terminados     : ${pids(sim.getProcesosTerminados())}`);
        log(`Estados        : ${registrados.map((p) => `P${p.getPid()}=${COLOR_ESTADO[p.getEstado()]}${p.getEstado()}${FIN}`).join('  ')}`);
        log(`Memoria        : |${barraMemoria(sim)}|`);
        log(`Mapa           : ${mapaTexto(sim)}`);
        log(`Métricas       : ocupación ${pct(sim.getOcupacionMemoria())} | uso CPU ${pct(sim.getPorcentajeUsoCPU())} | cambios de contexto ${sim.getCambiosDeContexto()} | libre ${sim.getMemoriaLibreTotal()} KB | mayor hueco ${sim.getMayorBloqueLibre()} KB | fragmentación ${pct(sim.getFragmentacionExterna())}`);
    }

    log(`\n${linea()}\n${NEGRITA}FIN${FIN}: ${sim.getProcesosTerminados().length} procesos terminados en ${ticks} ticks. Orden de finalización: ${pids(sim.getProcesosTerminados())}`);

    return {
        politica: politica.nombre,
        ticks,
        maxFragmentacion: fragmentacionMax,
        sumaFragmentacion: fragmentacionSuma,
        cambiosContexto: sim.getCambiosDeContexto(),
        usoCpu: sim.getPorcentajeUsoCPU(),
        ocupacionFinal: sim.getOcupacionMemoria()
    };
};

const comparar = (): void => {
    const resultados = Object.keys(POLITICAS).map((clave) => simular(clave, false));
    console.log(`\n${NEGRITA}COMPARACIÓN DE POLÍTICAS${FIN} (mismo lote, memoria ${MEMORIA_TOTAL} KB, quantum ${QUANTUM})`);
    console.log(linea());
    console.log('Política    | Ticks | Fragm. máx | Fragm. prom. | Cambios ctx | Uso CPU');
    console.log(linea());
    resultados.forEach((r) => console.log(
        `${r.politica.padEnd(11)} | ${String(r.ticks).padStart(5)} | ${pct(r.maxFragmentacion).padStart(10)} | ${pct(r.sumaFragmentacion / r.ticks).padStart(12)} | ${String(r.cambiosContexto).padStart(11)} | ${pct(r.usoCpu).padStart(7)}`
    ));
};

// Selección por tabla de despacho (sin condicionales): best | worst | comparar
const argumento = process.argv[2] ?? 'best';
const modos: Record<string, () => unknown> = {
    best: () => simular('best', true),
    worst: () => simular('worst', true),
    comparar
};
(modos[argumento] ?? modos.best)();
