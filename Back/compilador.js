import { registers as reg, floatRegisters as flt } from "./risc/constantes.js";
import { Generador } from "./risc/generador.js";
import { BaseVisitor } from "./patron/visitor.js";
import { FrameVisitor } from "./funciones/frame.js";
import { ReferenciaVariable } from "./patron/nodos.js";

export class CompilerVisitor extends BaseVisitor {
    constructor() {
        super();
        this.code = new Generador();
        this.continueLabel = null;
        this.breakLabel = null;
        this.functionMetada = {}
        this.insideFunction = false;
        this.frameDclIndex = 0;
        this.returnLabel = null;
        this.symbolTable = [];
        this.errors = [];
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
                this.errors.push({
                        descripcion: 'Division por cero',
                        linea: node.location.start.line,
                        columna: node.location.start.column,
                        tipo: 'Semántico'
                    });
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
            /*if (index < node.exp.length - 1) {
                this.code.li(reg.A0, 32);
                this.code.li(reg.A7, 11); 
                this.code.ecall();
            }*/
        });
        this.code.printNewLine(); 
    }

    /**
     * @type {BaseVisitor['visitDeclaracionVariable']}
     */
    visitDeclaracionVariable(node){
        if(node.exp){
            node.exp.accept(this);
            if (this.insideFunction) {
                const localObject = this.code.getFrameLocal(this.frameDclIndex);
                const valueObj = this.code.popObject(reg.T0);
    
                this.code.addi(reg.T1, reg.FP, -localObject.offset * 4);
                this.code.sw(reg.T0, reg.T1);
    
                // ! inferir el tipo
                localObject.type = valueObj.type;
                this.frameDclIndex++;
    
                this.symbolTable.push({
                    id: node.id,
                    tipoSimbolo: 'Variable',
                    tipoDato: node.tipo,
                    ambito: 'Local',
                    linea: node.location.start.line,
                    columna: node.location.start.column
                });

                return
            }
        } else {
            this.code.pushConstant({valor: "null", tipo: 'null'});
        }
        this.symbolTable.push({
            id: node.id,
            tipoSimbolo: 'Variable',
            tipoDato: node.tipo,
            ambito: 'Global',
            linea: node.location.start.line,
            columna: node.location.start.column
        });
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
            if (this.insideFunction) {
                this.code.addi(reg.T1, reg.FP, -variableObject.offset * 4);
                this.code.fsw(flt.FT0, reg.T1);
                return
            }
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
        if (this.insideFunction) {
            this.code.addi(reg.T1, reg.FP, -variableObject.offset * 4);
            this.code.sw(reg.T0, reg.T1);
            return
        }
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
        if (this.insideFunction) {
            this.code.addi(reg.T1, reg.FP, -variableObject.offset * 4);
            this.code.lw(reg.T0, reg.T1);
            this.code.push(reg.T0);
            this.code.pushObject({ ...variableObject, id: undefined });
            return
        }
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

    /**
     * @type {BaseVisitor['visitDeclaracionArreglo']}
     */
    visitDeclaracionArreglo(node) {
        const tipo = node.tipo;
        const id = node.id;
        const lista = node.lista;

        this.code.comment(`Declaración de arreglo ${id} de tipo ${tipo}`);
        this.code.push(reg.HP); // Dirección base del arreglo

        lista.forEach((exp, index) => {
            exp.accept(this);
            const valueObject = this.code.popObject(reg.T0);
            this.code.sw(reg.T0, reg.HP, index * 4); // Almacenar el valor en la posición correspondiente
        });

        this.code.addi(reg.HP, reg.HP, lista.length * 4); // Avanzar el puntero del heap
        this.code.pushObject({ tipo: node.tipo, length: lista.length, id }); // Empujar el objeto a la pila
        this.code.tagObject(id); // Etiquetar el objeto
    }

    /**
     * @type {BaseVisitor['visitDeclaracionArregloTam']}
     */
    visitDeclaracionArregloTam(node) {
        const tipo = node.tipo;
        const id = node.id;
        const tam = node.tam;
    
        this.code.comment(`Declaración de arreglo ${id} de tipo ${tipo} con tamaño ${tam}`);
        tam.accept(this);
        const tamObject = this.code.popObject(reg.T0);
        this.code.push(reg.HP); // Dirección base del arreglo
    
        for (let i = 0; i < tamObject.valor; i++) {
            switch (tipo) {
                case 'int':
                    this.code.li(reg.T0, 0);
                    break;
                case 'float':
                    this.code.li(reg.T0, 0);
                    break;
                case 'string':
                    this.code.li(reg.T0, 0);
                    break;
                case 'boolean':
                    this.code.li(reg.T0, 0);
                    break;
                case 'char':
                    this.code.li(reg.T0, 0);
                    break;
            }
            this.code.sw(reg.T0, reg.HP, i * 4); // Almacenar el valor por defecto en la posición correspondiente
        }
    
        this.code.comment(`O en el addi final?`);
        this.code.addi(reg.HP, reg.HP, tam.valor * 4); // Avanzar el puntero del heap
        this.code.pushObject({ tipo: node.tipo, length: tamObject.valor, id }); // Empujar el objeto a la pila
        this.code.tagObject(id);
    }

    /**
     * @type {BaseVisitor['visitDeclaracionArregloCopia']}
     */
    visitDeclaracionArregloCopia(node) {
        const tipo = node.tipo;
        const id = node.id;
        const id2 = node.id2;

        this.code.comment(`Declaración de arreglo ${id} como copia de ${id2}`);
        const [offset, variableObject] = this.code.getObject(id2);

        this.code.push(reg.HP); // Dirección base del nuevo arreglo

        for (let i = 0; i < variableObject.length; i++) {
            this.code.lw(reg.T0, reg.SP, offset + i * 4);
            this.code.sw(reg.T0, reg.HP, i * 4); // Copiar el valor en la posición correspondiente
        }

        this.code.addi(reg.HP, reg.HP, variableObject.length * 4); // Avanzar el puntero del heap
        this.code.pushObject({ tipo: node.tipo, length: variableObject.length, id }); // Empujar el objeto a la pila
        this.code.tagObject(id); // Etiquetar el objeto
    }

    /**
     * @type {BaseVisitor['visitAccesoArreglo']}
     */
    visitAccesoArreglo(node) {
        const id = node.id;
        const indice = node.indice;
    
        this.code.comment(`Acceso al arreglo ${id} en la posición ${indice.valor}`);
        indice.accept(this);
        const indiceObject = this.code.popObject(reg.T0);
    
        const [offset, variableObject] = this.code.getObject(id);
        this.code.lw(reg.T1, reg.SP, offset); // Cargar la dirección base del arreglo
        this.code.slli(reg.T0, reg.T0, 2); // Multiplicar el índice por 4 para obtener la dirección correcta
        this.code.add(reg.T1, reg.T1, reg.T0);
        this.code.lw(reg.T0, reg.T1);
        this.code.push(reg.T0);
        this.code.pushObject({ tipo: variableObject.tipo, length: 4 });
    }

    /**
     * @type {BaseVisitor['visitAsignacionArreglo']}
     */
    visitAsignacionArreglo(node) {
        const id = node.id;
        const indice = node.indice;
        const valor = node.valor.accept(this);
    
        this.code.comment(`Asignación en el arreglo ${id} en la posición ${indice.valor}`);
        indice.accept(this);
        const indiceObject = this.code.popObject(reg.T0);
        const valorObject = this.code.popObject(reg.T1);
    
        const [offset, variableObject] = this.code.getObject(id);
        this.code.lw(reg.T2, reg.SP, offset); // Cargar la dirección base del arreglo
        this.code.slli(reg.T0, reg.T0, 2); // Multiplicar el índice por 4 para obtener la dirección correcta
        this.code.add(reg.T2, reg.T2, reg.T0);
        this.code.sw(reg.T1, reg.T2);
        this.code.push(reg.T1);
        this.code.pushObject(valorObject);
    }

    /**
     * @type {BaseVisitor['visitFuncDcl']}
     */
    visitFuncDcl(node) {
        const baseSize=2;
        const paramSize = node.params.length;
        const frameVisitor = new FrameVisitor(baseSize+paramSize);
        node.block.accept(frameVisitor);
        const localFrame = frameVisitor.frame;
        const localSize = localFrame.length;
        const returnSize = 1;
        const totalSize = baseSize + paramSize + localSize + returnSize;

        this.functionMetada[node.id] = {
            frameSize: totalSize,
            returnType: node.td,
        };

        const instruccionesDeMain = this.code.instrucciones;
        const instruccionesDeDeclaracionDeFuncion = [];
        this.code.instrucciones = instruccionesDeDeclaracionDeFuncion;

        node.params.forEach((param, index)=> {
            this.code.pushObject({
                id: param.id,
                tipo: param.tipo, //Quizas es td
                length: 4,
                offset: baseSize + index
            })});
        
        localFrame.forEach(variableLocal => {
            this.code.pushObject({
                ...variableLocal,
                length: 4,
                tipo: 'local',
            })});
        
        this.insideFunction = node.id;
        this.frameDclIndex = 0;
        this.returnLabel = this.code.getLabel();
        this.code.addLabel(node.id);
        node.block.accept(this);
        this.code.addLabel(this.returnLabel);
        this.code.add(reg.T0, reg.ZERO, reg.FP);
        this.code.lw(reg.RA, reg.T0);
        this.code.jalr(reg.ZERO, reg.RA, 0);
        
        for (let i = 0; i < paramSize+localSize; i++) {
            this.code.objectStack.pop();
        }

        this.code.instrucciones = instruccionesDeMain;
        instruccionesDeDeclaracionDeFuncion.forEach(instruccion => {
            this.code.instrucionesDeFunciones.push(instruccion);
        });

        this.insideFunction = false;
    }

    /**
     * @type {BaseVisitor['visitLlamada']}
     */
    visitLlamada(node){
        if (!(node.callee instanceof ReferenciaVariable)) return
        const nombreFuncion = node.callee.id;

        const embebidas = {
            parseInt: () => {
                node.args[0].accept(this);
                this.code.popObject(reg.A0);
                this.code.callBuiltin('parseInt');
                this.code.pushObject({ tipo: 'int', length: 4 });
            },
            parseFloat: () => {
                node.args[0].accept(this);
                this.code.popObject(reg.FA0);
                this.code.callBuiltin('parseFloat');
                this.code.pushObject({ tipo: 'float', length: 4 });
            },
        }
        if (embebidas[nombreFuncion]) {
            embebidas[nombreFuncion]();
            return
        }

        const etiquetaRetornoLlamada = this.code.getLabel();
        
        this.code.addi(reg.SP, reg.SP, -4*2);
        node.args.forEach((arg) => {
            arg.accept(this);
        });
        this.code.addi(reg.SP, reg.SP, 4*(node.args.length +2));
        this.code.addi(reg.T1, reg.SP, -4);

        this.code.la(reg.T0, etiquetaRetornoLlamada);
        this.code.push(reg.T0);
        this.code.push(reg.FP);
        this.code.addi(reg.FP, reg.T1, 0);

        const frameSize = this.functionMetada[nombreFuncion].frameSize;
        this.code.addi(reg.SP, reg.SP, -(frameSize-2)*4);

        this.code.j(nombreFuncion);
        this.code.addLabel(etiquetaRetornoLlamada);

        const returnSize = frameSize-1;
        this.code.addi(reg.T0, reg.FP, -returnSize*4);
        this.code.lw(reg.A0, reg.T0);

        this.code.addi(reg.T0, reg.FP, -4);
        this.code.lw(reg.FP, reg.T0);
        this.code.addi(reg.SP, reg.SP, frameSize*4);
        this.code.push(reg.A0);
        this.code.pushObject({tipo: this.functionMetada[nombreFuncion].returnType, length: 4});
    }

    /**
     * @type {BaseVisitor['visitReturn']}
     */
    visitReturn(node){
        if(node.exp){
            node.exp.accept(this);
            this.code.popObject(reg.A0);

            const frameSize = this.functionMetada[this.insideFunction].frameSize
            const returnOffest = frameSize-1;
            this.code.addi(reg.T0, reg.FP, -returnOffest*4)
            this.code.sw(reg.A0, reg.T0)
        }

        this.code.j(this.returnLabel);
    }

    /**
     * @type {BaseVisitor['visitEmbebidas']}
     */
    visitEmbebidas(node) {
        switch (node.tipo) {
            case 'parseInt(':
                node.exp.accept(this);
                this.code.popObject(reg.A0);
                this.code.callBuiltin('parseInt');
                this.code.pushObject({ tipo: 'int', length: 4 });
                return;
            case 'parseFloat(':
                node.exp.accept(this);
                this.code.popObject(reg.FA0);
                this.code.callBuiltin('parseFloat');
                this.code.pushObject({ tipo: 'float', length: 4 });
                return;
            case 'toString(':
                node.exp.accept(this);
                const esFloat = this.code.getTopObject().tipo === 'float';
                const node40 = this.code.popObject(esFloat ? flt.FT0 : reg.T0);
                switch (node40.tipo) {
                    case 'int':
                        this.code.callBuiltin('intToString');
                        break;
                    case 'boolean':
                        this.code.callBuiltin('booleanToString');
                        break;
                    default:
                        throw new Error(`Unsupported type for toString: ${inputObject.tipo}`);
                }
            
                this.code.pushObject({ tipo: 'string', length: 4 });
                return;
            case 'toLowerCase(':
                node.exp.accept(this);
                this.code.popObject(reg.A0);
                this.code.callBuiltin('toLowerCase');
                this.code.pushObject({ tipo: 'string', length: 4 });
                return;
            case 'toUpperCase(':
                node.exp.accept(this);
                this.code.popObject(reg.A0);
                this.code.callBuiltin('toUpperCase');
                this.code.pushObject({ tipo: 'string', length: 4 });
                return;
            case 'typeof':
                node.exp.accept(this);
                const isFloat = this.code.getTopObject().tipo === 'float';
                const nodito = this.code.popObject(isFloat ? flt.FT0 : reg.T0); // der
                let typeString;
                switch (nodito.tipo) {
                    case 'int':
                        typeString = "int";
                        break;
                    case 'float':
                        typeString = "float";
                        break;
                    case 'string':
                        typeString = "string";
                        break;
                    case 'char':
                        typeString = "char";
                        break;
                    case 'boolean':
                        typeString = "boolean";
                        break;
                    default:
                        typeString = "unknown";
                }
                this.code.pushConstant({ valor: typeString, tipo: "string" });
                return;
        }
    }

    /**
     * @type {BaseVisitor['visitFuncionArreglo']}
     */
    visitFuncionArreglo(node) {
        const id = node.id;
        const funcion = node.funcion;
        const expresion = node.argumento;

        switch(funcion){
            case 'indexOf':
                expresion.accept(this);
                const expObject = this.code.popObject(reg.T0);
                const [offset, variableObject] = this.code.getObject(id);
                this.code.lw(reg.T1, reg.SP, offset); // Cargar la dirección base del arreglo

                const uniqueId = this.code.getUniqueId(); // Obtener un ID único para las etiquetas
                for (let i = 0; i < variableObject.length; i++) {
                    this.code.lw(reg.T2, reg.T1, i * 4); // Cargar el valor del arreglo
                    this.code.beq(reg.T2, reg.T0, `found_${uniqueId}_${i}`);
                }
                this.code.li(reg.T0, -1); // No encontrado
                this.code.j(`end_indexOf_${uniqueId}`);

                for (let i = 0; i < variableObject.length; i++) {
                    this.code.addLabel(`found_${uniqueId}_${i}`);
                    this.code.li(reg.T0, i); // Índice encontrado
                    this.code.j(`end_indexOf_${uniqueId}`);
                }

                this.code.addLabel(`end_indexOf_${uniqueId}`);
                this.code.push(reg.T0);
                this.code.pushObject({ tipo: 'int', length: 1 });
                break;

            case 'length':
                const [lenOffset, lenVariableObject] = this.code.getObject(node.id);
                this.code.lw(reg.T1, reg.SP, lenOffset); // Cargar la dirección base del arreglo
                this.code.li(reg.T0, lenVariableObject.length); // Longitud del arreglo
                this.code.push(reg.T0);
                this.code.pushObject({ tipo: 'int', length: 1 });
                break;

            case 'join':
                const [joinOffset, joinVariableObject] = this.code.getObject(id);
                this.code.lw(reg.T1, reg.SP, joinOffset); // Cargar la dirección base del arreglo
    
                for (let i = 0; i < joinVariableObject.length; i++) {
                    this.code.lw(reg.T2, reg.T1, i * 4);
                    this.code.mv(reg.A0, reg.T2);
                    this.code.li(reg.A7, 1); 
                    this.code.ecall(); 
    
                    if (i < joinVariableObject.length - 1) {
                        this.code.li(reg.A0, 44); 
                        this.code.li(reg.A7, 11); 
                        this.code.ecall(); 
                        this.code.li(reg.A0, 32);
                        this.code.li(reg.A7, 11);
                        this.code.ecall(); 
                    }
                    if (i > 16){
                        this.code.li(reg.T0, 0);
                        this.code.li(reg.A0, 0);

                    }
                }
                break;

            default:
                return;
        }
    }
}