import { changeLanguage, useI18n } from "../../support/i18n"

export const LanguageSelector = () => {
    const i18n = useI18n();
    return <select 
        className="language-selector"
        value={i18n.locale}
        onChange={(e) => {
            const next = e.target.value
            if(["en", "es"].includes(next)){
                changeLanguage(next as "en" | "es")
            }
        }}
    >
        <option value="en">English</option>
        <option value="es">Español</option>
    </select>
}