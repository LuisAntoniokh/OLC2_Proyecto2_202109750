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
        this.code.popObject(reg.T0);
    }

    /**
     * @type {BaseVisitor['visitPrimal']}
     */
    visitPrimal(node){
        this.code.pushContant({valor: node.valor, tipo: node.tipo})
    }

    /**
     * @type {BaseVisitor['visitOperacionBinaria']}
     */
    visitOperacionBinaria(node) {
        this.code.comment(`Operacion: ${node.op}`)
        node.izq.accept(this);
        node.der.accept(this);

        this.code.popObject(reg.T0);
        this.code.popObject(reg.T1);

        switch (node.op) {
            case '+':
                this.code.add(reg.T0, reg.T0, reg.T1);
                this.code.push(reg.T0);
                break;

            case '-':
                this.code.sub(reg.T0, reg.T1, reg.T0);
                this.code.push(reg.T0);
                break;

            case '*':
                this.code.mul(reg.T0, reg.T0, reg.T1);
                this.code.push(reg.T0);
                break;

            case '/':
                this.code.div(reg.T0, reg.T1, reg.T0);
                this.code.push(reg.T0);
                // System.out.println(20/4);
                break;
            
            case '%':
                this.code.mod(reg.T0, reg.T1, reg.T0);
                this.code.push(reg.T0);
                // System.out.println(10%2);
                break;
        }
        this.code.pushObject({length: 4, tipo: 'int' });
    }

    /**
     * @type {BaseVisitor['visitOperacionUnaria']}
     */
    visitOperacionUnaria(node) {
        node.exp.accept(this);

        this.code.popObject(reg.T0);

        switch (node.op) {
            case '-':
                this.code.li(reg.T1, 0);
                this.code.sub(reg.T0, reg.T1, reg.T0);
                this.code.push(reg.T0);
                this.code.pushObject({length: 4, tipo: 'int' });
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
        this.code.comment('Print')
        node.exp.accept(this);

        const object = this.code.popObject(reg.A0);
        const tipoPrint = {
            'int': () => this.code.printInt(),
            'string': () => this.code.printString()
        }

        tipoPrint[object.tipo]();
    }
}