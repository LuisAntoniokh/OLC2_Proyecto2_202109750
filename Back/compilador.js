import { registers as reg } from "./risc/constantes.js";
import { Generador } from "./risc/generador.js";
import { BaseVisitor } from "./patron/visitor.js";


export class CompilerVisitor extends BaseVisitor {
    constructor() {
        super();
        this.code = new Generador();
    }

    /**
     * @type {BaseVisitor['visitExpresionStmt']}
     */
    visitExpresionStmt(node) {
        node.exp.accept(this);
    }

    /**
     * @type {BaseVisitor['visitNumero']}
     */
    visitNumero(node) {
        this.code.li(reg.T0, node.valor);
        // this.code.push(reg.T0)
        this.code.push()
    }

    /**
     * @type {BaseVisitor['visitPrimal']}
     */
    visitPrimal(node){
        this.code.li(reg.T0, node.valor);
        this.code.push(reg.T0);
    }

    /**
     * @type {BaseVisitor['visitOperacionBinaria']}
     */
    visitOperacionBinaria(node) {
        node.izq.accept(this);
        node.der.accept(this);

        this.code.pop(reg.T0);
        this.code.pop(reg.T1);

        switch (node.op) {
            case '+':
                this.code.add(reg.T0, reg.T0, reg.T1);
                this.code.push(reg.T0);
                break;
            case '-':
                this.code.sub(reg.T0, reg.T0, reg.T1);
                this.code.push(reg.T0);
                break;
            case '*':
                this.code.mul(reg.T0, reg.T0, reg.T1);
                this.code.push(reg.T0);
                break;
            case '/':
                this.code.div(reg.T0, reg.T1, reg.T2);
                break;
        }
    }

    /**
     * @type {BaseVisitor['visitOperacionUnaria']}
     */
    visitOperacionUnaria(node) {
        node.exp.accept(this);

        this.code.pop(reg.T0);

        switch (node.op) {
            case '-':
                this.code.li(reg.T1, 0);
                this.code.sub(reg.T0, reg.T1, reg.T0);
                this.code.push(reg.T0);
                break;
        }

    }

    /**
     * @type {BaseVisitor['visitAgrupacion']}
     */
    visitAgrupacion(node) {
        return node.exp.accept(this);
    }

    /**
     * @type {BaseVisitor['visitPrint']}
     */
    visitPrint(node) {
        console.log(node.exp.valor);
        node.exp.accept(this);
        this.code.pop(reg.A0);
        this.code.printInt();
    }
}