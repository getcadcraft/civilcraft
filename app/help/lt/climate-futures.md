---
title: "Klimato ateitis: 2050 ir 2080 potvyniai, karščiai ir miško gaisrai"
summary: Adresas į vietovę: pakelkite vietovės potvynių lygį ateities klimatui, įvertinkite miško gaisrų riziką ir pakeiskite orų failą, rodydami dabartį šalia ateities, iš klimato duomenų paketo (SSP2-4.5 ir SSP5-8.5, 2050 ir 2080).
keywords: klimatas, klimato kaita, ateitis, 2050, 2080, ssp, cmip6, scenarijus, jūros lygis, potvynis, bazinis potvynio aukštis, bfe, fema, karštis, orų failas, epw, morfavimas, miško gaisras, krūmynų gaisras
from: b0d2ee38
---

Klimato skaičiai ateina iš **duomenų paketo**, o ne iš programos. Įjunkite priedą {{ui:Klimato ateitis}} skyriuje Parametrai › Priedai arba įkelkite savo paketo failą bloke {{ui:Klimato ateitis}}.

:::warning
Priede pateikiamas paketas yra **pavyzdys**: trys vietos (Denveris, Majamis, Johanesburgas), vienas klimato modelis, penkeri metai kiekviename 20 metų laikotarpyje. Jis skirtas įrankiams išbandyti, **ne projektavimui**. Pilnas paketas kuriamas su `tools/climate/build-pack.mjs` iš NASA NEX-GDDP-CMIP6 duomenų.
:::

## Kur tai yra

Paviršius › Daugiau › Adresas į vietovę. Nustatykite tašką, pridėkite sluoksnius (FEMA potvynių sluoksnis duoda bazinį potvynio aukštį) ir paspauskite mygtuką, kuris nuskaito vietovę. Po vietovės eilutėmis yra {{ui:Klimato ateitis}} blokas: pasirinkite **Scenarijų** (SSP2-4.5 arba SSP5-8.5) ir **Metus** (2050 = 2041-2060, 2080 = 2071-2090, abu lyginami su 1995-2014). Naudojama paketo vieta, artimiausia taškui, arba jūsų pasirinkta; jei ji toli nuo visų vietų, naudojami globalūs vidutiniai pokyčiai, ir skydelis tai nurodo.

## Projektinis potvynio aukštis

Dabartinis lygis yra FEMA bazinis potvynio aukštis, jei potvynių sluoksnyje jis buvo (pėdomis, NAVD 88); kitu atveju įveskite savo. Pasirinkite potvynio tipą (pakrantės, upės arba smarkių liūčių, arba abu), potvynio gylį vietovėje lietaus daliai ir laisvąjį bortą, jei norite. {{ui:Pakelti potvynio lygį}} rodo dabartinį ir ateities lygį greta, jūros lygio ir lietaus dalis bei prielaidas: visas jūros lygio kilimas pridedamas prie pakrantės lygio; upės tėkmė kyla vienas su vienu su drėgniausios dienos lietaus kiekiu, o gylis seka tėkmę iki 0.6 laipsnio (Manningo, plati vaga); dalys sudedamos.

:::warning
Tai pokyčio įvertinimas, o ne potvynių tyrimas. Projektinį potvynio lygį nustato institucija arba jūsų inžinierius.
:::

## Miško gaisrų poveikis (tik įvertinimas)

Artimiausia augmenija, nuo jos kylantis šlaitas ir atstumas duoda juostą nuo labai žemos iki ekstremalios, dabartinę ir ateities (ateityje dauginama iš paketo gaisrų oro indekso pokyčio). **Tik įvertinimas:** mūsų pačių santykinė skalė, padedanti nustatyti, ar vietovei reikia atskiro miško gaisrų rizikos vertinimo; tai ne normatyvinis įvertinimas.

## Karštis: ateities orų failas

Pasirinkite dabartinį `.epw` failą ir spustelėkite {{ui:Sukurti ateities orų failą}}: jis morfuojamas paskelbtu poslinkio ir ištempimo metodu (Belcher, Hacker and Powell 2005), ir karštis palyginamas (vidutinė ir aukščiausia temperatūra, projektinės temperatūros, valandos virš 30 °C ir 35 °C, laipsnių dienos). {{ui:Įrašyti ateities orų failą}} įrašo jį Aplinkos skydeliui, BimCraft energijos patikrai arba jūsų pačių įrankiams.

## Iš kur skaičiai

NASA NEX-GDDP-CMIP6 (sumažinto masto CMIP6 modelių išvestis, CC BY 4.0 pagal modelį) temperatūrai, drėgmei, saulėtumui, lietui ir gaisrų orams; IPCC AR6 globalus vidurkis jūros lygio kilimui, nebent pakete yra vietiniai skaičiai. Skydelyje rodomas paketo šaltinis, licencija ir data.
