# Manual Técnico

## Luis Antonio Castro Padilla (202109750)

## Índice
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Descripción de Archivos](#descripción-de-archivos)
    - [index.js](#indexjs)
    - [foranea.js](#foraneajs)
    - [instancia.js](#instanciajs)
    - [transferencia.js](#transferenciajs)
    - [simbolo.js](#simbolojjs)
    - [errores.js](#erroresjs)
    - [entorno.js](#entornojs)
    - [struct.js](#structjs)
    - [tools.js](#toolsjs)
    - [interprete.js](#interpretejs)
    - [analizador.pegjs](#analizadorpegjs)
4. [Cómo Ejecutar el Programa](#cómo-ejecutar-el-programa)
5. [Conclusión](#conclusión)

## Introducción
Este manual técnico describe la estructura y funcionamiento del programa, incluyendo la descripción de los archivos principales y su propósito.

## Arquitectura del Sistema
El sistema está compuesto por varios módulos que interactúan entre sí para proporcionar la funcionalidad completa del programa. A continuación se describen algunos de los archivos y su rol en el sistema.

## Descripción de Archivos

### index.js

Este archivo contiene la lógica principal para la interacción con la interfaz de usuario, incluyendo la creación, apertura, y guardado de archivos, así como la ejecución del analizado
```javascript
function analizador() {
    const codigoFuente = editor.value;
    errCount = 0;
    tablaErrores.innerHTML = '';
    tablaSimbolos.innerHTML = '';
    try {
        const arbol = parse(codigoFuente);
        console.log("AST generado:", JSON.stringify(arbol, null, 2))
        const interprete = new InterpreterVisitor();
        console.log({arbol})
        arbol.forEach(arbol => arbol.accept(interprete))
        cons.innerHTML = interprete.salida;
        llenarTablaSimbolos(interprete.symbolTable.getSymbols());
        llenarTablaErrores(interprete.errs.getErrores());
    } catch (error) {
        console.error(error);
        errs.addError(error.message, error.location.start.line, error.location.start.column, 'Sintáctico');
    }
} 
```

### foranea.js

Se utiliza para invocar una función definida por el usuario en un entorno específico, Se crea un nuevo entorno (entornoNuevo) que hereda de un entorno de cierre (this.clousure). Este nuevo entorno se utilizará para la ejecución de la función. Se itera sobre los parámetros de la función (this.nodo.params) y se asignan los valores de los argumentos (args) al nuevo entorno (entornoNuevo). Cada parámetro se establece con su identificador (param.id), valor correspondiente del argumento (args[i]), y tipo (param.tipo).
``` javascript
invocar(interprete, args) {
        const entornoNuevo = new Entorno(this.clousure);
        this.nodo.params.forEach((param, i) => {
            entornoNuevo.set(param.id, args[i], param.tipo);
        });
        const entornoAntesDeLaLlamada = interprete.entornoActual;
        interprete.entornoActual = entornoNuevo;
        try {
            this.nodo.block.accept(interprete);
        } catch (error) {
            interprete.entornoActual = entornoAntesDeLaLlamada;
            if (error instanceof ReturnExcp) {
                return error.value;
            }
            throw error;
        }

        interprete.entornoActual = entornoAntesDeLaLlamada;
        return null;
    }
```

### instancia 

El código define una clase InstanciaStruct que representa una instancia de una estructura (Struct). La clase tiene un constructor que inicializa la instancia con una estructura específica y un objeto vacío para almacenar valores. La clase proporciona dos métodos: set para asignar un valor a una propiedad de la estructura y get para recuperar el valor de una propiedad. Si la propiedad solicitada no existe, el método get lanza un error.
``` javascript
export class InstanciaStruct {
    constructor(struct) {
        /**
         * @type {Struct}
         * */
        this.struct = struct;
        this.valores = {};
    }

    set(nombre, valor) {
        this.valores[nombre] = valor;
    }

    get(nombre) {
        if(this.valores.hasOwnProperty(nombre)) {
            return this.valores[nombre];
        }

        throw new Error(`Propiedad no encontrada: ${nombre}`);
    }
}
```

### transferencia 
El código define tres clases de excepciones personalizadas que extienden la clase base Error. Estas excepciones se utilizan para el control de flujo en un intérprete o compilador.

BreakExcp: Representa una excepción de interrupción (break). Se lanza cuando se encuentra una declaración break en el código.
ContinueExcp: Representa una excepción de continuación (continue). Se lanza cuando se encuentra una declaración continue en el código.
ReturnExcp: Representa una excepción de retorno (return). Se lanza cuando se encuentra una declaración return en el código y puede contener un valor de retorno.
``` javascript

export class BreakExcp extends Error {
    constructor() {
        super('Break');
    }
}

export class ContinueExcp extends Error {
    constructor() {
        super('Continue');
    }
}

export class ReturnExcp extends Error {
    /**
     * @param {any} value
     */
    constructor(value) {
        super('Return');
        this.value = value;
    }
}
```

### simbolo 
El código define una clase SymbolTable que maneja una tabla de símbolos. La clase tiene un constructor que inicializa un arreglo vacío para almacenar los símbolos. Proporciona dos métodos: addSymbol para agregar un nuevo símbolo a la tabla y getSymbols para recuperar todos los símbolos almacenados. Se puede usar SymbolTable para almacenar y gestionar información sobre los símbolos utilizados en un programa, como variables, funciones y sus respectivos tipos y ámbitos.
``` javascript

export class SymbolTable {
    constructor() {
        this.symbols = [];
    }

    addSymbol(id, tipoSimbolo, tipoDato, ambito, linea, columna) {
        this.symbols.push({ id, tipoSimbolo, tipoDato, ambito, linea, columna });
    }

    getSymbols() {
        return this.symbols;
    }
}
```

### errores
El código define una clase ErrorSemantico que maneja una colección de errores semánticos. La clase tiene un constructor que inicializa un arreglo vacío para almacenar los errores. Proporciona dos métodos: addError para agregar un nuevo error a la colección y getErrores para recuperar todos los errores almacenados.
``` javascript
export class ErrorSemantico {
    constructor() {
        this.errores = [];
    }

    addError(descripcion, linea, columna, tipo) {
        this.errores.push({ descripcion, linea, columna, tipo });
    }

    getErrores() {
        return this.errores;
    }
}
```

### entorno
El código define una clase Entorno que maneja los entornos de ejecución de un programa. La clase tiene un constructor que inicializa un objeto para almacenar valores y un posible entorno padre. Proporciona varios métodos: set para asignar un valor a una variable, get para recuperar el valor de una variable, assign para asignar un nuevo valor a una variable existente, y getLocal para obtener el valor de una variable en el entorno local.
``` javascript
export class Entorno {
    /**
     * @param {Entorno} padre
     */
    constructor(padre = undefined){
        this.valores = {};
        this.padre = padre;
    }

    /**
     * @param {string} id
     * @param {any} valor
     * @param {string} tipo
     */
    set(id, valor, tipo){
        this.valores[id] = {valor, tipo};
    }

    /**
     * @param {string} id
     */
    get(id){
        const actValue = this.valores[id];
        if(actValue !== undefined) return actValue;

        if(!actValue && this.padre){
            return this.padre.get(id);
        }
        
        return undefined;
    }

    /**
     * @param {string} id
     * @param {any} valor
     */
    assign(id, valor){
        const actValue = this.valores[id];

        if(actValue !== undefined){
            this.valores[id] = valor;
            return;
        }

        if(!actValue && this.padre){
            this.padre.assign(id, valor);
            return;
        }

        throw new Error(`La variable ${id} no está definida`);
    }

    getLocal(id) {
        return this.valores.hasOwnProperty(id) ? this.valores[id] : undefined;
    }
}
```

### struct 
El código define una clase Struct que maneja la definición y creación de estructuras (structs). La clase tiene un constructor que inicializa el nombre del struct y sus propiedades. Proporciona un método instanciar que crea una nueva instancia del struct, asignando valores a sus propiedades según los valores proporcionados o los valores por defecto.
``` javascript
import { InstanciaStruct } from "./instancia.js";

export class Struct {
    constructor(nombre, propiedades) {
        /**
         * @type {string}
         */
        this.nombre = nombre;

        /**
         * @type {Object.<string, Expresion>}
         */
        this.propiedades = propiedades || {};
    }

    /**
     * Instancia las propiedades del struct.
     */
    instanciar(valoresAsignados = {}) {
        const nuevaInstancia = new InstanciaStruct(this);
        // nuevaInstancia.valores = nuevaInstancia.struct.propiedades;
        console.log(nuevaInstancia.struct);
        Object.entries(this.propiedades).forEach(([nombre, valor]) => {
            if (valoresAsignados.hasOwnProperty(nombre)) {
                nuevaInstancia.set(nombre, valoresAsignados[nombre]); // Asignar el valor proporcionado
            } else {
                nuevaInstancia.set(nombre, valor); // Asignar el valor por defecto (null si no hay valor asignado)
            }
        });

        return nuevaInstancia;
    }
}
```

### tools
El archivo tools.js define un objeto types que contiene una cadena de texto con una definición de tipo JSDoc para un objeto Location. Este tipo se utiliza para describir la ubicación de un elemento en un archivo de texto, como una línea de código o un token en un análisis léxico o sintáctico. La definición de tipo incluye propiedades para las posiciones de inicio y fin del elemento, cada una con su propio desplazamiento, línea y columna.
``` javascript
 // Configuracion del nodo inicial
    {
        name: 'Expresion',
        base: true,
        props: [
            {
                name: 'location',
                type: 'Location|null',
                description: 'Ubicacion del nodo en el codigo fuente',
                default: 'null'
            }
        ]
    },
    //crearNodo('Primal', { valor: parseFloat(text(), 4), tipo: 'float' })
    {
        name: 'Primal',
        extends: 'Expresion',
        props: [
            {
                name: 'valor',
                type: 'Expresion',
                description: 'Valor del numero'
            },
            {
                name: 'tipo',
                type: 'string',
                description: 'Tipo de la expresion'
            }
        ]
    },

    // Configuracion de los nodos secundarios
    {
        name: 'OperacionBinaria',
        extends: 'Expresion',
        props: [
            {
                name: 'izq',
                type: 'Expresion',
                description: 'Expresion izquierda de la operacion'
            },
            {
                name: 'der',
                type: 'Expresion',
                description: 'Expresion derecha de la operacion'
            },
            {
                name: 'op',
                type: 'string',
                description: 'Operador de la operacion'
            }
        ]
    },
    {
        name: 'OperacionUnaria',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion de la operacion'
            },
            {
                name: 'op',
                type: 'string',
                description: 'Operador de la operacion'
            }
        ]
    },
    ...
```

### interprete 
En el intérprete se le da un uso a los nodos creados en el tools.js, de esta forma podemos usar "tipos" en el proyecto, por lo que podemos distinguir entre los objetos, sus atributos, etc. Esto hace mucho más amena la programación en javascript (y probablemente sin esta combinación de tools + interprete no hubiera trabajado tanto en el proyecto), los errores incluso eran más sencillos de ver. En el codigo podemos ver el método visitDeclaracionVariable, este método maneja la declaración de variables. Es esencial porque permite la creación de variables en el entorno actual, lo cual es una operación básica en cualquier lenguaje de programación.
``` javascript
visitDeclaracionVariable(node) {
    const nombreVariable = node.id;
    const tipoVariable = node.tipo;
    const linea = node.location.start.line;
    const columna = node.location.start.column;
    const env = 'global';

    if(tipoVariable instanceof Struct){
        const instancia = tipoVariable.instanciar(node.exp.accept(this));
        this.entornoActual.set(nombreVariable, instancia, Struct);
    }

    if (this.entornoActual.getLocal(nombreVariable)) {
        this.errs.addError(`La variable ${nombreVariable} ya fue declarada en el mismo entorno`, linea, columna, 'Semántico');
        return;
    }
    if (node.exp === undefined) {
        this.entornoActual.set(nombreVariable, null, tipoVariable);
        this.symbolTable.addSymbol(nombreVariable, 'variable', tipoVariable, env, linea, columna);
        return;
    } 
    if (tipoVariable === "var"){
        const valorVariable = node.exp.accept(this);
        this.entornoActual.set(nombreVariable, valorVariable.valor, valorVariable.tipo);
        this.symbolTable.addSymbol(nombreVariable, 'variable', valorVariable.tipo, env, linea, columna);
        return;
    }
    if (tipoVariable !== node.exp.tipo){
        if(tipoVariable === 'int' && node.exp.tipo === 'parseInt('){…} else
        this.entornoActual.set(nombreVariable, null, tipoVariable);
        this.errs.addError(`Tipo de dato incorrecto: ${tipoVariable} != ${node.exp.tipo}`, linea, columna, 'Semántico');
        this.symbolTable.addSymbol(nombreVariable, 'variable', tipoVariable, env, linea, columna);
        return;
    }
    const valorVariable = node.exp.accept(this);
    this.entornoActual.set(nombreVariable, valorVariable.valor, tipoVariable);
    this.symbolTable.addSymbol(nombreVariable, 'variable', tipoVariable, env, linea, columna);
}
```

### analizador 
Start: Define el punto de entrada de la gramática. Comienza con cero o más sentencias (Sentencias).
Sentencias: Define las diferentes sentencias que el intérprete puede manejar, como declaraciones de estructuras, variables, funciones, arreglos, matrices y otras sentencias.
DeclarVar: Define la sintaxis para declarar una variable, ya sea especificando su tipo explícitamente o infiriéndolo con var.
TipoDato: Define los diferentes tipos de datos que pueden ser utilizados en las declaraciones de variables y estructuras.
``` Peggy

Start = _ dcl:Sentencias* _ { return dcl }

Sentencias = sdlc:DeclarStruct _ ";" _ { return sdlc }
            / vdlc:DeclarVar _ { return vdlc }
            / fdlc:DeclarFunc _ { return fdlc }
            / adlc:DeclarArr _ ";" _ { return adlc }
            / dlc2D:DeclaracionMatriz2D _ ";" _ { return dlc2D }
            / dlc3D:DeclaracionMatriz3D _ ";" _ { return dlc3D }
            / ndlc:StmtnDlc _ { return ndlc }

DeclarVar = tipo:TipoDato _ id:Identificador _ "=" _ exp:Expresion _ ";" {return crearNodo('declaracionVariable', { id, exp, tipo })}
          / tipo:"var" _ id:Identificador _ "=" _ exp:Expresion _ ";" {return crearNodo('declaracionVariable', { id, exp, tipo })} // Se infiere el tipo.
          / tipo:TipoDato _ id:Identificador _ exp:";" {return crearNodo('declaracionVariable', { id, tipo })}

TipoDato = td:"int" { return td }
        / td:"float" { return td }
        / td:"string" { return td }
        / td:"bool" { return td }
        / td:"char" { return td }
        / td:Identificador { return td }
```

### Cómo Ejecutar el Programa
1. Asegúrate de tener Node.js instalado en tu sistema.
2. Ejecuta el comando node index.js para iniciar el programa.
3. Interactúa con la interfaz de usuario para crear, abrir, guardar archivos y ejecutar el analizador.


## Tecnologías usadas

### Peggy js
Peggy.js es una biblioteca JavaScript utilizada para generar analizadores sintácticos basados en gramáticas personalizadas. Es una bifurcación moderna de PEG.js (Parser Expression Grammar) y permite definir reglas de gramática utilizando una sintaxis PEG, con el propósito de analizar y transformar textos o lenguajes específicos. Los analizadores generados por Peggy.js son eficientes y funcionan directamente en JavaScript.

### JavaScript
JavaScript es un lenguaje de programación interpretado y orientado a objetos, utilizado principalmente para el desarrollo web, aunque también se emplea en otros entornos como servidores, aplicaciones móviles, videojuegos, y más. Es uno de los lenguajes de programación más populares del mundo debido a su flexibilidad y versatilidad.