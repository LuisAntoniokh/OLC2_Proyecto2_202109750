const fs = require('fs')

const types = [
    `
/**
 * @typedef {Object} Location
 * @property {Object} start
 * @property {number} start.offset
 * @property {number} start.line
 * @property {number} start.column
 * @property {Object} end
 * @property {number} end.offset
 * @property {number} end.line
 * @property {number} end.column
*/
    `
]

const configuracionNodos = [
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
    {
        name: 'Agrupacion',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion agrupada'
            }
        ]
    },
    {
        name: 'Numero',
        extends: 'Expresion',
        props: [
            {
                name: 'valor',
                type: 'number',
                description: 'Valor del numero'
            }
        ]
    },
    //     DeclaracionVariable
    {
        name: 'DeclaracionVariable',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la variable'
            },
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion de la variable'
            },
            {
                name: 'tipo',
                type: 'string',
                description: 'Tipo de la variable'
            }
        ]
    },
    // ReferenciaVariable
    {
        name: 'ReferenciaVariable',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la variable'
            }
        ]
    },
    // Print
    {
        name: 'Print',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a imprimir'
            }
        ]
    },
    // ExpresionStmt 1+2;
    {
        name: 'ExpresionStmt',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a evaluar'
            }
        ]
    },
    // Asignacion
    {
        name: 'Asignacion',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la variable'
            },
            {
                name: 'asgn',
                type: 'Expresion',
                description: 'Expresion a asignar'
            }
        ]
    },
    // Bloque
    {
        name: 'Bloque',
        extends: 'Expresion',
        props: [
            {
                name: 'block',
                type: 'Expresion[]',
                description: 'Lista de sentencias del bloque'
            }
        ]
    },
    // If
    {
        name: 'If',
        extends: 'Expresion',
        props: [
            {
                name: 'cond',
                type: 'Expresion',
                description: 'Condicion del if'
            },
            {
                name: 'iftrue',
                type: 'Expresion',
                description: 'Bloque de sentencias del if'
            },
            {
                name: 'iffalse',
                type: 'Expresion|undefined',
                description: 'Bloque de sentencias del else'
            }
        ]
    },
    // While
    {
        name: 'While',
        extends: 'Expresion',
        props: [
            {
                name: 'cond',
                type: 'Expresion',
                description: 'Condicion del while'
            },
            {
                name: 'loop',
                type: 'Expresion',
                description: 'Bloque de sentencias del while'
            }
        ]
    },
    {
        name: 'For',
        extends: 'Expresion',
        props: [
            {
                name: 'init',
                type: 'Expresion',
                description: 'Inicializacion del for'
            },
            {
                name: 'cond',
                type: 'Expresion',
                description: 'Condicion del for'
            },
            {
                name: 'inc',
                type: 'Expresion',
                description: 'Incremento del for'
            },
            {
                name: 'loop',
                type: 'Expresion',
                description: 'Bloque de sentencias del for'
            }
        ]
    },
    {
        name: "Break",
        extends: 'Expresion',
        props: []
    },
    {
        name : "Continue",
        extends: 'Expresion',
        props: []
    },
    {
        name: "Return",
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a retornar'
            }
        ]
    },
    {
        name: "Llamada",
        extends: 'Expresion',
        props: [
            {
                name: 'callee',
                type: 'Expresion',
                description: 'Llamada a la función'
            },
            {
                name: 'args',
                type: 'Expresion[]',
                description: 'Argumentos de la funcion'
            }
        ]
    },
    {
        name: "FuncDcl",
        extends: 'Expresion',
        props: [
            {
                name: 'td',
                type: 'string',
                description: 'Tipo de dato de la funcion'
            },
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la funcion'
            },
            {
                name: 'params',
                type: 'string[]',
                description: 'Parametros de la funcion'
            },
            {
                name: 'block',
                type: 'Bloque',
                description: 'Bloque de sentencias de la funcion'
            }
        ]
    }, 
    {
        name: 'Switch',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion del switch'
            },
            {
                name: 'cases',
                type: 'Array<{exp: Expresion, stmts: Expresion[]}>',
                description: 'Lista de casos del switch'
            },
            {
                name: 'defo',
                type: '{stmts: Expresion[]} | undefined',
                description: 'Caso por defecto del switch'
            }
        ]
    },
    // return crearNodo('ternario', {cond, iftrue, iffalse}); 
    {
        name: 'Ternario',
        extends: 'Expresion',
        props: [
            {
                name: 'cond',
                type: 'Expresion',
                description: 'Condicion del ternario'
            },
            {
                name: 'iftrue',
                type: 'Expresion',
                description: 'Bloque de sentencias del if'
            },
            {
                name: 'iffalse',
                type: 'Expresion',
                description: 'Bloque de sentencias del else'
            }
        ]
    },
    // return crearNodo('embebidas', { tipo, exp }); 
    {
        name: 'Embebidas',
        extends: 'Expresion',
        props: [
            {
                name: 'tipo',
                type: 'string',
                description: 'Tipo de embebida'
            },
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion de la embebida'
            }
        ]
    },
    // return crearNodo('declaracionArreglo', { tipo, id, lista }) 
    {
        name: 'DeclaracionArreglo',
        extends: 'Expresion',
        props: [
            {
                name: 'tipo',
                type: 'string',
                description: 'Tipo de dato del arreglo'
            },
            {
                name: 'id',
                type: 'string',
                description: 'Identificador del arreglo'
            },
            {
                name: 'lista',
                type: 'Expresion[]',
                description: 'Lista de elementos del arreglo'
            }
        ]
    },
    // return crearNodo('declaracionArregloTam', { tipo, id, tipo2, tam })
    {
        name: 'DeclaracionArregloTam',
        extends: 'Expresion',
        props: [
            {
                name: 'tipo',
                type: 'string',
                description: 'Tipo de dato del arreglo'
            },
            {
                name: 'id',
                type: 'string',
                description: 'Identificador del arreglo'
            },
            {
                name: 'tipo2',
                type: 'string',
                description: 'Tipo de dato del tamaño'
            },
            {
                name: 'tam',
                type: 'Expresion',
                description: 'Tamaño del arreglo'
            }
        ]
    },
    // return crearNodo('declaracionArregloCopia', { tipo, id, id2 })
    {
        name: 'DeclaracionArregloCopia',
        extends: 'Expresion',
        props: [
            {
                name: 'tipo',
                type: 'string',
                description: 'Tipo de dato del arreglo'
            },
            {
                name: 'id',
                type: 'string',
                description: 'Identificador del arreglo'
            },
            {
                name: 'id2',
                type: 'string',
                description: 'Identificador del arreglo a copiar'
            }
        ]
    },
    // return crearNodo('accesoArreglo', { id, indice })
    {
        name: 'AccesoArreglo',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador del arreglo'
            },
            {
                name: 'indice',
                type: 'Expresion',
                description: 'Indice del arreglo'
            }
        ]
    },
    // return crearNodo('asignacionArreglo', { id, indice, valor })
    {
        name: 'AsignacionArreglo',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador del arreglo'
            },
            {
                name: 'indice',
                type: 'Expresion',
                description: 'Indice del arreglo'
            },
            {
                name: 'valor',
                type: 'Expresion',
                description: 'Valor a asignar'
            }
        ]
    },
    // return crearNodo('funcionArreglo', { id, funcion: funcion.funcion, argumento: funcion.argumento });
    {
        name: 'FuncionArreglo',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador del arreglo'
            },
            {
                name: 'funcion',
                type: 'string',
                description: 'Funcion del arreglo'
            },
            {
                name: 'argumento',
                type: 'Expresion|undefined',
                description: 'Argumento de la funcion'
            }
        ]
    },
    // return crearNodo('forEach', {tipo, id, arr, loop})
    {
        name: 'ForEach',
        extends: 'Expresion',
        props: [
            {
                name: 'tipo',
                type: 'string',
                description: 'Tipo de dato del arreglo'
            },
            {
                name: 'id',
                type: 'string',
                description: 'Identificador del arreglo'
            },
            {
                name: 'arr',
                type: 'Expresion',
                description: 'Arreglo a recorrer'
            },
            {
                name: 'loop',
                type: 'Expresion',
                description: 'Bloque de sentencias del forEach'
            }
        ]
    },
]

