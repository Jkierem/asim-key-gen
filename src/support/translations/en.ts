const translation = {
    "pickPrime": {
        "labels": {
            "p": "Value of P: ",
            "q": "Value of Q: ",
            "next": "Next"
        },
        "errors": {
            "NoSuchElementException": "P and Q must be positive non-zero integers",
            "NotPrime": "P and Q must be prime numbers",
            "WrongStep": "Unexpected error. Refresh the page."
        }
    },
    "pickEncrypt": {
        "labels": {
            "e": "Value for Encryption: ",
            "next": "Next",
            "possible": "Possible Values: "
        },
        "errors": {
            "NoSuchElementException": "Encryption value must be a non-zero integer",
            "NotCoprime": "Encryption value must be a coprime to {{to}}",
            "OutsideBounds": "Encryption value must be an integer between {{min}} and {{max}}",
            "WrongStep": "Unexpected error. Refresh the page."
        }
    },
    "end": {
        "labels": {
            "privateKey": "Private Key: ({{mod}}, {{value}})",
            "publicKey": "Public Key: ({{mod}}, {{value}})",
            "restart": "Restart",
            "use": "Use"
        }
    },
    "codec": {
        "labels": {
            "privateKey": "Private Key:",
            "publicKey": "Public Key:",
            "invert": "Swap keys:",
            "message": "Message:",
            "encrypt": "Encrypt",
            "decrypt": "Decrypt",
            "use": "Use Result"
        }
    }
} as const

export default translation;