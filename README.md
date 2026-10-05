# analisis-comportamiento-S.O

Proyecto correspondiente a la **Actividad de Evaluación 2 (AE2)**.

El objetivo del proyecto es desarrollar un simulador de procesos y memoria utilizando **Programación Orientada a Objetos (POO)** con TypeScript.

El simulador permite representar la administración de memoria, los estados de los procesos y la planificación de CPU mediante **Round Robin**.

## Requerimientos funcionales

- **RF01:** Configurar e iniciar la simulación.
- **RF02:** Registrar y consultar procesos.
- **RF03:** Gestionar estados y admisión.
- **RF04:** Asignar memoria contigua.
- **RF05:** Liberar memoria y realizar coalescencia.
- **RF06:** Avanzar un tick de forma determinista.
- **RF07:** Planificar la CPU con Round Robin.
- **RF08:** Simular Entrada y Salida (E/S).
- **RF09:** Exponer métricas consultables.
- **RF10:** Consultar el estado del sistema.

## Requisitos

Para ejecutar el proyecto es necesario tener instalado:

- Node.js
- npm
- TypeScript
- Vitest

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/fabriziograciosii/Simulador-sistemas-operativos-y-paradigmas
```

Instalar las dependencias:

```bash
npm install
```

Si el proyecto todavía no tiene TypeScript instalado:

```bash
npm install --save-dev typescript
```

Instalar Vitest para realizar las pruebas:

```bash
npm install --save-dev vitest
```

## Verificar TypeScript

Para comprobar que TypeScript está instalado:

```bash
npx tsc --version
```

Para verificar el código sin generar archivos JavaScript:

```bash
npx tsc --noEmit
```

## Ejecutar las pruebas

Para ejecutar todos los tests:

```bash
npm test
```

También se pueden ejecutar directamente con Vitest:

```bash
npx vitest run
```

## Cobertura de código

Para ejecutar las pruebas y generar el reporte de cobertura:

```bash
npx vitest run --coverage
```

El proyecto debe alcanzar una cobertura de líneas superior al **90 %**.

## Características del simulador

La simulación comienza en el **tick 0**, con la memoria vacía y la CPU libre.

Como configuración de referencia se utilizan:

- Memoria total: **1024 KB**
- Quantum: **2 ticks**

Estos valores pueden configurarse para realizar diferentes pruebas.

El funcionamiento del simulador se verifica mediante **pruebas automatizadas**, sin utilizar una interfaz gráfica, menú de consola ni una función `main`.