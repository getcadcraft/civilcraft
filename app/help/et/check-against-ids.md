---
title: IFC-ekspordi kontrollimine kliendi IDS-i vastu
summary: Laadi fail .ids, mille klient või teeamet sulle andis, ja vaata Probleemides iga eksporditud elementi, mis sellele ei vasta.
keywords: ids, teabe edastamise spetsifikatsioon, buildingsmart, nõuded, üleandmine, kontroll, valideerimine, qa, ifc eksport, ifc 4.3, trass, tee, hanked
from: 183d9a0e
---

## Mida teed

IDS (Information Delivery Specification, buildingSMART-i standard) on loend sellest, mida IFC peab sisaldama. Avalikud hanked saadavad selle sageli koos tööga. CivilCraft kontrollib selle projekti IFC-d, mida ta eksportib, IFC versioonis, mille valisid ekspordi jaoks, selle vastu ja loetleb iga elemendi, mis jääb alla.

## Sammud

1. Ava oma projekt.
2. Klõpsa tööriistariba rühmas Eksport nupule {{ui:IFC}}. Dialoogis vali IFC versioon, mille üle annad.
3. Klõpsa {{ui:Kontrolli IDS-i vastu…}}.
4. Klõpsa {{ui:Laadi .ids-fail…}} ja vali fail. Midagi ei laadita üles.
5. Loe tulemust: iga spetsifikatsioon koos {{ui:Läbib}} või {{ui:Ebaõnnestub}} ja mitu elementi see puudutab.
6. Ava Probleemid ({{key:Ctrl+Shift+M}}) ja klõpsa ebaõnnestumisel, et valida trass, plats, toru, rajatis või hoonemaht, millest see tuli.

## Mida peaksid nägema

- Üks hoiatus iga eksporditud elemendi ja nõude kohta, mida ta ei täida, koos spetsifikatsiooni nimega, mida IDS nõuab, ja sellega, mida eksport sisaldab.
- Kontrollaruanne (Probleemides) algab IDS-iga: selle pealkiri, versioon, autor ja iga spetsifikatsiooni arvud.

## Hea teada

- IDS salvestatakse projektifaili, nii et see kontrollitakse uuesti, kui avad projekti. IDS-i laadimine või eemaldamine on üks tagasivõetav samm.
- Iga muudatus kontrollitakse hiljem uuesti. Suurte pindade kirjutamine võtab aega, seega kontroll ootab siis iga käigu vahel veidi kauem.
- Kontroll kasutab sama faili, mille kirjutab {{ui:IFC}} eksport, viimati seal valitud versioonis (IFC 4.3, kui pole valitud).
- Arvud võrreldakse SI-ühikutes: jalgades projekt teisendatakse enne meetriteks.

- IDS-i mustreid loetakse terve väärtusena. `^` alguses ja `$` lõpus võetakse samuti kui „terve väärtus“, nagu enamik IDS-faile neid mõeldud.

## Järgmine

- [Ekspordi IFC](topic:ifc)
