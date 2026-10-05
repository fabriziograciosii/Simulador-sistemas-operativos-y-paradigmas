// Le aviso a TypeScript que "process" existe (es lo que usa Node para leer lo que escribo en la terminal).
declare const process: { argv: string[] };

// Traigo las clases de mi biblioteca (la carpeta src). Esta demo solo las usa, no modifica nada de ellas.
import { Simulador } from '../src/simulador/Simulador';
import { GestorMemoria } from '../src/memoria/GestorMemoria';
import { BestFit } from '../src/memoria/BestFit';
import { WorstFit } from '../src/memoria/WorstFit';
import { Procesador } from '../src/cpu/Procesador';
import { RoundRobin } from '../src/cpu/RoundRobin';
import { Proceso } from '../src/procesos/Proceso';
import { EventoES } from '../src/procesos/EventoES';
import type { IBuscarHueco } from '../src/memoria/IBuscarHueco';

// DEMO para Sistemas Operativos.
// Está en una carpeta aparte porque la biblioteca de Paradigmas no puede tener consola ni main.
//
// Cómo se ejecuta (desde la carpeta demo-so):
//   npm start                    -> muestra todos los ticks, con Best-Fit
//   npm start -- 8               -> muestra solo el tick 8 (sirve para sacar capturas)
//   npm start -- todos worst     -> todos los ticks con Worst-Fit (también: best)
//   npm start -- todos best es   -> igual, pero P1 se bloquea por Entrada/Salida

// Esta función arma un texto con los PID de una lista de procesos, por ejemplo "P1, P3".
// Si la lista está vacía devuelve "-".
function pids(procesos: ReadonlyArray<{ getPid(): number }>): string {
    return procesos.length === 0 ? '-' : procesos.map((p) => 'P' + p.getPid()).join(', ');
}

// Esta función imprime cómo quedó todo al terminar un tick.
// "ejecuto" es la lista de procesos que usaron la CPU en ese tick.
function mostrarEstado(simulador: Simulador, procesos: Proceso[], ejecuto: Proceso[]): void {
    console.log('');
    console.log('--- TICK ' + simulador.getTickActual() + ' ---');

    // Métricas de la CPU
    console.log('Ejecuto en la CPU: ' + pids(ejecuto) + ' | uso de CPU ' + simulador.getPorcentajeUsoCPU().toFixed(2) + '% | cambios de contexto ' + simulador.getCambiosDeContexto());

    // Métricas de la memoria
    console.log('Memoria: ocupacion ' + simulador.getOcupacionMemoria().toFixed(2) + '% | libre ' + simulador.getMemoriaLibreTotal() + ' KB | mayor hueco ' + simulador.getMayorBloqueLibre() + ' KB | fragmentacion externa ' + simulador.getFragmentacionExterna().toFixed(2) + '%');

    // Las colas: en qué lista está cada proceso
    console.log('Listos [' + pids(simulador.getProcesosListos()) + '] | Bloqueados [' + pids(simulador.getProcesosBloqueados()) + '] | Esperando memoria [' + pids(simulador.getProcesosEsperandoMemoria()) + '] | Terminados [' + pids(simulador.getProcesosTerminados()) + ']');

    // El estado de cada proceso
    console.log('Estados: ' + procesos.map((p) => 'P' + p.getPid() + ': ' + p.getEstado()).join(' | '));

    // El mapa de memoria: cada bloque con su dirección de inicio y de fin (fin = inicio + tamaño - 1)
    for (const bloque of simulador.getMapaMemoria()) {
        console.log('   [' + bloque.inicio + '-' + (bloque.inicio + bloque.tamano - 1) + ' KB] ' + (bloque.libre ? 'LIBRE' : 'P' + bloque.pid));
    }
}

// 1) Leo lo que escribí en la terminal al ejecutar:
//    - el 1er dato es hasta qué tick quiero ver (o "todos")
//    - el 2do dato es el algoritmo de memoria (best o worst)
//    - el 3er dato, si pongo "es", activa la Entrada/Salida
const pedido = process.argv[2] ?? 'todos';
const conES = process.argv[4] === 'es';
const algoritmos: Record<string, IBuscarHueco> = { best: new BestFit(), worst: new WorstFit() };

// Si escribí un algoritmo que no existe, uso best por defecto.
const nombreAlgoritmo = (process.argv[3] ?? 'best') in algoritmos ? (process.argv[3] ?? 'best') : 'best';

// 2) Creo el simulador con sus tres piezas: la memoria de 1024 KB con el algoritmo elegido,
//    el procesador (la CPU) y el planificador Round-Robin con quantum 2.
const simulador = new Simulador(new GestorMemoria(1024, algoritmos[nombreAlgoritmo]), new Procesador(), new RoundRobin(2));

// 3) Creo los procesos del lote. Cada uno lleva: PID, memoria que pide (KB) y ticks de CPU que necesita.
//    Si pedí "es", P1 se bloquea por E/S: EventoES(2, 3) = después de usar 2 ticks de CPU, queda 3 ticks bloqueado.
//    Los 4 procesos suman 1100 KB y la memoria tiene 1024 KB, entonces P4 tiene que esperar a que se libere lugar.
const procesos = [
    new Proceso(1, 200, 4, conES ? new EventoES(2, 3) : null),
    new Proceso(2, 350, 3),
    new Proceso(3, 150, 2),
    new Proceso(4, 400, 3),
];
procesos.forEach((proceso) => simulador.agregarProceso(proceso));

console.log('=== SIMULADOR DISCRETO: ' + nombreAlgoritmo + ' + Round-Robin (quantum 2) ===');

// 4) Decido hasta qué tick avanzar.
//    Si puse "todos" (o algo que no es un número), muestro todos los ticks hasta que terminen los procesos.
const mostrarTodos = pedido === 'todos' || Number.isNaN(Number(pedido));
const hastaElTick = mostrarTodos ? 200 : Number(pedido);

// 5) Avanzo el reloj tick por tick. El ciclo se corta cuando llego al tick pedido o cuando terminan todos los procesos.
for (let tick = 1; tick <= hastaElTick && simulador.getProcesosTerminados().length < procesos.length; tick++) {
    // Guardo cuánta CPU le faltaba a cada proceso ANTES del tick...
    const cpuAntes = procesos.map((p) => p.getCpuRestante());

    // ...avanzo un tick (el simulador hace sus 4 fases: admisión, bloqueados, CPU y métricas)...
    simulador.ejecutarReloj();

    // ...y el que ejecutó es al que le bajó la CPU restante en este tick.
    const ejecuto = procesos.filter((p, i) => p.getCpuRestante() < cpuAntes[i]);
    const terminaronTodos = simulador.getProcesosTerminados().length === procesos.length;

    // Imprimo si quiero ver todos los ticks, si es el tick que pedí, o si ya terminaron todos (así siempre muestra algo).
    (mostrarTodos || tick === hastaElTick || terminaronTodos) && mostrarEstado(simulador, procesos, ejecuto);
}

console.log('');
console.log('FIN de la simulacion.');
