export class EventoES {
    private readonly tickDisparo: number;
    private readonly duracion: number;

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
        return this.tickDisparo > 0 && this.duracion > 0;
    }
}