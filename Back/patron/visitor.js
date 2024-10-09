
/**

 * @typedef {import('./nodos').Expresion} Expresion


 * @typedef {import('./nodos').Primal} Primal


 * @typedef {import('./nodos').OperacionBinaria} OperacionBinaria


 * @typedef {import('./nodos').OperacionUnaria} OperacionUnaria


 * @typedef {import('./nodos').Agrupacion} Agrupacion


 * @typedef {import('./nodos').Numero} Numero


 * @typedef {import('./nodos').DeclaracionVariable} DeclaracionVariable


 * @typedef {import('./nodos').ReferenciaVariable} ReferenciaVariable


 * @typedef {import('./nodos').Print} Print


 * @typedef {import('./nodos').ExpresionStmt} ExpresionStmt


 * @typedef {import('./nodos').Asignacion} Asignacion


 * @typedef {import('./nodos').Bloque} Bloque


 * @typedef {import('./nodos').If} If


 * @typedef {import('./nodos').While} While


 * @typedef {import('./nodos').For} For


 * @typedef {import('./nodos').Break} Break


 * @typedef {import('./nodos').Continue} Continue


 * @typedef {import('./nodos').Return} Return


 * @typedef {import('./nodos').Llamada} Llamada


 * @typedef {import('./nodos').FuncDcl} FuncDcl


 * @typedef {import('./nodos').Switch} Switch


 * @typedef {import('./nodos').Ternario} Ternario


 * @typedef {import('./nodos').Embebidas} Embebidas


 * @typedef {import('./nodos').DeclaracionArreglo} DeclaracionArreglo


 * @typedef {import('./nodos').DeclaracionArregloTam} DeclaracionArregloTam


 * @typedef {import('./nodos').DeclaracionArregloCopia} DeclaracionArregloCopia


 * @typedef {import('./nodos').AccesoArreglo} AccesoArreglo


 * @typedef {import('./nodos').AsignacionArreglo} AsignacionArreglo


 * @typedef {import('./nodos').FuncionArreglo} FuncionArreglo


 * @typedef {import('./nodos').ForEach} ForEach

 */


/**
 * Clase base para los visitantes
 * @abstract
 */
export class BaseVisitor {

    
    /**
     * @param {Expresion} node
     * @returns {any}
     */
    visitExpresion(node) {
        throw new Error('Metodo visitExpresion no implementado');
    }
    

    /**
     * @param {Primal} node
     * @returns {any}
     */
    visitPrimal(node) {
        throw new Error('Metodo visitPrimal no implementado');
    }
    

    /**
     * @param {OperacionBinaria} node
     * @returns {any}
     */
    visitOperacionBinaria(node) {
        throw new Error('Metodo visitOperacionBinaria no implementado');
    }
    

    /**
     * @param {OperacionUnaria} node
     * @returns {any}
     */
    visitOperacionUnaria(node) {
        throw new Error('Metodo visitOperacionUnaria no implementado');
    }
    

    /**
     * @param {Agrupacion} node
     * @returns {any}
     */
    visitAgrupacion(node) {
        throw new Error('Metodo visitAgrupacion no implementado');
    }
    

    /**
     * @param {Numero} node
     * @returns {any}
     */
    visitNumero(node) {
        throw new Error('Metodo visitNumero no implementado');
    }
    

    /**
     * @param {DeclaracionVariable} node
     * @returns {any}
     */
    visitDeclaracionVariable(node) {
        throw new Error('Metodo visitDeclaracionVariable no implementado');
    }
    

    /**
     * @param {ReferenciaVariable} node
     * @returns {any}
     */
    visitReferenciaVariable(node) {
        throw new Error('Metodo visitReferenciaVariable no implementado');
    }
    

    /**
     * @param {Print} node
     * @returns {any}
     */
    visitPrint(node) {
        throw new Error('Metodo visitPrint no implementado');
    }
    

    /**
     * @param {ExpresionStmt} node
     * @returns {any}
     */
    visitExpresionStmt(node) {
        throw new Error('Metodo visitExpresionStmt no implementado');
    }
    

    /**
     * @param {Asignacion} node
     * @returns {any}
     */
    visitAsignacion(node) {
        throw new Error('Metodo visitAsignacion no implementado');
    }
    

    /**
     * @param {Bloque} node
     * @returns {any}
     */
    visitBloque(node) {
        throw new Error('Metodo visitBloque no implementado');
    }
    

    /**
     * @param {If} node
     * @returns {any}
     */
    visitIf(node) {
        throw new Error('Metodo visitIf no implementado');
    }
    

    /**
     * @param {While} node
     * @returns {any}
     */
    visitWhile(node) {
        throw new Error('Metodo visitWhile no implementado');
    }
    

    /**
     * @param {For} node
     * @returns {any}
     */
    visitFor(node) {
        throw new Error('Metodo visitFor no implementado');
    }
    

    /**
     * @param {Break} node
     * @returns {any}
     */
    visitBreak(node) {
        throw new Error('Metodo visitBreak no implementado');
    }
    

    /**
     * @param {Continue} node
     * @returns {any}
     */
    visitContinue(node) {
        throw new Error('Metodo visitContinue no implementado');
    }
    

    /**
     * @param {Return} node
     * @returns {any}
     */
    visitReturn(node) {
        throw new Error('Metodo visitReturn no implementado');
    }
    

    /**
     * @param {Llamada} node
     * @returns {any}
     */
    visitLlamada(node) {
        throw new Error('Metodo visitLlamada no implementado');
    }
    

    /**
     * @param {FuncDcl} node
     * @returns {any}
     */
    visitFuncDcl(node) {
        throw new Error('Metodo visitFuncDcl no implementado');
    }
    

    /**
     * @param {Switch} node
     * @returns {any}
     */
    visitSwitch(node) {
        throw new Error('Metodo visitSwitch no implementado');
    }
    

    /**
     * @param {Ternario} node
     * @returns {any}
     */
    visitTernario(node) {
        throw new Error('Metodo visitTernario no implementado');
    }
    

    /**
     * @param {Embebidas} node
     * @returns {any}
     */
    visitEmbebidas(node) {
        throw new Error('Metodo visitEmbebidas no implementado');
    }
    

    /**
     * @param {DeclaracionArreglo} node
     * @returns {any}
     */
    visitDeclaracionArreglo(node) {
        throw new Error('Metodo visitDeclaracionArreglo no implementado');
    }
    

    /**
     * @param {DeclaracionArregloTam} node
     * @returns {any}
     */
    visitDeclaracionArregloTam(node) {
        throw new Error('Metodo visitDeclaracionArregloTam no implementado');
    }
    

    /**
     * @param {DeclaracionArregloCopia} node
     * @returns {any}
     */
    visitDeclaracionArregloCopia(node) {
        throw new Error('Metodo visitDeclaracionArregloCopia no implementado');
    }
    

    /**
     * @param {AccesoArreglo} node
     * @returns {any}
     */
    visitAccesoArreglo(node) {
        throw new Error('Metodo visitAccesoArreglo no implementado');
    }
    

    /**
     * @param {AsignacionArreglo} node
     * @returns {any}
     */
    visitAsignacionArreglo(node) {
        throw new Error('Metodo visitAsignacionArreglo no implementado');
    }
    

    /**
     * @param {FuncionArreglo} node
     * @returns {any}
     */
    visitFuncionArreglo(node) {
        throw new Error('Metodo visitFuncionArreglo no implementado');
    }
    

    /**
     * @param {ForEach} node
     * @returns {any}
     */
    visitForEach(node) {
        throw new Error('Metodo visitForEach no implementado');
    }
    
}
