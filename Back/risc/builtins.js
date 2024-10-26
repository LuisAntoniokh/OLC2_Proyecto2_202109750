import { registers as reg, floatRegisters as flt} from "./constantes.js"
import { stringTo1ByteArray } from "./utils.js"
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
export const less = (code) => {
    const trueLabel = code.getLabel()
    const endLabel = code.getLabel()
    code.blt(reg.T1, reg.T0, trueLabel) // der < izq
    code.li(reg.T0, 0)
    code.push(reg.T0)
    code.j(endLabel)
    code.addLabel(trueLabel)
    code.li(reg.T0, 1)
    code.push(reg.T0)
    code.addLabel(endLabel)
}

/**
 * 
 * @param {Generador} code 
 */
export const lessFloat = (code) => {
    const trueLabel = code.getLabel();
    const endLabel = code.getLabel();
    code.flts(reg.T0, flt.FT1, flt.FT0); // flt.s t0, ft0, ft1
    code.bnez(reg.T0, trueLabel);
    code.li(reg.T0, 0);
    code.push(reg.T0);
    code.j(endLabel);
    code.addLabel(trueLabel);
    code.li(reg.T0, 1);
    code.push(reg.T0);
    code.addLabel(endLabel);
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

export const lessOrEqualFloat = (code) => {
    const trueLabel = code.getLabel();
    const endLabel = code.getLabel();
    code.fles(reg.T0, flt.FT1, flt.FT0); // fle.s t0, ft1, ft0
    code.bnez(reg.T0, trueLabel);
    code.li(reg.T0, 0);
    code.push(reg.T0);
    code.j(endLabel);
    code.addLabel(trueLabel);
    code.li(reg.T0, 1);
    code.push(reg.T0);
    code.addLabel(endLabel);
};


/**
 * 
 * @param {Generador} code 
 */
export const higher = (code) => {
    const trueLabel = code.getLabel()
    const endLabel = code.getLabel()
    code.bgt(reg.T1, reg.T0, trueLabel) // izq > der
    code.li(reg.T0, 0)
    code.push(reg.T0)
    code.j(endLabel)
    code.addLabel(trueLabel)
    code.li(reg.T0, 1)
    code.push(reg.T0)
    code.addLabel(endLabel)
}

/**
 * 
 * @param {Generador} code 
 */
export const higherFloat = (code) => {
    const trueLabel = code.getLabel();
    const endLabel = code.getLabel();
    code.flts(reg.T0, flt.FT0, flt.FT1); // flt.s t0, ft0, ft1
    code.bnez(reg.T0, trueLabel);
    code.li(reg.T0, 0);
    code.push(reg.T0);
    code.j(endLabel);
    code.addLabel(trueLabel);
    code.li(reg.T0, 1);
    code.push(reg.T0);
    code.addLabel(endLabel);
}


/**
 * 
 * @param {Generador} code 
 */
export const higherOrEqual = (code) => {
    const trueLabel = code.getLabel()
    const endLabel = code.getLabel()
    code.bge(reg.T1, reg.T0, trueLabel) // izq >= der 
    code.li(reg.T0, 0)
    code.push(reg.T0)
    code.j(endLabel)
    code.addLabel(trueLabel)
    code.li(reg.T0, 1)
    code.push(reg.T0)
    code.addLabel(endLabel)
}


export const higherOrEqualFloat = (code) => {
    const trueLabel = code.getLabel();
    const endLabel = code.getLabel();
    code.fles(reg.T0, flt.FT0, flt.FT1); // fle.s t0, ft0, ft1
    code.bnez(reg.T0, trueLabel);
    code.li(reg.T0, 0);
    code.push(reg.T0);
    code.j(endLabel);
    code.addLabel(trueLabel);
    code.li(reg.T0, 1);
    code.push(reg.T0);
    code.addLabel(endLabel);
    code.pushObject({ tipo: 'boolean', length: 4 });
};

/**
 * 
 * @param {Generador} code 
 */
export const equals = (code) => {
    const trueLabel = code.getLabel();
    const endLabel = code.getLabel();
    code.beq(reg.T0, reg.T1, trueLabel); // der == izq
    code.li(reg.T0, 0);
    code.push(reg.T0);
    code.j(endLabel);
    code.addLabel(trueLabel);
    code.li(reg.T0, 1);
    code.push(reg.T0);
    code.addLabel(endLabel);
}

/**
 * @param {Generador} code
 */
export const notEquals = (code) => {
    const trueLabel = code.getLabel();
    const endLabel = code.getLabel();
    code.bne(reg.T0, reg.T1, trueLabel); // der != izq
    code.li(reg.T0, 0);
    code.push(reg.T0);
    code.j(endLabel);
    code.addLabel(trueLabel);
    code.li(reg.T0, 1);
    code.push(reg.T0);
    code.addLabel(endLabel);
};

/**
 * @param {Generador} code
 */
export const equalsFloat = (code) => {
    const trueLabel = code.getLabel();
    const endLabel = code.getLabel();
    code.feqs(reg.T0, flt.FT0, flt.FT1); // feq.s t0, ft0, ft1
    code.bnez(reg.T0, trueLabel);
    code.li(reg.T0, 0);
    code.push(reg.T0);
    code.j(endLabel);
    code.addLabel(trueLabel);
    code.li(reg.T0, 1);
    code.push(reg.T0);
    code.addLabel(endLabel);
};

/**
 * @param {Generador} code
 */
export const notEqualsFloat = (code) => {
    const trueLabel = code.getLabel();
    const endLabel = code.getLabel();
    code.feqs(reg.T0, flt.FT0, flt.FT1); // feq.s t0, ft0, ft1
    code.beqz(reg.T0, trueLabel);
    code.li(reg.T0, 0);
    code.push(reg.T0);
    code.j(endLabel);
    code.addLabel(trueLabel);
    code.li(reg.T0, 1);
    code.push(reg.T0);
    code.addLabel(endLabel);
};

/**
 * @param {Generador} code
 */
export const equalsString = (code) => {
    const trueLabel = code.getLabel();
    const falseLabel = code.getLabel();
    const endLabel = code.getLabel();
    const loopLabel = code.getLabel();

    code.addLabel(loopLabel);
    code.lb(reg.T2, reg.T0); 
    code.lb(reg.T3, reg.T1); 
    code.bne(reg.T2, reg.T3, falseLabel);
    code.beq(reg.T2, reg.ZERO, trueLabel); 
    code.addi(reg.T0, reg.T0, 1); 
    code.addi(reg.T1, reg.T1, 1); 
    code.j(loopLabel);

    code.addLabel(trueLabel);
    code.li(reg.T0, 1); 
    code.j(endLabel);

    code.addLabel(falseLabel);
    code.li(reg.T0, 0); 

    code.addLabel(endLabel);
    code.push(reg.T0);
};

export const notEqualsString = (code) => {
    const trueLabel = code.getLabel();
    const falseLabel = code.getLabel();
    const endLabel = code.getLabel();
    const loopLabel = code.getLabel();

    code.addLabel(loopLabel);
    code.lb(reg.T2, reg.T0); 
    code.lb(reg.T3, reg.T1); 
    code.bne(reg.T2, reg.T3, trueLabel); 
    code.beq(reg.T2, reg.ZERO, falseLabel); 
    code.addi(reg.T0, reg.T0, 1);
    code.addi(reg.T1, reg.T1, 1); 
    code.j(loopLabel); 

    code.addLabel(trueLabel);
    code.li(reg.T0, 1); 
    code.j(endLabel);

    code.addLabel(falseLabel);
    code.li(reg.T0, 0); 

    code.addLabel(endLabel);
    code.push(reg.T0);
};

/**
 * 
 * @param {Generador} code 
 */
export const parseInt = (code) => {

    // A0 -> dirección en heap de la cadena

    code.comment('Buscando el inicio de la parte entera')
    code.add(reg.T1, reg.A0, reg.ZERO)
    code.li(reg.T2, 46) // ascii de "."

    const end = code.getLabel()
    const loop = code.addLabel()

    code.lb(reg.T0, reg.T1)
    code.beq(reg.T0, reg.ZERO, end) // Fin de la cadena
    code.beq(reg.T0, reg.T2, end) // Se encontró el punto
    code.addi(reg.T1, reg.T1, 1)
    code.j(loop)
    code.addLabel(end)

    code.addi(reg.T1, reg.T1, -1) // Retroceder para no incluir el punto o el fin de la cadena
    code.li(reg.T0, 0) // Inicializar el resultado en 0
    code.li(reg.T2, 1) // Inicializar el multiplicador en 1 (UNIDADES)

    const convert = code.getLabel()
    const endConvert = code.getLabel()
    const error = code.getLabel()

    code.li(reg.T4, 9) // el digito máximo que se puede tener
    code.li(reg.T5, 10) // base 10

    code.comment('Convirtiendo la parte entera')
    code.addLabel(convert)
    code.blt(reg.T1, reg.A0, endConvert) // Se terminó de convertir la parte entera
    code.lb(reg.T3, reg.T1)
    code.addi(reg.T3, reg.T3, -48) // Convertir de ascii a entero

    code.blt(reg.T3, reg.ZERO, error) // No es un dígito
    code.blt(reg.T4, reg.T3, error) // Es un dígito mayor a 9; 9 < t3

    code.mul(reg.T3, reg.T3, reg.T5) // t0 = t0 * 10
    code.add(reg.T0, reg.T0, reg.T3) // t0 = t0 + t3
    code.mul(reg.T2, reg.T2, reg.T5) // t2 = t2 * 10
    code.addi(reg.T1, reg.T1, -1)
    code.j(convert)

    const endBuiltin = code.getLabel()

    code.addLabel(endConvert)
    code.push(reg.T0)
    code.j(endBuiltin)

    code.addLabel(error)
    code.li(reg.T0, 0) // NULL    
    code.push(reg.T0)
    code.printStringLiteral("ERROR: No se pudo convertir a entero")

    code.addLabel(endBuiltin)
}

/**
 * 
 * @param {Generador} code 
 */
export const parseFloat = (code) => {

    code.push(reg.A0)
    parseInt(code)
    code.pop(reg.T0) // Parte entera
    code.pop(reg.A0) // Dirección de la cadena

    code.comment('Buscando el inicio de la parte decimal')

    code.add(reg.T1, reg.A0, reg.ZERO)
    code.lb(reg.T2, reg.T1) // T2 = a un caracter de la cadena
    code.li(reg.T3, 46) // ascii de "."

    const initFindLabel = code.getLabel()
    const endFindLabel = code.getLabel()

    code.addLabel(initFindLabel)
    code.beq(reg.T2, reg.ZERO, endFindLabel) // Fin de la cadena
    code.beq(reg.T2, reg.T3, endFindLabel) // Se encontró el punto
    code.addi(reg.T1, reg.T1, 1)
    code.lb(reg.T2, reg.T1)
    code.j(initFindLabel)
    code.addLabel(endFindLabel)

    code.addi(reg.T1, reg.T1, 1) // Retroceder para no incluir el punto o el fin de la cadena
    code.add(reg.A0, reg.T1, reg.ZERO) // A0 = Dirección de la parte decimal

    code.push(reg.T0) // Guardar la parte entera
    code.push(reg.T1) // Guardar la dirección de la parte decimal
    parseInt(code)
    code.pop(reg.T2) // Parte decimal en formato entero
    code.pop(reg.T1) // Dirección de la parte decimal
    code.pop(reg.T0) // Parte entera


    code.comment('Buscando el final de la cadena')
    code.add(reg.T3, reg.A0, reg.ZERO)

    const findEndOfString = code.getLabel()
    const endFindEndOfString = code.getLabel()

    code.lb(reg.T4, reg.T3)
    code.addLabel(findEndOfString)
    code.beq(reg.T4, reg.ZERO, endFindEndOfString) // Fin de la cadena
    code.addi(reg.T3, reg.T3, 1)
    code.lb(reg.T4, reg.T3)
    code.j(findEndOfString)
    code.addLabel(endFindEndOfString)

    // T0 = Parte entera
    // T1 = Dirección de inicio de la parte decimal
    // T2 = Parte decimal en formato entero
    // T3 = Dirección de fin de la cadena

    code.comment('Calculando la parte decimal')
    code.sub(reg.T4, reg.T3, reg.T1) // T4 = Longitud de la parte decimal. Cuantos decimales tiene
    code.li(reg.A0, 1)
    code.li(reg.A1, 0)
    code.li(reg.A2, 10)

    const encontrarDivisorInicio = code.getLabel()
    const encontrarDivisorFin = code.getLabel()

    code.addLabel(encontrarDivisorInicio)
    code.bge(reg.A1, reg.T4, encontrarDivisorFin) // Ya se encontró el divisor
    code.mul(reg.A0, reg.A0, reg.A2)
    code.addi(reg.A1, reg.A1, 1)
    code.j(encontrarDivisorInicio)
    code.addLabel(encontrarDivisorFin)

    code.fcvtsw(flt.FA1, reg.T2) // Convertir la parte decimal a float
    code.fcvtsw(flt.FA2, reg.A0) // Convertir el divisor a float
    code.fdiv(flt.FA1, flt.FA1, flt.FA2) // FA1 = FA1 / FA2

    code.fcvtsw(flt.FA0, reg.T0) // Convertir la parte entera a float

    code.fadd(flt.FA0, flt.FA0, flt.FA1) // FA0 = FA0 + FA1

    code.pushFloat(flt.FA0)


}

export const builtins = {
    concatString,
    lessOrEqual,
    equals,
    equalsString,
    notEquals,
    notEqualsString,
    higherOrEqual,
    lessOrEqualFloat,
    higherOrEqualFloat,
    equalsFloat,
    notEqualsFloat,
    less,
    higher,
    lessFloat,
    higherFloat,
    parseInt,
    parseFloat
}