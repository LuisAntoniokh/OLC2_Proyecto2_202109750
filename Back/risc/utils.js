// Forma anterior de manejar los strings (desde el stack)
export const stringTo32BitsArray = (str) => {
    const res = []
    let elementIndex = 0
    let intRep = 0;
    let shift = 0;

    while (elementIndex < str.length) {
        intRep = intRep | (str.charCodeAt(elementIndex) << shift)
        shift += 8
        if (shift >= 32) {
            res.push(intRep)
            intRep = 0
            shift = 0
        }
        elementIndex++
    }

    if (shift > 0) {
        res.push(intRep);
    }

    return res;
}

export const stringTo1ByteArray = (str) => {
    const res = []
    let elementIndex = 0
    while (elementIndex < str.length) {
        res.push(str.charCodeAt(elementIndex))
        elementIndex++
    }
    res.push(0)
    return res;
}

export const numberToF32 = (number) => {
    const buffer = new ArrayBuffer(4);
    const float32arr = new Float32Array(buffer);
    const uint32arr = new Uint32Array(buffer);
    float32arr[0] = number;
    const integer = uint32arr[0];
    const hexRepr = integer.toString(16);
    return '0x' + hexRepr;
}