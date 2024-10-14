import { registers as reg } from "./constantes.js";
import { stringTo1ByteArray, numberToF32 } from "./utils.js";
import { builtins } from "./builtins.js";

class Instruction {

    constructor(instruccion, rd, rs1, rs2) {
        this.instruccion = instruccion;
        this.rd = rd;
        this.rs1 = rs1;
        this.rs2 = rs2;
    }

    toString() {
        const operandos = []
        if (this.rd !== undefined) operandos.push(this.rd)
        if (this.rs1 !== undefined) operandos.push(this.rs1)
        if (this.rs2 !== undefined) operandos.push(this.rs2)
        return `${this.instruccion} ${operandos.join(', ')}`
    }

}

export class Generador {
    constructor() {
        this.instrucciones = []
        this.objectStack=[]
        this.depth = 0
        this._usedBuiltins = new Set()
        this._labelCounter = 0;
    }

    add(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('add', rd, rs1, rs2))
    }

    fadd(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fadd.s', rd, rs1, rs2))
    }

    sub(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('sub', rd, rs1, rs2))
    }

    fsub(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fsub.s', rd, rs1, rs2))
    }

    mul(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('mul', rd, rs1, rs2))
    }

    fmul(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fmul.s', rd, rs1, rs2))
    }

    div(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('div', rd, rs1, rs2))
    }

    fdiv(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fdiv.s', rd, rs1, rs2))
    }

    mod(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('rem', rd, rs1, rs2))
    }

    addi(rd, rs1, inm) {
        this.instrucciones.push(new Instruction('addi', rd, rs1, inm))
    }

    sw(rs1, rs2, inm = 0) {
        this.instrucciones.push(new Instruction('sw', rs1, `${inm}(${rs2})`))
    }

    sb(rs1, rs2, inmediato = 0) {
        this.instrucciones.push(new Instruction('sb', rs1, `${inmediato}(${rs2})`))
    }

    lw(rd, rs1, inm = 0) {
        this.instrucciones.push(new Instruction('lw', rd, `${inm}(${rs1})`))
    }

    flw(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('flw', rd, `${inmediato}(${rs1})`))
    }

    li(rd, inm) {
        this.instrucciones.push(new Instruction('li', rd, inm))
    }

    fli(rd, inmediato) {
        this.instrucciones.push(new Instruction('fli.s', rd, inmediato))
    }

    fmv(rd, rs1) {
        this.instrucciones.push(new Instruction('fmv.s', rd, rs1))
    }

    lb(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('lb', rd, `${inmediato}(${rs1})`))
    }

    fcvtsw(rd, rs1) {
        this.instrucciones.push(new Instruction('fcvt.s.w', rd, rs1))
    }

    push(rd = reg.T0) {
        this.addi(reg.SP, reg.SP, -4) // 4 bytes = 32 bits
        this.sw(rd, reg.SP)
    }

    pushFloat(rd = reg.FT0) {
        this.addi(reg.SP, reg.SP, -4) // 4 bytes = 32 bits
        this.fsw(rd, reg.SP)
    }

    pop(rd = reg.T0) {
        this.lw(rd, reg.SP)
        this.addi(reg.SP, reg.SP, 4)
    }

    ecall() {
        this.instrucciones.push(new Instruction('ecall'))
    }

    printInt(rd = reg.A0) {

        if (rd !== reg.A0) {
            this.push(reg.A0)
            this.add(reg.A0, rd, reg.ZERO)
        }

        this.li(reg.A7, 1)
        this.ecall()

        if (rd !== reg.A0) {
            this.pop(reg.A0)
        }

    }

    printFloat() {
        this.li(reg.A7, 2)
        this.ecall()
    }

    endProgram() {
        this.li(reg.A7, 10)
        this.ecall()
    }

    comment(text) {
        this.instrucciones.push(new Instruction(`# ${text}`))
    }

    printString(rd = reg.A0) {
        if (rd !== reg.A0) {
            this.push(reg.A0)
            this.add(reg.A0, rd, reg.ZERO)
        }

        this.li(reg.A7, 4)
        this.ecall()

        if (rd !== reg.A0) {
            this.pop(reg.A0)
        }
    }

    pushConstant(object) {
        let length = 0;
        switch (object.tipo) {
            case 'int':
                this.li(reg.T0, object.valor);
                this.push()
                length = 4;
                break;

            case 'string':
                const stringArray = stringTo1ByteArray(object.valor);
                this.comment(`Pushing string ${object.valor}`);
                this.push(reg.HP);
                stringArray.forEach((charCode) => {
                    this.li(reg.T0, charCode);
                    this.sb(reg.T0, reg.HP);
                    this.addi(reg.HP, reg.HP, 1);
                });
                length = 4;
                break;

            case 'boolean':
                this.li(reg.T0, object.valor ? 1 : 0);
                this.push(reg.T0);
                length = 4;
                break;

            case 'float':
                const ieee754 = numberToF32(object.valor);
                this.li(reg.T0, ieee754);
                this.push(reg.T0);
                length = 4;
                break;

            default:
                break;
        }

        this.pushObject({ tipo: object.tipo, length, depth: this.depth });
    }

    pushObject(object) {
        this.objectStack.push(object);
    }

    popFloat(rd = reg.FT0) {
        this.flw(rd, reg.SP)
        this.addi(reg.SP, reg.SP, 4)
    }

    popObject(rd = reg.T0) {
        const object = this.objectStack.pop();
        switch (object.tipo) {
            case 'int':
                this.pop(rd);
                break;

            case 'string':
                this.pop(rd);
                break;

            case 'boolean':
                this.pop(rd);
                break;

            case 'float':
                this.popFloat(rd);
                break;

            default:
                break;
        }

        return object;
    }

    getLabel() {
        return `L${this._labelCounter++}`
    }

    addLabel(label) {
        label = label || this.getLabel()
        this.instrucciones.push(new Instruction(`${label}:`))
        return label
    }

    // Condicionales

    // ==
    beq(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('beq', rs1, rs2, label))
    }

    // !=
    bne(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('bne', rs1, rs2, label))
    }
    
    // <
    blt(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('blt', rs1, rs2, label))
    }

    // >=
    bge(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('bge', rs1, rs2, label))
    }

    jal(label) {
        this.instrucciones.push(new Instruction('jal', label))
    }

    j(label) {
        this.instrucciones.push(new Instruction('j', label))
    }

    ret() {
        this.instrucciones.push(new Instruction('ret'))
    }

    callBuiltin(builtinName) {
        if (!builtins[builtinName]) {
            throw new Error(`Builtin ${builtinName} not found`)
        }
        this._usedBuiltins.add(builtinName)
        this.jal(builtinName)
    }

    // Entornos 
    
    getTopObject() {
        return this.objectStack[this.objectStack.length - 1];
    }

    newScope() {
        this.depth++
    }

    endScope() {
        let byteOffset = 0;

        for (let i = this.objectStack.length - 1; i >= 0; i--) {
            if (this.objectStack[i].depth === this.depth) {
                byteOffset += this.objectStack[i].length;
                this.objectStack.pop();
            } else {
                break;
            }
        }
        this.depth--

        return byteOffset;
    }

    tagObject(id) {
        this.objectStack[this.objectStack.length - 1].id = id;
    }

    getObject(id) {
        let byteOffset = 0;
        for (let i = this.objectStack.length - 1; i >= 0; i--) {
            if (this.objectStack[i].id === id) {
                return [byteOffset, this.objectStack[i]];
            }
            byteOffset += this.objectStack[i].length;
        }

        throw new Error(`Variable ${id} not found`);
    }

    toString() {
        this.comment('Fin del programa')
        this.endProgram()
        this.comment('Builtins')
        Array.from(this._usedBuiltins).forEach(builtinName => {
            this.addLabel(builtinName)
            builtins[builtinName](this)
            this.ret()
        })

        return `
.data
        heap:
.text

# inicializando el heap pointer
    la ${reg.HP}, heap

main:
    ${this.instrucciones.map(instruccion => `${instruccion}`).join('\n')}
` } }