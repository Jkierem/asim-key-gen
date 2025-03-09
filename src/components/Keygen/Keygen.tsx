import { Effect, Match, Option, pipe } from "effect";
import { getOrZero } from "../../support/utils";
import { ErrorMessage } from "../ErrorMessage/ErrorMessage";
import { isCoprimeTo, isPrime, Key, Steps, WrongStep } from "../../support/steps";
import { useIntHandler, useOptional } from "../../support/hooks";
import { useState } from "react";

export function Keygen({ onUse } : { onUse: (publicKey: Key, privateKey: Key) => void }) {
    const [step, setStep] = useState<Steps>(Steps.Init);
    const [pValue, setPValue, onPChange] = useIntHandler();
    const [qValue, setQValue, onQChange] = useIntHandler();
    const [eValue, setEValue, onEChange] = useIntHandler();
    const [error, setError] = useOptional<string>();
    const resetError = () => setError()
  
    const handleSubmitPrimeCandidates = () => {
      const submitEffect = Effect.gen(function*(){
        const {p, q} = yield* Option.all({
          p: pValue,
          q: qValue
        })
        const primeP = yield* isPrime(p);
        const primeQ = yield* isPrime(q);
        if( step._tag === "PickPrimes" ){
          return yield* step.next(primeP, primeQ);
        }
        return yield* new WrongStep();
      })
  
  
      submitEffect.pipe(
        Effect.tapError(e => {
          return Effect.sync(() => {
            pipe(
              Match.value(e),
              Match.tagsExhaustive({
                NoSuchElementException: () => "P y Q deben ser enteros positivos diferentes de 0.",
                NotPrime: () => "P y Q deben ser primos",
                WrongStep: () => "Error inesperado. Refresque la pagina."
              }),
              setError
            )
          })
        }),
        Effect.andThen(setStep),
        Effect.andThen(resetError),
        Effect.ignore,
        Effect.runPromise
      )
    }
  
    const handleSubmitEncryption = () => {
      const submitEffect = Effect.gen(function*(){
        const e = yield* eValue;
        if( step._tag === "PickEncoding" ){
          const encoding = yield* isCoprimeTo(step.phi)(e);
          return yield* step.next(encoding);
        } else {
          return yield* new WrongStep();
        }
      })
  
      submitEffect.pipe(
        Effect.tapError(e => {
          return Effect.sync(() => {
            pipe(
              Match.value(e),
              Match.tagsExhaustive({
                NoSuchElementException: () => "Valor de cifrado debe ser un entero diferente de cero",
                NotCoprime: (e) => `Valor de cifrado debe ser coprimo a ${e.to}`,
                OutsideBounds: (e) => `Valor de cifrado deber ser un entero entre ${e.bounds.join(" y ")}`,
                WrongStep: () => "Error inesperado. Refresque la pagina."
              }),
              setError
            )
          })
        }),
        Effect.andThen(setStep),
        Effect.andThen(resetError),
        Effect.ignore,
        Effect.runPromise
      )
    }
  
    const handleRestart = () => {
      setPValue()
      setQValue()
      setEValue()
      setStep(Steps.Init);
    }
  
    return <main className='keygen'>
      {
        pipe(
          Match.value(step),
          Match.tag("PickPrimes", () => {
            return <>
              <ErrorMessage error={error}/>
              <div>
                <label>Valor P:{` `}</label>
                <input 
                  className='primary-input' 
                  type='number' 
                  value={getOrZero(pValue)} 
                  onChange={onPChange}
                />
              </div>
              <div>
                <label>Valor Q:{` `}</label>
                <input 
                  className='primary-input' 
                  type='number' 
                  value={getOrZero(qValue)} 
                  onChange={onQChange}
                />
              </div>
              <button onClick={handleSubmitPrimeCandidates}>Next</button>
            </>
          }),
          Match.tag("PickEncoding", () => {
            return <>
              <ErrorMessage error={error}/>
              <div>
                <label>Valor para Cifrado:{` `}</label>
                <input 
                  className='primary-input' 
                  type='number' 
                  value={getOrZero(eValue)}
                  onChange={onEChange}
                />
              </div>
              <button onClick={handleSubmitEncryption}>Next</button>
            </>
            
          }),
          Match.tag("End", ({ privateKey, publicKey }) => {
            return <>
              <div>
                <div>Llave Privada: ({privateKey.mod}, {privateKey.value}) </div>
                <div>Llave Publica: ({publicKey.mod}, {publicKey.value}) </div>
                <button onClick={handleRestart}>Limpiar</button>
                <button onClick={() => onUse(publicKey, privateKey)}>Usar</button>
              </div>
            </>
          }),
          Match.exhaustive
        )
      }
    </main>
}