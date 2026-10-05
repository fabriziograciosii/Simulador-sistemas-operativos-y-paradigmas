import { IEventoES } from './IEventoES';
import { Reglas } from '../comun/Reglas';

export class EventoES implements IEventoES {
    private readonly tickDisparo: number;
    private readonly duracion: number;

    // tickDisparo: ticks de CPU consumidos tras los cuales se bloquea. duracion: ticks que dura el bloqueo.
    // No lanza error: la validez se consulta con esValido() y la hace cumplir Simulador.agregarProceso.
    constructor(tickDisparo: number, duracion: number) {
        this.tickDisparo = tickDisparo;
        this.duracion = duracion;
    }

    public getTickDisparo(): number {
        return this.tickDisparo;
    }

    public getDuracion(): number {
        return this.duracion;
    }

    public esValido(): boolean {
        return Reglas.esEnteroPositivo(this.tickDisparo) && Reglas.esEnteroPositivo(this.duracion);
    }
}