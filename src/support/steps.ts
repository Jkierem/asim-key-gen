import { Brand, Data, Effect, Either } from "effect"
import { UnknownException } from "effect/Cause";
import { gcd } from "./utils";

type Prime = number & Brand.Brand<"Prime">
const Prime = Brand.nominal<Prime>();
class NotPrime extends Data.TaggedError("NotPrime"){}
export const isPrime = Effect.fn(function*(n: number){
  let start = 2;
  const limit = Math.sqrt(n);
  while (start <= limit) {
      if (n % start++ < 1) return yield* new NotPrime;
  }
  return n > 1 ? Prime(n) : yield* new NotPrime
})

type Coprime = number & Brand.Brand<"Coprime">;
const Coprime = Brand.nominal<Coprime>();
class NotCoprime extends Data.TaggedError("NotCoprime")<{ to: number }>{}
class OutsideBounds extends Data.TaggedError("OutsideBounds")<{ bounds: [number, number] }>{}
export const isCoprimeTo = (a: number) => Effect.fn(function*(b: number){
    if( !(1 < b && b < a) ){
        return yield* new OutsideBounds({ bounds: [1, a] })
    }
    if( gcd(a,b) !== 1 ){
        return yield* new NotCoprime({ to: a });
    }
    return Coprime(b);
})

export class PickPrimes 
extends Data.TaggedClass("PickPrimes"){
    next(p: Prime, q: Prime){
        const possible = [];
        const phi = (p - 1) * (q - 1);
        const limit = phi;
        for(let i = 0 ; i < limit ; i++ ){
            const prime = isCoprimeTo(phi)(i).pipe(
                Effect.either,
                Effect.runSync,
                Either.isRight
            )
            if( prime ){
                possible.push(i);
            }
        }
        return Effect.succeed(new PickEncoding({
            p, q, phi, possible
        }))
    }
}

export class PickEncoding
extends Data.TaggedClass("PickEncoding")<{
    p: Prime, q: Prime, phi: number, possible: number[]
}> {
    next(e: Coprime){
        return Effect.gen(this, function*(){
            let d = 1
            while((((e*d) - 1) % this.phi) !== 0 ){
                d++
            }
            const mod = this.p * this.q;
            return new End({
                privateKey: { mod, value: e },
                publicKey: { mod, value: d }
            })
        })
    }
}

export type Key = {
    mod: number,
    value: number
}

export class End
extends Data.TaggedClass("End")<{ publicKey: Key, privateKey: Key }> {
    next(){
        return Effect.fail(new UnknownException("")).pipe(Effect.orDie);
    }
}

export type Steps = 
    | PickPrimes
    | PickEncoding
    | End

export const Steps = {
    Init: () => new PickPrimes,
    PickPrimes,
    PickEncoding,
    End
} as const

export class WrongStep 
extends Data.TaggedError("WrongStep"){}
