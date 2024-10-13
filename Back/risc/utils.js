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