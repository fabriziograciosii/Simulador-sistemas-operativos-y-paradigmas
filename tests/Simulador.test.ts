import { describe, test, expect } from 'vitest';
import { Simulador } from '../src/simulador/Simulador';
import { GestorMemoria } from '../src/memoria/GestorMemoria';
import { BestFit } from '../src/memoria/BestFit';
import { Procesador } from '../src/cpu/Procesador';
import { RoundRobin } from '../src/cpu/RoundRobin';
import { Proceso } from '../src/procesos/Proceso';
import { EventoES } from '../src/procesos/EventoES';

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

    describe('4. Planificador Round Robin (Quantum 2)', () => {
        test('Un proceso descuenta ticks de CPU correctamente', () => {
            const cpu = new Procesador();
            const simulador = new Simulador(new GestorMemoria(1024, new BestFit()), cpu, new RoundRobin(2));
            simulador.agregarProceso(new Proceso(1, 100, 3));

            // primer tick: p1 usa la cpu
            simulador.ejecutarReloj(); 
            expect(cpu.getProcesoActual()?.getCpuRestante()).toBe(2);

            // segundo tick: vuelve a usarla
            simulador.ejecutarReloj(); 
            expect(cpu.getProcesoActual()?.getCpuRestante()).toBe(1);
        });

        test('Rotación exacta: Expulsa al proceso al agotar el Quantum y trae al siguiente', () => {
            const cpu = new Procesador();
            const simulador = new Simulador(new GestorMemoria(1024, new BestFit()), cpu, new RoundRobin(2));
            
            simulador.agregarProceso(new Proceso(1, 100, 5)); 
            simulador.agregarProceso(new Proceso(2, 100, 3)); 

            // hacemos pasar dos ticks para agotar el quantum de p1
            simulador.ejecutarReloj(); 
            simulador.ejecutarReloj(); 
            expect(cpu.getProcesoActual()?.getPid()).toBe(1);
            
            // aca ocurre la magia de la rotacion
            simulador.ejecutarReloj(); 
            
            // comprobamos que p2 este ahora ejecutando
            expect(cpu.getProcesoActual()?.getPid()).toBe(2); 
            expect(simulador.getProcesosListos()[0].getPid()).toBe(1); 
        });

        test('Si hay un solo proceso, ignora el Quantum y sigue ejecutando hasta terminar', () => {
            const cpu = new Procesador();
            const simulador = new Simulador(new GestorMemoria(1024, new BestFit()), cpu, new RoundRobin(2));
            simulador.agregarProceso(new Proceso(1, 100, 4)); 

            // p1 corre por 3 ticks seguidos (supera el quantum de 2)
            simulador.ejecutarReloj(); 
            simulador.ejecutarReloj(); 
            simulador.ejecutarReloj(); 

            // como esta solo en el sistema, no deberia soltar la cpu
            expect(cpu.getProcesoActual()?.getPid()).toBe(1);
            expect(simulador.getCambiosDeContexto()).toBe(0);
        });
    });

    describe('5. Terminación y Liberación', () => {
        test('Al llegar a 0 de ráfaga, pasa a Terminados', () => {
            const simulador = new Simulador(new GestorMemoria(1024, new BestFit()), new Procesador(), new RoundRobin(2));
            simulador.agregarProceso(new Proceso(1, 100, 1)); 

            // consume su unico tick y luego el simulador detecta que termino
            simulador.ejecutarReloj(); 
            simulador.ejecutarReloj(); 

            // verificamos que este en la cola de terminados
            expect(simulador.getProcesosTerminados().length).toBe(1);
            expect(simulador.getProcesosTerminados()[0].getPid()).toBe(1);
        });
    });

    describe('6. Requerimientos de Métricas (AE2)', () => {
        test('Calcula Fragmentación Externa (%) matemáticamente', () => {
            const simulador = new Simulador(new GestorMemoria(1024, new BestFit()), new Procesador(), new RoundRobin(2));
            simulador.agregarProceso(new Proceso(1, 1024, 5)); // llenamos toda la memoria
            
            simulador.ejecutarReloj();
            // comprobamos la formula del excel (sin memoria libre = 0 frag)
            expect(simulador.getFragmentacionExterna()).toBe(0);
        });

        test('Suma Cambios de Contexto por intervenciones del Round Robin', () => {
            const simulador = new Simulador(new GestorMemoria(1024, new BestFit()), new Procesador(), new RoundRobin(1));
            simulador.agregarProceso(new Proceso(1, 100, 5));
            simulador.agregarProceso(new Proceso(2, 100, 5));

            simulador.ejecutarReloj(); // p1 entra a la cpu
            simulador.ejecutarReloj(); // expulsa a p1, entra p2 (+1)
            simulador.ejecutarReloj(); // expulsa a p2, entra p1 (+2)
            expect(simulador.getCambiosDeContexto()).toBe(2);
        });

        test('El Uso de CPU sube solo si hay un proceso ejecutándose', () => {
            const simulador = new Simulador(new GestorMemoria(1024, new BestFit()), new Procesador(), new RoundRobin(2));
            simulador.agregarProceso(new Proceso(1, 100, 1));

            simulador.ejecutarReloj(); 
            expect(simulador.getPorcentajeUsoCPU()).toBe(100);

            simulador.ejecutarReloj(); 
            expect(simulador.getPorcentajeUsoCPU()).toBe(50);
        });
    });

    describe('7. Invariantes del Sistema durante Simulación Larga', () => {
        test('Tras 20 Ticks, no hay PIDs duplicados ni procesos fantasmas', () => {
            const simulador = new Simulador(new GestorMemoria(1000, new BestFit()), new Procesador(), new RoundRobin(2));
            
            // cargamos varios procesos
            simulador.agregarProceso(new Proceso(1, 300, 4));
            simulador.agregarProceso(new Proceso(2, 400, 3));
            simulador.agregarProceso(new Proceso(3, 500, 2));
            simulador.agregarProceso(new Proceso(4, 200, 3));

            // dejamos correr el tiempo por 20 ticks
            for (let tick = 0; tick < 20; tick++) {
                simulador.ejecutarReloj();
            }

            // no importa donde esten parados, siempre tienen que sumar 4 procesos en el sistema
            const enNuevos = simulador.getProcesosNuevos().length;
            const enMemoria = simulador.getProcesosEsperandoMemoria().length;
            const enListos = simulador.getProcesosListos().length;
            const enTerminados = simulador.getProcesosTerminados().length;
            
            expect(enNuevos + enMemoria + enListos + enTerminados).toBe(4);
        });

        describe('8. Simulación Oficial de la Cátedra (Planilla: CPU Round Robin)', () => {
        test('Debe procesar el lote completo (A, B, C, D, E) y generar métricas finales', () => {
            // recreamos el caso de prueba tal cual lo pidio el profe en el excel
            const simulador = new Simulador(new GestorMemoria(1024, new BestFit()), new Procesador(), new RoundRobin(2));
            
            const procesoA = new Proceso(1, 200, 3); // entra tick 0
            const procesoB = new Proceso(2, 300, 4); // entra tick 1
            const procesoC = new Proceso(3, 100, 3); // entra tick 2
            const procesoD = new Proceso(4, 250, 2); // entra tick 3
            const procesoE = new Proceso(5, 100, 1); // entra tick 4

            // simulamos que van llegando a medida que avanza el tiempo
            simulador.agregarProceso(procesoA);
            simulador.ejecutarReloj(); // TICK 0
            
            simulador.agregarProceso(procesoB);
            simulador.ejecutarReloj(); // TICK 1

            simulador.agregarProceso(procesoC);
            simulador.ejecutarReloj(); // TICK 2
            
            // aca p1 ya agoto su quantum y lo expulsa
            expect(simulador.getCambiosDeContexto()).toBe(1);

            simulador.agregarProceso(procesoD);
            simulador.ejecutarReloj(); // TICK 3

            simulador.agregarProceso(procesoE);
            simulador.ejecutarReloj(); // TICK 4

            // adelantamos el tiempo hasta que terminen todos los procesos
            for (let i = 5; i <= 20; i++) {
                simulador.ejecutarReloj();
            }

            // comprobacion final de los requerimientos de la catedra
            expect(simulador.getProcesosTerminados().length).toBe(5); // terminaron todos
            expect(simulador.getProcesosListos().length).toBe(0); // cola vacia
            expect(simulador.getFragmentacionExterna()).toBe(0); // ram limpia y compactada
            expect(simulador.getPorcentajeUsoCPU()).toBeGreaterThan(50); // cpu trabajando
        });
    });
    });

    describe('9. Bloqueo por Entrada y Salida (E/S)', () => {
        test('Un proceso se bloquea al cumplir sus ticks de CPU y retorna tras el temporizador', () => {
            const simulador = new Simulador(new GestorMemoria(1024, new BestFit()), new Procesador(), new RoundRobin(2));
            const evento = new EventoES(1, 2); // Se bloquea tras 1 tick de CPU, dura 2 ticks
            const proceso = new Proceso(1, 100, 3, evento);

            simulador.agregarProceso(proceso);
            simulador.ejecutarReloj(); // Tick 1: Ejecuta 1 tick, detecta el evento y pasa a Bloqueado

            expect(simulador.getProcesosBloqueados().length).toBe(1);
            expect(proceso.getEstado()).toBe(EstadoProceso.BLOQUEADO);

            simulador.ejecutarReloj(); // Tick 2: Sigue bloqueado (resta 1)
            simulador.ejecutarReloj(); // Tick 3: Vence el temporizador, vuelve a Listos

            expect(proceso.getEstado() === EstadoProceso.LISTO || proceso.getEstado() === EstadoProceso.EJECUTANDO).toBe(true);
        });
    });

});