let code = ''

// Tipos base
types.forEach(type => {
    code += type + '\n'
})


code += `
/**
 * @typedef {import('./visitor').BaseVisitor} BaseVisitor
 */
`

const baseClass = configuracionNodos.find(nodo => nodo.base)
configuracionNodos.forEach(nodo => {
    code += `
export class ${nodo.name} ${baseClass && nodo.extends ? `extends ${nodo.extends}` : ''} {

    /**
    * @param {Object} options
    * ${nodo.props.map(prop => `@param {${prop.type}} options.${prop.name} ${prop.description}`).join('\n * ')}
    */
    constructor(${!nodo.base && nodo.props.length > 0 && `{ ${nodo.props.map(prop => `${prop.name}`).join(', ')} }` || ''}) {
        ${baseClass && nodo.extends ? `super();` : ''}
        ${nodo.props.map(prop => `
        /**
         * ${prop.description}
         * @type {${prop.type}}
        */
        this.${prop.name} = ${prop.default || `${prop.name}`};
`).join('\n')}
    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visit${nodo.name}(this);
    }
}
    `
})

code += `
export default { ${configuracionNodos.map(nodo => nodo.name).join(', ')} }
`


fs.writeFileSync('./nodos.js', code)
console.log('Archivo de clases de nodo generado correctamente')


// Visitor
// @typedef {import('./nodos').Expresion} Expresion
code = `
/**
${configuracionNodos.map(nodo => `
 * @typedef {import('./nodos').${nodo.name}} ${nodo.name}
`).join('\n')}
 */
`

code += `

/**
 * Clase base para los visitantes
 * @abstract
 */
export class BaseVisitor {

    ${configuracionNodos.map(nodo => `
    /**
     * @param {${nodo.name}} node
     * @returns {any}
     */
    visit${nodo.name}(node) {
        throw new Error('Metodo visit${nodo.name} no implementado');
    }
    `).join('\n')
    }
}
`

fs.writeFileSync('./visitor.js', code)
console.log('Archivo de visitor generado correctamente')