import { registers as reg, floatRegisters as flt } from "./risc/constantes.js";
import { Generador } from "./risc/generador.js";
import { BaseVisitor } from "./patron/visitor.js";


export class CompilerVisitor extends BaseVisitor {
    constructor() {
        super();
        this.code = new Generador();
        this.continueLabel = null;
        this.breakLabel = null;
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
        this.code.pushConstant({valor: node.valor, tipo: node.tipo})
    }

    /**
     * @type {BaseVisitor['visitOperacionBinaria']}
     */
    visitOperacionBinaria(node) {
        this.code.comment(`Operacion: ${node.op}`)

        if(node.op === '&&'){
            node.izq.accept(this);
            this.code.popObject(reg.T0);
            const lbfalse = this.code.getLabel();
            const fin = this.code.getLabel();

            this.code.beq(reg.T0, reg.ZERO, lbfalse);
            node.der.accept(this);
            this.code.popObject(reg.T0);
            this.code.beq(reg.T0, reg.ZERO, lbfalse);

            this.code.li(reg.T0, 1);
            this.code.push(reg.T0);
            this.code.j(fin);
            this.code.addLabel(lbfalse);
            this.code.li(reg.T0, 0);
            this.code.push(reg.T0);

            this.code.addLabel(fin);
            this.code.pushObject({ tipo: 'boolean', length: 4 });
            return
        }

        if (node.op === '||') {
            node.izq.accept(this);
            this.code.popObject(reg.T0);
            const labelTrue = this.code.getLabel();
            const labelEnd = this.code.getLabel();

            this.code.bne(reg.T0, reg.ZERO, labelTrue);
            node.der.accept(this);
            this.code.popObject(reg.T0);
            this.code.bne(reg.T0, reg.ZERO, labelTrue);

            this.code.li(reg.T0, 0);
            this.code.push(reg.T0);
            this.code.j(labelEnd);
            this.code.addLabel(labelTrue);
            this.code.li(reg.T0, 1);
            this.code.push(reg.T0);

            this.code.addLabel(labelEnd);
            this.code.pushObject({ tipo: 'boolean', length: 4 });
            return
        }

        node.izq.accept(this);
        node.der.accept(this);

        const isDerFloat = this.code.getTopObject().tipo === 'float';
        const der = this.code.popObject(isDerFloat ? flt.FT0 : reg.T0); // der
        const isIzqFloat = this.code.getTopObject().tipo === 'float';
        const izq = this.code.popObject(isIzqFloat ? flt.FT1 : reg.T1); // izq

        if (izq.tipo === 'string' && der.tipo === 'string') {
            this.code.add(reg.A0, reg.ZERO, reg.T1);
            this.code.add(reg.A1, reg.ZERO, reg.T0);

            switch (node.op) {
                case '+':
                    this.code.callBuiltin('concatString');
                    this.code.pushObject({ tipo: 'string', length: 4 });
                    return;
                case '==':
                    this.code.callBuiltin('equalsString');
                    this.code.pushObject({ tipo: 'boolean', length: 4 });
                    return;
                case '!=':
                    this.code.callBuiltin('notEqualsString');
                    this.code.pushObject({ tipo: 'boolean', length: 4 });
                    return;
            }
        }

        if (isIzqFloat || isDerFloat) {
            if (!isIzqFloat) this.code.fcvtsw(flt.FT1, reg.T1);
            if (!isDerFloat) this.code.fcvtsw(flt.FT0, reg.T0);

            switch (node.op) {
                case '+':
                    this.code.fadd(flt.FT0, flt.FT1, flt.FT0);
                    break;

                case '-':
                    this.code.fsub(flt.FT0, flt.FT1, flt.FT0);
                    break;

                case '*':
                    this.code.fmul(flt.FT0, flt.FT1, flt.FT0);
                    break;

                case '/':
                    this.code.fdiv(flt.FT0, flt.FT1, flt.FT0);
                    break;
                
                case '==':
                    this.code.callBuiltin('equalsFloat');
                    this.code.pushObject({ tipo: 'boolean', length: 4 });
                    return;

                case '!=':
                    this.code.callBuiltin('notEqualsFloat');
                    this.code.pushObject({ tipo: 'boolean', length: 4 });
                    return
                
                case '<=':
                    this.code.callBuiltin('lessOrEqualFloat');
                    this.code.pushObject({ tipo: 'boolean', length: 4 });
                    return;
                
                case '>=':
                    this.code.callBuiltin('higherOrEqualFloat');
                    this.code.pushObject({ tipo: 'boolean', length: 4 });
                    return;

                case '<':
                    this.code.callBuiltin('lessFloat');
                    this.code.pushObject({ tipo: 'boolean', length: 4 });
                    return;
                
                case '>':
                    this.code.callBuiltin('higherFloat');
                    this.code.pushObject({ tipo: 'boolean', length: 4 });
                    return;

            }
            this.code.pushFloat(flt.FT0);
            this.code.pushObject({ tipo: 'float', length: 4 });
            return;
        }

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
                break;
            
            case '%':
                this.code.mod(reg.T0, reg.T1, reg.T0);
                this.code.push(reg.T0);
                break;

            case '<=':
                this.code.callBuiltin('lessOrEqual');
                this.code.pushObject({ tipo: 'boolean', length: 4 });
                return
            
            case '==':
                this.code.callBuiltin('equals');
                this.code.pushObject({ tipo: 'boolean', length: 4 });
                return
            
            case '!=':
                this.code.callBuiltin('notEquals');
                this.code.pushObject({ tipo: 'boolean', length: 4 });
                return

            case '>=':
                this.code.callBuiltin('higherOrEqual');
                this.code.pushObject({ tipo: 'boolean', length: 4 });
                return

            case '<':
                this.code.callBuiltin('less');
                this.code.pushObject({ tipo: 'boolean', length: 4 });
                return
            
            case '>':
                this.code.callBuiltin('higher');
                this.code.pushObject({ tipo: 'boolean', length: 4 });
                return
        }
        this.code.pushObject({length: 4, tipo: 'int' });
    }

    /**
     * @type {BaseVisitor['visitOperacionUnaria']}
     */
    visitOperacionUnaria(node) {
        if(node.op === '!'){
            node.exp.accept(this);
            this.code.popObject(reg.T0);
            const lbfalse = this.code.getLabel();
            const fin = this.code.getLabel();

            this.code.beq(reg.T0, reg.ZERO, lbfalse);
            this.code.li(reg.T0, 0);
            this.code.push(reg.T0);
            this.code.j(fin);
            this.code.addLabel(lbfalse);
            this.code.li(reg.T0, 1);
            this.code.push(reg.T0);

            this.code.addLabel(fin);
            this.code.pushObject({ tipo: 'boolean', length: 4 });
            return
        }
        
        node.exp.accept(this);
        const isFloat = this.code.getTopObject().tipo === 'float';
        const unico = this.code.popObject(isFloat ? flt.FT0 : reg.T0);

        if (isFloat) {
            this.code.li(reg.T1, 0);
            this.code.fmvwx(flt.FT1, reg.T1);
            this.code.fsub(flt.FT0, flt.FT1, flt.FT0);
            this.code.pushFloat(flt.FT0);
            this.code.pushObject({length: 4, tipo: 'float' });
            return;
        }
            
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
        node.exp.forEach((exp, index) => {
            exp.accept(this);
            const isFloat = this.code.getTopObject().tipo === 'float';
            const object = this.code.popObject(isFloat ? flt.FA0 : reg.A0);
            const tipoPrint = {
                'int': () => this.code.printInt(),
                'string': () => this.code.printString(),
                'float': () => this.code.printFloat(),
                'char': () => this.code.printChar(),
                'boolean': () => this.code.printBoolean(),
                'null': () => this.code.printNull()
            }
            tipoPrint[object.tipo]();
            if (index < node.exp.length - 1) {
                this.code.li(reg.A0, 32);
                this.code.li(reg.A7, 11); 
                this.code.ecall();
            }
        });
        this.code.printNewLine(); 
    }

    /**
     * @type {BaseVisitor['visitDeclaracionVariable']}
     */
    visitDeclaracionVariable(node){
        if(node.exp){
            node.exp.accept(this);
        } else {
            this.code.pushConstant({valor: "null", tipo: 'null'});
        }
            this.code.tagObject(node.id);
    }

    /**
     * @type {BaseVisitor['visitAsignacion']}
     */
    visitAsignacion(node){
        node.asgn.accept(this);
        const isFloat = this.code.getTopObject().tipo === 'float';
        if(isFloat){
            const valueObject = this.code.popObject(flt.FT0);
            const [offset, variableObject] = this.code.getObject(node.id);
            this.code.addi(reg.T1, reg.SP, offset);
            this.code.fsw(flt.FT0, reg.T1);
            variableObject.tipo = valueObject.tipo;
            this.code.pushFloat(flt.FT0);
            this.code.comment(`Asignacion de ${node.id} con ${node.asgn}`);
            this.code.flw(flt.FT0, reg.SP) // flw t0, 0(sp)
            this.code.addi(reg.SP, reg.SP, 4) //addi sp, sp, 4
            return;
        }
        const valueObject = this.code.popObject(reg.T0);
        const [offset, variableObject] = this.code.getObject(node.id);
        this.code.addi(reg.T1, reg.SP, offset);
        this.code.sw(reg.T0, reg.T1);
        variableObject.tipo = valueObject.tipo;
        this.code.push(reg.T0);
        this.code.pushObject(valueObject);
    }

    /**
     * @type {BaseVisitor['visitReferenciaVariable']}
     */
    visitReferenciaVariable(node) {
        const [offset, variableObject] = this.code.getObject(node.id);
        this.code.addi(reg.T0, reg.SP, offset);
        this.code.lw(reg.T1, reg.T0);
        this.code.push(reg.T1);
        this.code.pushObject({ ...variableObject, id: undefined });
    }

     /**
     * @type {BaseVisitor['visitBloque']}
     */
     visitBloque(node) {
        this.code.newScope();
        node.block.forEach(d => d.accept(this));
        const bytesToRemove = this.code.endScope();

        if (bytesToRemove > 0) {
            this.code.addi(reg.SP, reg.SP, bytesToRemove);
        }
    }

    /**
     * @type {BaseVisitor['visitIf']}
     */
    visitIf(node) {
        node.cond.accept(this);
        this.code.popObject(reg.T0);
        const hasElse = !!node.iffalse;

        if (hasElse) {
            const elseLabel = this.code.getLabel();
            const fin = this.code.getLabel();
            this.code.beq(reg.T0, reg.ZERO, elseLabel);
            node.iftrue.accept(this);
            this.code.j(fin);
            this.code.addLabel(elseLabel);
            node.iffalse.accept(this);
            this.code.addLabel(fin);
        } else {
            const fin = this.code.getLabel();
            this.code.beq(reg.T0, reg.ZERO, fin);
            node.iftrue.accept(this);
            this.code.addLabel(fin);
        }
    }

     /**
     * @type {BaseVisitor['visitWhile']}
     */
     visitWhile(node) {
        const inicio = this.code.getLabel();
        const hayContinue = this.continueLabel;
        this.continueLabel = inicio;
        const fin = this.code.getLabel();
        const hayBreak = this.breakLabel;
        this.breakLabel = fin;
        this.code.addLabel(inicio);
        node.cond.accept(this);
        this.code.popObject(reg.T0);
        this.code.beq(reg.T0, reg.ZERO, fin);
        node.loop.accept(this);
        this.code.j(inicio);
        this.code.addLabel(fin);
        this.continueLabel = hayContinue;
        this.breakLabel = hayBreak;
    }

    /**
     * @type {BaseVisitor['visitFor']}
     */
    visitFor(node) {
        const inicioFor = this.code.getLabel();
        const finFor = this.code.getLabel();
        const hayBreak = this.breakLabel;
        this.breakLabel = finFor;
        const incremento = this.code.getLabel();
        const hayContinue = this.continueLabel;
        this.continueLabel = incremento;

        this.code.newScope();
        node.init.accept(this);
        this.code.addLabel(inicioFor);
        node.cond.accept(this);
        this.code.popObject(reg.T0);
        this.code.beq(reg.T0, reg.ZERO, finFor);
        node.loop.accept(this);
        this.code.addLabel(incremento);
        node.inc.accept(this);
        this.code.popObject(reg.T0);
        this.code.j(inicioFor);
        this.code.addLabel(finFor);
        const bytesToRemove = this.code.endScope();

        if (bytesToRemove > 0) {
            this.code.addi(reg.SP, reg.SP, bytesToRemove);
        }

        this.continueLabel = hayContinue;
        this.breakLabel = hayBreak;
    }

    /**
     * @type {BaseVisitor['node']}
     */
    visitBreak(node) {
        this.code.j(this.breakLabel);
    }

    /**
     * @type {BaseVisitor['node']}
     */
    visitContinue(node) {
        this.code.j(this.continueLabel);
    }

    /**
     * @type {BaseVisitor['visitSwitch']}
     */
    visitSwitch(node) {
        const endLabel = this.code.getLabel();
        const defaultLabel = node.defo ? this.code.getLabel() : endLabel;
        const caseLabels = node.cases.map(() => this.code.getLabel());
        const hayBreak = this.breakLabel;
        this.breakLabel = endLabel;
        node.exp.accept(this);
        this.code.popObject(reg.T0);

        // Generar las comparaciones para cada case
        node.cases.forEach((caseNode, index) => {
            this.code.li(reg.T1, caseNode.exp.valor);
            this.code.beq(reg.T0, reg.T1, caseLabels[index]);
        });

        // Si hay un default, saltar a él
        if (node.defo) {
            this.code.j(defaultLabel);
        }

        // Generar el código para cada case
        node.cases.forEach((caseNode, index) => {
            this.code.addLabel(caseLabels[index]);
            caseNode.stmts.forEach(stmt => stmt.accept(this));
        });

        // Generar el código para el default
        if (node.defo) {
            this.code.addLabel(defaultLabel);
            node.defo.stmts.forEach(stmt => stmt.accept(this));
        }

        this.code.addLabel(endLabel);
        this.breakLabel = hayBreak;
    }
}