import { useSyncExternalStore } from "react";
import type { I18nModule, Translation } from "./translations/i18n.types";

const makeI18n = async (init: "en" | "es") => {
    let lang = init;
    let data: Translation | undefined = undefined
    const cache: Map<string, Translation> = new Map()

    const load = async () => {
        if( !cache.has(lang) ){
            const { default: next } = await import(`./translations/${lang}`);
            cache.set(lang, next);
        }
        data = cache.get(lang);
    }

    await load();

    return {
        get locale(){
            return lang;
        },
        get(key: string, interpolations?: Record<string, string>){
            const tokens = key.split(".");
            let context = data;
            let current;
            for( const token of tokens ){
                current = (context as unknown as any)?.[token];
                context = current;
            }
            if( current === undefined ){
                return key;
            }
            const interpolated = (current as string)
                .replace(/\{\{(.*?)\}\}/g, 
                (match: string, group: string) => interpolations?.[group] ?? match    
            )
            return interpolated
        },

        async change(nextLang: "en" | "es"){
            if( lang !== nextLang){
                lang = nextLang
                await load();
            }
        }
    } as unknown as I18nModule;
}

type Callback = () => void
let listeners = [] as Callback[]
function emitChange() {
    for (let listener of listeners) {
      listener();
    }
}

export const changeLanguage = async (next: "en" | "es") => {
    await I18nInstance.ref.change(next)
    I18nInstance = { ref: I18nInstance.ref }
    emitChange()
}

let I18nInstance = { ref: await makeI18n("en") };

const i18nStore = {
    subscribe(listener: Callback) {
      listeners = [...listeners, listener];
      return () => {
        listeners = listeners.filter(l => l !== listener);
      };
    },
    getSnapshot() {
      return I18nInstance;
    }
};

export const useI18n = () => {
    return useSyncExternalStore(i18nStore.subscribe, i18nStore.getSnapshot).ref
}

export const useI18nFn = () => {
    const store = useI18n();
    return ((key, ts) => (store as any).get(key, ts)) as I18nModule['get']
}