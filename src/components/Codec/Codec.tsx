import { Effect, Option, pipe } from "effect";
import { useImperativeHandle, useMemo, useRef, useState } from "react";
import { Key } from "../../support/steps";
import { useIntHandler, useOptional } from "../../support/hooks";
import { getOrZero } from "../../support/utils";
import { encryptWith } from "../../support/crypto";

export type CodecControl = {
  setKeys(publicKey: Key, privateKey: Key): void
}

export const useCodecControl = () => {
  const ref = useRef<CodecControl>({
    setKeys() {
      throw new Error("Not allowed")
    },
  })
  return [ref, (a: Key, b: Key) => ref.current.setKeys(a,b)] as const
}
  
export function Codec({ ref }: { ref: React.RefObject<CodecControl>}) {
    const [message, setMessage] = useState<string>("");
    const [privMod, setPrivMod, handleChangePrivMod] = useIntHandler()
    const [pubMod, setPubMod, handleChangePubMod] = useIntHandler()
    const [priv, setPriv, handlePrivateChange] = useIntHandler()
    const [pub, setPub, handlePublicChange] = useIntHandler()
    const [result, setResult] = useOptional<string>();
    const [invert, setInvert] = useState<boolean>();

    const pubKey: Option.Option<Key> = useMemo(() => {
      return Option.all({
        value: pub,
        mod: pubMod
      })
    }, [pubMod, pub]);

    const privKey: Option.Option<Key> = useMemo(() => {
      return Option.all({
        value: priv,
        mod: privMod
      })
    },[privMod, priv])
  
    useImperativeHandle(ref, () => {
      return {
        setKeys(pub, priv) {
          setPrivMod(priv.mod)
          setPriv(priv.value)
          setPubMod(pub.mod)
          setPub(pub.value)
        },
      }
    }, [
      setPrivMod,
      setPriv,
      setPubMod,
      setPub
    ])
  
    const handleEncrypt = () => {
      const encryptEffect = Effect.gen(function*(){
        const data = message
          .split("")
          .map(c => c.charCodeAt(0))
        const key = yield* (invert ? pubKey : privKey);
        const signed = yield* encryptWith(key, data);
        return signed.join(' ')
      })
  
      encryptEffect.pipe(
        Effect.andThen(setResult),
        Effect.runPromise
      )
    }
  
    const handleDecrypt = () => {
      const decryptEffect = Effect.gen(function*(){
        const data = message
          .split(" ")
          .map(n => Number.parseInt(n, 10))
        const key = yield* (invert ? privKey : pubKey);
        const signed = yield* encryptWith(key, data);
        return signed
          .map(c => String.fromCharCode(Number(c)))
          .join("")
      })
  
      decryptEffect.pipe(
        Effect.andThen(setResult),
        Effect.runPromise
      )
    }
  
    return <main className='codec'>
      <div>
        <div>Llave Privada: (
          {`n = `}<input className='small-input' value={getOrZero(privMod)} onChange={handleChangePrivMod}/>{` `},{` `}
          {`e = `}<input className='small-input' value={getOrZero(priv)} onChange={handlePrivateChange}/>
        ) </div>
        <div>Llave Publica: (
          {`n = `}<input className='small-input' value={getOrZero(pubMod)} onChange={handleChangePubMod}/>{` `},{` `}
          {`d = `}<input className='small-input' value={getOrZero(pub)} onChange={handlePublicChange}/>
        )</div>
      </div>
      <div>
        <div>
          <label htmlFor='message'>Mensaje: </label>
        </div>
        <textarea 
          id="message" 
          className="input-area" 
          value={message} 
          onChange={e => setMessage(e.target.value)}
        />
      </div>
      <div>
        <label>Invertir cifrado</label>
        <input type="checkbox" checked={invert} onChange={() => setInvert(a => !a)}/>
      </div>
      <div>
        <button onClick={handleEncrypt}>Cifrar</button>
        <button onClick={handleDecrypt}>Decifrar</button>
      </div>
      <div>
        {
          pipe(
            result,
            Option.map((result) => <>
              <div className="result-box">{result}</div>
              <button onClick={() => setMessage(result)}>Usar Resultado</button>
            </>
            ),
            Option.getOrElse(() => <></>)
          )
        }
      </div>
    </main>
  }