import qrcode
import random
import string
import os

def generer_qr_codes(codes, dossier="qr_codes"):
    os.makedirs(dossier, exist_ok=True)

    for code in codes:
        img = qrcode.make(f"https://krorion.wysigot.com/?whe/then?code={code}")
        img.save(f"{dossier}/{code}.png")

codes = [
    "e4ebkj",
    "isu5vu",
    "vwom0h",
    "za22gs",
    "5b5ue7",
    "spxtvt",
    "t8dcxv",
    "ll7gao",
    "1ydjt1",
    "4gwyjf",
    "twq06c",
    "oqu9b1",
    "qscjqx",
    "sk3qo4",
    "b7qh60",
    "kjmaxb",
    "vt5cvb",
    "kdiog6",
    "xgcx4a",
    "sev8b5"
]

generer_qr_codes(codes)