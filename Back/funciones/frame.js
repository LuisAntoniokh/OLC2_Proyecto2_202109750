import { BaseVisitor } from "../patron/visitor.js";

export class FrameVisitor extends BaseVisitor {
    constructor(baseOffset) {
        super();
        this.frame = [];
        this.localSize = 0;
        this.baseOffset = baseOffset;
    }

    visitExpresion(node) { }
    visitOperacionBinaria(node) { }
    visitOperacionUnaria(node) { }
    visitAgrupacion(node) { }
    visitPrimitivo(node) { }

    /**
     * 
     * @type {BaseVisitor['visitDeclaracionVariable']}
     */
    visitDeclaracionVariable(node) {
        this.frame.push({
            id: node.id,
            offset: this.baseOffset + this.localSize,
        });
        this.localSize += 1;
    }

    visitReferenciaVariable(node) { }
    visitPrint(node) { }
    visitExpresionStmt(node) { }
    visitAsignacion(node) { }

    /**
     * 
     * @type {BaseVisitor['visitBloque']}
     */
    visitBloque(node) {
        node.block.forEach(dcl => dcl.accept(this));
    }

    /**
     * 
     * @type {BaseVisitor['visitIf']}
     */
    visitIf(node) {
        node.iftrue.accept(this);
        if (node.iffalse) node.iffalse.accept(this);
    }
    /**
     * 
     * @type {BaseVisitor['visitWhile']}
     */
    visitWhile(node) {
        node.loop.accept(this);
    }

    /**
     * 
     * @type {BaseVisitor['visitFor']}
     */
    visitFor(node) {
        node.loop.accept(this);
    }

    visitBreak(node) { }
    visitContinue(node) { }
    visitReturn(node) { }
    visitLlamada(node) { }
    visitFuncDcl(node) { }
    visitAccesoArreglo(node) { }
    visitAsignacionArreglo(node) { }
    visitDeclaracionArreglo(node) { }
    visitDeclaracionArregloCopia(node) { }
    visitDeclaracionArregloTam(node) { }
    visitEmbebidas(node) { }
    visitForEach(node) { }
    visitSwitch(node) { }
    visitFuncionArreglo(node) { }
    visitNumero(node) { }
    visitPrimal(node) { }
    visitTernario(node) { }
}