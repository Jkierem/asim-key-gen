import type { Type as Translation } from "./es";

type ParamKeys<A> = 
    A extends `${string}{{${infer T extends string}}}${infer Rest}`
    ? T | ParamKeys<Rest>
    : never

type DotPrefix<T extends string> = 
    T extends "" 
    ? "" 
    : `.${T}`

export type NestedKeys<T> = (
    T extends object ?
    { 
        [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<NestedKeys<T[K]>>}` 
    }[Exclude<keyof T, symbol>]
    : ""
) extends infer D ? Extract<D, string> : never;

export type NestedValue<T, Key> = 
    Key extends `${infer Curr}.${infer Rest}` 
    ? NestedValue<T[Curr & keyof T], Rest>
    : T[Key & keyof T]


export type ReplaceParams<P extends Record<string, string | number>, S> = 
    S extends `${infer L}{{${infer Var extends keyof P & string}}}${infer T}`
    ? `${L}${P[Var]}${ReplaceParams<Omit<P, Var>, T>}`
    : S;

export type ParamValues<T> = Record<ParamKeys<T>, string | number>;

export interface I18n<T> {
    get: <
        const K extends NestedKeys<T>,
        const P extends ParamValues<NestedValue<T, K> & string>,
        const Params extends [keyof P] extends [never] ? readonly [] : readonly [params: P]
    >(
        key: K, 
        ...rest: Params
    ) => K extends NestedKeys<T> 
        ? [keyof P] extends [never]
            ? NestedValue<T, K>
            : ReplaceParams<Params[number], NestedValue<T, K>>
        : never
    change: (lang: "en" | "es") => Promise<void>
    readonly locale: string,
}
export { Translation };
export type I18nKeys = NestedKeys<Translation>;
export type I18nModule = I18n<Translation>;