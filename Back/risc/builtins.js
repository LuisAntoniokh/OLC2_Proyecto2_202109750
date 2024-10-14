import { registers as reg } from "./constantes.js"
import { Generador } from "./generador.js"

/**
 * @param {Generador} code
 */
export const concatString = (code) => {
    // A0 -> dirección en heap de la primera cadena
    // A1 -> dirección en heap de la segunda cadena
    // result -> push en el stack la dirección en heap de la cadena concatenada
    code.push(reg.HP);
    const end1 = code.getLabel()
    const loop1 = code.addLabel()
    code.lb(reg.T1, reg.A0)
    code.beq(reg.T1, reg.ZERO, end1)
    code.sb(reg.T1, reg.HP)
    code.addi(reg.HP, reg.HP, 1)
    code.addi(reg.A0, reg.A0, 1)
    code.j(loop1)
    code.addLabel(end1)

    const end2 = code.getLabel()
    const loop2 = code.addLabel()
    code.lb(reg.T1, reg.A1)
    code.beq(reg.T1, reg.ZERO, end2)
    code.sb(reg.T1, reg.HP)
    code.addi(reg.HP, reg.HP, 1)
    code.addi(reg.A1, reg.A1, 1)
    code.j(loop2)
    code.addLabel(end2)
    code.sb(reg.ZERO, reg.HP)
    code.addi(reg.HP, reg.HP, 1)
}


/**
 * 
 * @param {Generador} code 
 */
export const lessOrEqual = (code) => {
    const trueLabel = code.getLabel()
    const endLabel = code.getLabel()
    code.bge(reg.T0, reg.T1, trueLabel) // der >= izq
    code.li(reg.T0, 0)
    code.push(reg.T0)
    code.j(endLabel)
    code.addLabel(trueLabel)
    code.li(reg.T0, 1)
    code.push(reg.T0)
    code.addLabel(endLabel)
}

export const builtins = {
    concatString,
    lessOrEqual
}