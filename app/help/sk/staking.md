---
title: Vytvoriť výkaz vytyčenia
summary: Vypíšte kolíky pozdĺž osi trasy na staničeniach a odsadeniach alebo geodetické body v jej blízkosti, s pridelením staničenia, odsadenia, Y, X, projektových a terénnych výšok a výkopu alebo násypu, a výkaz uložte ako CSV alebo PDF.
keywords: vytyčovanie, výkaz vytyčenia, výkaz výkopu, výkaz sklonov, staničenie, odsadenie, výkop, násyp, rozloženie, vytyčovanie stavby, skutočné zameranie
from: d8a4e9f1
---

Vyberte os trasy a kliknite na **Výkaz vytyčenia** v jej **Vlastnostiach**.

## Kolíky na staničeniach a odsadeniach

1. **Od** a **do**: staničenia, na ktoré sa kolíky vytýčia (1+50 alebo 150).
2. **každých**: interval. Kolíky sú na každom jeho násobku, na oboch koncoch a (ak je zaškrtávacie políčko označené) tam, kde sa začínajú a končia oblúky osi.
3. **Odsadenia**: vľavo a vpravo od osi, pri pohľade v smere rastúceho staničenia: `12 L, 0, 12 R`, `L12 CL R12` alebo `-12, 0, 12` (vľavo je mínus). Os s koridorom začína hranami spevnenia a krajníc.
4. **Číslovať od** a **s predponou** pomenujú kolíky: 1, 2, 3, alebo S101, S102.

## Geodetické body pri osi

Vyberte **geodetické body pri osi** a vzdialenosť, v akej sa majú hľadať. Každý bod v tejto vzdialenosti dostane svoje staničenie a odsadenie, projektovú výšku v tom mieste a vlastnú výšku ako terén: kontrola bodov vytýčených alebo zameraných ako skutočné vyhotovenie.

## Čo výkaz obsahuje

| Stĺpec | Čo to je |
|---|---|
| Bod | Názov kolíka, alebo číslo geodetického bodu |
| Staničenie, Odsadenie | Kde je pozdĺž osi: L vľavo, R vpravo |
| Y, X | Jeho súradnice |
| Projektová výška | Povrch navrhovaného upraveného koridoru v tom mieste (od čiary výkopu po čiaru výkopu), inak projektový pozdĺžny profil na osi |
| Terénna výška | Jestvujúci povrch v tom mieste, alebo vlastná výška geodetického bodu |
| Výkop/násyp | C, keď je terén nad projektom (treba znížiť), F, keď je pod ním (treba zasypať), na stotinu |

Kolík bez projektovej výšky (mimo koridoru, alebo na osi bez nej mimo stredovej čiary) nemá výkop ani násyp; dialóg uvedie, koľko ich je.

## Uloženie

- **CSV**: riadok s názvom, potom stĺpce vyššie, plus výkop alebo násyp ako číslo so znamienkom (terén mínus projekt) pre tabuľkové procesory a zberače dát.
- **PDF**: tabuľkové strany na zvolenom formáte papiera, jeden kolík na riadok, výkopy oranžovo a násypy zeleno, s popisovým poľom ako na ostatných listoch.

:::note
Kolíky sa počítajú z projektu. Pred čímkoľvek, čo sa postaví, ich skontrolujte podľa schválených plánov.
:::
