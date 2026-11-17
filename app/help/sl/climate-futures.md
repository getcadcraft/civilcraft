---
title: "Podnebne prihodnosti: poplave, vročina in požar v letih 2050 in 2080"
summary: V »Naslovu v lokacijo« dvignite raven poplav za prihodnje podnebje, preverite izpostavljenost požaru in preoblikujte vremensko datoteko ter primerjajte sedanje z bodočimi vrednostmi iz paketa podnebnih podatkov (SSP2-4.5 in SSP5-8.5, 2050 in 2080).
keywords: podnebje, podnebne spremembe, prihodnost, 2050, 2080, ssp, cmip6, scenarij, dvig morja, poplava, osnovna poplavna kota, bfe, fema, vročina, vremenska datoteka, epw, preoblikovanje, požar, gozdni požar
from: b0d2ee38
---

Podnebni podatki prihajajo iz **paketa podatkov**, ne iz aplikacije. Vklopite dodatek {{ui:Podnebne prihodnosti}} v Nastavitve › Dodatki ali naložite lastno datoteko paketa v blok {{ui:Podnebna prihodnost}}.

:::warning
Paket, ki pride z dodatkom, je **vzorec**: tri kraji (Denver, Miami, Johannesburg), en podnebni model, pet let v vsakem 20-letnem obdobju. Je tu za preizkus orodij, **ne za projektiranje**. Poln paket se zgradi z `tools/climate/build-pack.mjs` iz podatkov NASA NEX-GDDP-CMIP6.
:::

## Kje je

Površje › Več › Naslov v lokacijo. Nastavite točko, dodajte sloje (sloj poplav FEMA da osnovno poplavno koto) in pritisnite gumb, ki prebere lokacijo. Pod vrsticami lokacije je blok {{ui:Podnebna prihodnost}}: izberite **Scenarij** (SSP2-4.5 ali SSP5-8.5) in **Leto** (2050 = 2041-2060, 2080 = 2071-2090, oboje glede na 1995-2014). Uporabi se kraj paketa, ki je najbližje točki, ali tisti, ki ga izberete; daleč od vseh krajev se uporabijo globalne povprečne spremembe, panel pa to pove.

## Projektna raven poplave

Sedanja raven je osnovna poplavna kota FEMA, če ju je poplavni sloj imel (čevlji, NAVD 88), sicer vpišite svojo. Izberite vrsto poplave (obalna, rečna ali obilni dež ali obe), globino poplave na lokaciji za del z padavinami ter varnostno višino (freeboard), če jo želite. {{ui:Dvigni raven poplav}} prikaže sedanjo in prihodnjo raven drug ob drugem, morski in padavinski del ter predpostavke: celoten dvig morske gladine se prišteje obalni ravni; pretok reke narašča enako z največ padavinami v enem dnevu, globina pa sledi pretoku na potenco 0.6 (Manning, široka struga); deli se seštejejo.

:::warning
Presoja spremembe, ne študija poplav. Projektno raven poplave določi pristojni organ ali vaš inženir.
:::

## Izpostavljenost požaru (samo presoja)

Najbližja vegetacija, naklon terena od nje navzgor in razdalja dajo pas od zelo nizkega do ekstremnega, sedanjega in prihodnjega (prihodnji pomnoži sprememba indeksa požarnega vremena iz paketa). **Samo presoja:** naša lastna relativna lestvica, da ugotovite, ali lokacija potrebuje ustrezno oceno požarne ogroženosti; ni uradna ocena po predpisu.

## Vročina: prihodnja vremenska datoteka

Izberite sedanjo datoteko `.epw` in {{ui:Ustvari prihodnjo vremensko datoteko}}: preoblikuje se z objavljeno metodo premika in raztega (Belcher, Hacker in Powell 2005), vročina pa se primerja (povprečna in najvišja temperatura, projektne temperature, ure nad 30 °C in 35 °C, stopinjski dnevi). {{ui:Shrani prihodnjo vremensko datoteko}} jo shrani za panel Okolje, za BimCraftov energijski pregled ali za vaša orodja.

## Od kod so številke

NASA NEX-GDDP-CMIP6 (zmanjšani izhodi modelov CMIP6, CC BY 4.0 na model) za temperaturo, vlažnost, sončno obsevanje, dež in vreme za požar; globalno povprečje IPCC AR6 za dvig morske gladine, razen če paket nosi lokalne podatke. Panel prikazuje vir paketa, licenco in datum.
