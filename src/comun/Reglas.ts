// Validaciones de dominio compartidas: se usa cortocircuito y una función que lanza el error.
export class Reglas {
    public static exigir(condicion: boolean, mensaje: string): void {
        condicion || Reglas.fallar(mensaje);
    }

    public static esEnteroPositivo(valor: number): boolean {
        return Number.isInteger(valor) && valor > 0;
    }

    private static fallar(mensaje: string): never {
        throw new Error(mensaje);
    }
}
