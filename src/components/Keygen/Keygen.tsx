import { Effect, Match, Option, pipe } from "effect";
import { getOrZero } from "../../support/utils";
import { ErrorMessage } from "../ErrorMessage/ErrorMessage";
import { isCoprimeTo, isPrime, Key, Steps, WrongStep } from "../../support/steps";
import { useIntHandler, useOptional } from "../../support/hooks";
import { useState } from "react";
import { useI18nFn } from "../../support/i18n";

export function Keygen({ onUse } : { onUse: (publicKey: Key, privateKey: Key) => void }) {
    const [step, setStep] = useState<Steps>(Steps.Init);
    const [pValue, setPValue, onPChange] = useIntHandler();
    const [qValue, setQValue, onQChange] = useIntHandler();
    const [eValue, setEValue, onEChange] = useIntHandler();
    const [error, setError] = useOptional<string>();
    const resetError = () => setError()
    const t = useI18nFn();
  
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
            const key = `pickPrime.errors.${e._tag}` as const
            setError(t(key));
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
                NoSuchElementException: () => t("pickEncrypt.errors.NoSuchElementException"),
                NotCoprime: (e) => t("pickEncrypt.errors.NotCoprime", e),
                WrongStep: () => t("pickEncrypt.errors.WrongStep"),
                OutsideBounds: ({ bounds: [min, max]}) => 
                  t("pickEncrypt.errors.OutsideBounds", { min, max }),
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
                <label>{t("pickPrime.labels.p")}{` `}</label>
                <input 
                  className='primary-input' 
                  type='number' 
                  value={getOrZero(pValue)} 
                  onChange={onPChange}
                />
              </div>
              <div>
                <label>{t("pickPrime.labels.q")}{` `}</label>
                <input 
                  className='primary-input' 
                  type='number' 
                  value={getOrZero(qValue)} 
                  onChange={onQChange}
                />
              </div>
              <button onClick={handleSubmitPrimeCandidates}>
                {t("pickPrime.labels.next")}
              </button>
            </>
          }),
          Match.tag("PickEncoding", ({ possible }) => {
            return <>
              <ErrorMessage error={error}/>
              <div>
                <label>{t("pickEncrypt.labels.e")}{` `}</label>
                <input 
                  className='primary-input' 
                  type='number' 
                  value={getOrZero(eValue)}
                  onChange={onEChange}
                />
              </div>
              <button onClick={handleSubmitEncryption}>
                {t("pickEncrypt.labels.next")}
              </button>
              <div
                  style={{
                    wordBreak: "break-all"
                  }}
                >{t("pickEncrypt.labels.possible")}{possible.map(p => {
                  return <button key={p} onClick={() => setEValue(p)}>{p}</button>
                })}</div>
            </>
            
          }),
          Match.tag("End", ({ privateKey, publicKey }) => {
            return <>
              <div>
                <div>{t("end.labels.privateKey", privateKey)}</div>
                <div>{t("end.labels.publicKey", publicKey)}</div>
                <button onClick={handleRestart}>
                  {t("end.labels.restart")}
                </button>
                <button onClick={() => onUse(publicKey, privateKey)}>
                  {t("end.labels.use")}
                </button>
              </div>
            </>
          }),
          Match.exhaustive
        )
      }
    </main>
}