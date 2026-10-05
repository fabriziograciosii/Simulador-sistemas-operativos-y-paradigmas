import { describe, test, expect } from 'vitest';
import { GestorMemoria } from '../src/memoria/GestorMemoria';
import { BestFit } from '../src/memoria/BestFit';
import { WorstFit } from '../src/memoria/WorstFit';
import { Proceso } from '../src/procesos/Proceso';

describe('Gestor de Memoria (Patrón Estrategia y SOLID)', () => {
    
    test('Debe inicializar y asignar memoria correctamente usando Best-Fit', () => {
        const algoritmoBest = new BestFit();
        
        const gestor = new GestorMemoria(1024, algoritmoBest);
        
        const procesoP1 = new Proceso(1, 200, 5); 

        const pudoAsignar = gestor.asignarMemoria(procesoP1);

        expect(pudoAsignar).toBe(true);
    });

    test('Debe inicializar y asignar memoria correctamente usando Worst-Fit', () => {
        const algoritmoWorst = new WorstFit();
        
        const gestor = new GestorMemoria(1024, algoritmoWorst);
        
        const procesoP2 = new Proceso(2, 450, 8); 

        const pudoAsignar = gestor.asignarMemoria(procesoP2);

        expect(pudoAsignar).toBe(true);
    });

    test('Debe realizar coalescencia automática fusionando bloques adyacentes libres', () => {
        const gestor = new GestorMemoria(1000, new BestFit());
        
        const p1 = new Proceso(1, 200, 5);
        const p2 = new Proceso(2, 300, 5);
        const p3 = new Proceso(3, 400, 5);

        gestor.asignarMemoria(p1);
        gestor.asignarMemoria(p2);
        gestor.asignarMemoria(p3);

        gestor.liberarMemoria(p2);
        expect(gestor.getMemoriaLibreTotal()).toBe(300);

        gestor.liberarMemoria(p1);
        expect(gestor.getMemoriaLibreTotal()).toBe(500);

        gestor.liberarMemoria(p3);
        expect(gestor.getMemoriaLibreTotal()).toBe(1000);
    });
});