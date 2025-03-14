const translation = {
    "pickPrime": {
        "labels": {
            "p": "Valor de P: ",
            "q": "Valor de Q: ",
            "next": "Siguiente"
        },
        "errors": {
            "NoSuchElementException": "P y Q deben ser enteros positivos diferentes de 0",
            "NotPrime": "P y Q deben ser primos",
            "WrongStep": "Error inesperado. Refresque la pagina."
        }
    },
    "pickEncrypt": {
        "labels": {
            "e": "Valor para Cifrado: ",
            "next": "Siguiente",
            "possible": "Valores posibles: "
        },
        "errors": {
            "NoSuchElementException": "Valor de cifrado debe ser un entero diferente de cero",
            "NotCoprime": "Valor de cifrado debe ser coprimo a {{to}}",
            "OutsideBounds": "Valor de cifrado deber ser un entero entre {{min}} y {{max}}",
            "WrongStep": "Error inesperado. Refresque la pagina."
        }
    },
    "end": {
        "labels": {
            "privateKey": "Llave Privada: ({{mod}}, {{value}})",
            "publicKey": "Llave Publica: ({{mod}}, {{value}})",
            "restart": "Limpiar",
            "use": "Usar"
        }
    },
    "codec": {
        "labels": {
            "privateKey": "Llave Privada:",
            "publicKey": "Llave Publica:",
            "invert": "Invertir llaves de cifrado:",
            "message": "Mensaje:",
            "encrypt": "Cifrar",
            "decrypt": "Decifrar",
            "use": "Usar Resultado"
        }
    }
} as const

export type Type = typeof translation;
export default translation