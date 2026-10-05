import { describe, test, expect } from 'vitest';
import { EventoES } from '../src/procesos/EventoES';

describe('EventoES - Pruebas Unitarias', () => {
    test('Un evento de E/S válido se crea correctamente', () => {
        const evento = new EventoES(2, 3); // Dispara en tick 2, dura 3 ticks
        expect(evento.getTickDisparo()).toBe(2);
        expect(evento.getDuracion()).toBe(3);
        expect(evento.esValido()).toBe(true);
    });

    test('Un evento con tick o duración negativa/cero no es válido', () => {
        const eventoInvalidoTick = new EventoES(0, 3);
        const eventoInvalidoDuracion = new EventoES(2, -1);

        expect(eventoInvalidoTick.esValido()).toBe(false);
        expect(eventoInvalidoDuracion.esValido()).toBe(false);
    });
});