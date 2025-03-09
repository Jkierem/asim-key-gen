import { Option } from "effect";

export const getOrZero = (op: Option.Option<number>) => Option.getOrElse(op, () => '')

export const gcd = (a: number, b: number) => {
    let gcd;
    if (a === 0) {
        gcd = b;
    } else if (b === 0) {
        gcd = a;
    } else {
        while (a !== b) {
            if (a > b) {
                a -= b;
            } else {
                b -= a;
            }
        }
        gcd = a;
    }

    return gcd;
}