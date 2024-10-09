import { registers as reg } from "./constantes.js";

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
    }

    add(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('add', rd, rs1, rs2))
    }

    sub(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('sub', rd, rs1, rs2))
    }

    mul(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('mul', rd, rs1, rs2))
    }

    div(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('div', rd, rs1, rs2))
    }

    addi(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('addi', rd, rs1, inmediato))
    }

    sw(rs1, rs2, inmediato = 0) {
        this.instrucciones.push(new Instruction('sw', rs1, `${inmediato}(${rs2})`))
    }

    lw(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('lw', rd, `${inmediato}(${rs1})`))
    }

    li(rd, inmediato) {
        this.instrucciones.push(new Instruction('li', rd, inmediato))
    }

    push(rd = reg.T0) {
        this.addi(reg.SP, reg.SP, -4) // 4 bytes = 32 bits
        this.sw(rd, reg.SP)
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

    endProgram() {
        this.li(reg.A7, 10)
        this.ecall()
    }

    comment(text) {
        this.instrucciones.push(new Instruction(`# ${text}`))
    }

    toString() {
        return `
.text
main:
    ${this.instrucciones.map(instruccion => `${instruccion}`).join('\n')}
`
    }

}