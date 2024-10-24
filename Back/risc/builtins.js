import { registers as reg, floatRegisters as flt} from "./constantes.js"
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
    parseInt
}