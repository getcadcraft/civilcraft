---
title: Nedheng og strekk
summary: Dine lasttilfeller (temperatur, vind, is) og strekkgrenser, hvordan CivilCraft regner ut strekket i hvert spenn, og strekketabellene.
keywords: nedheng, strekk, lasttilfelle, temperatur, vind, is, asymmetrisk is, dimensjonerende spenn, ekvivalent spenn, tilstandsendring, kjedelinje, strekketabell, bruddstyrke, hverdagsspenning
from: f8876c35
---

## Lasttilfeller og grenser

{{ui:Mer}} › {{ui:Lasttilfeller og grenser…}} redigerer reglene som hver linje i prosjektet følger.

- **Lasttilfeller**: en temperatur, et vindtrykk på lederen (Pa), og radiell is (mm, med sin tetthet). Det første tilfellet er referansen.
- **Strekkgrenser**: en andel av lederens bruddstyrke, på det horisontale strekket eller på det største strekket ved en opphenging, i ett lasttilfelle. Eller oppgi det horisontale strekket selv.
- **Frirom**: avstanden lederen holder over bakken, en vei, en bygning og så videre. Legg til, gi nytt navn til og fjern dem: de er dine. Under dem velger du reglene for **Beplantning under en linje**, **Murer under en linje** og **Underjordiske kryssinger**.
- **Tilfellene kontrollene bruker**: hvilket tilfelle som gir størst nedheng (varm), isolatorutslaget (vind), is, og is på den ene siden av en opphenging.
- **Faktorer**: faktor for fasedeling k, størst isolatorutslag, en faktor på last på opphengning og beslag, vinklene som gjør vinkel- og endeopphengninger, minste overdekning over nedgravde kabler, og størst spenningsfall.

## Pakker: regler og et bibliotek for et land

Ingen lands regler er innebygd i CivilCraft. En **pakke** holder et regelsett og et bibliotek sammen i én fil (`.cclinepack.json`), for et land, en nettoperatør eller et selskap:

- **Lagre som pakke…** i {{ui:Lasttilfeller og grenser…}} skriver regelsettet som vises og biblioteket ditt (eller, når biblioteket ditt er tomt, elementene dette prosjektet bruker). Skriv inn **Land eller region** først.
- **Åpne et regelsett eller en pakke…** leser en pakke, en regelfil eller en bibliotekfil. En pakkes regler vises i dialogen (klikk **Bruk** for å bruke dem), og elementene går inn i biblioteket ditt.
- Pakker andre deler vises på tillegssiden under **Kraftlinjepakker**. To eksempelpakker viser formatet; de er ikke noe lands regler.

Hver pakke kontrolleres når den åpnes, som enhver fil. Kontroller hver verdi mot standarden som gjelder før noe bygges.

To eksempelregelsett finnes å starte fra: **Eksempel: kaldt klima** og **Eksempel: mildt klima**. Tallene deres kommer fra ingen standard: sett verdiene din standard gir. {{ui:Lagre regler}} og {{ui:Åpne regler…}} deler et regelsett som en fil.

## Slik regnes strekket ut

For hver seksjon mellom endeopphengninger:

1. Det **dimensjonerende spennet** er √(ΣL³ ÷ ΣL) av spennene.
2. Hver grense gjøres om til et horisontalt strekk i referansetilfellet gjennom **tilstandsendringsligningen** på det dimensjonerende spennet: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Den strengeste bestemmer strekket.
3. Hvert lasttilfelles strekk følger av det, og formen på hvert spenn er den eksakte **kjedelinjen** gjennom de to festepunktene (også spenn i skråning): nedheng fra korden, lengde, og strekket i hver ende.

Lasten per meter i et tilfelle: vekt pluss is (isareal × tetthet × g) loddrett; vindtrykk × den isbelagte diameteren vannrett.

## Strekketabeller

{{ui:Mer}} › {{ui:Strekketabeller…}} lister, for hver seksjon, det horisontale strekket og hvert spenns nedheng ved hver temperatur i regelsettet (−5 °C til 40 °C med 5 °C-trinn til å begynne med), i stille luft. Lagre dem, og opphengningstabellen, som CSV.

Ikke regnet med: krypning i lederen over årene, og tøyningen i en ny leder. Legg dem til gjennom temperaturene du strekker ved.
