import { Option } from "effect";
import { useState } from "react";

export const useOptional = <T,>(init?: T) => {
    const [value, setValue] = useState<Option.Option<T>>(Option.fromNullable(init));
  
    const update = (nextValue?: T | ((prev: Option.Option<T>) => Option.Option<T>)) => {
      if( nextValue instanceof Function ){
        setValue(nextValue);
      } else {
        setValue(Option.fromNullable(nextValue));
      }
    }
  
    return [value, update] as const;
}
  
export const useChangeHandler = <T,>(
    parse: (str: string) => T | undefined,
    init?: T
) => {
    const [value, setter] = useOptional(init);
  
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(parse(e.target.value))
    }
  
    return [value, setter, onChange] as const;
}
  
export const useIntHandler = () => {
    return useChangeHandler(
      (str) => {
        try {
          if( str.trim().length === 0 ){
            return undefined
          }
          return Number.parseInt(str, 10)
        } catch {
          return undefined
        }
      }
    )
}