import { Effect } from "effect";
import { Key } from "./steps";

export const encryptWith = Effect.fn(function*(key: Key, data: number[]){
    const e = BigInt(key.value);
    const mod = BigInt(key.mod);

    return data
        .map(d => BigInt(d))
        .map(d => (d ** e) % mod)
})