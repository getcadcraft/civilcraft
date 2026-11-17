---
title: "Vienetai importuojant: failas nurodo savo vienetus arba pirmiausia klausiama"
summary: "Kai brėžinys ar tinklas, kurį įkeliate į projektą, nurodo savo vienetus, CivilCraft juos konvertuoja ir apie tai praneša. Kai nenurodo, CivilCraft prieš nuskaitydamas klausia ir prisimena jūsų atsakymą tam failui."
keywords: "vienetai, importas, DWG, DXF, STL, OBJ, geodezija, pėdos, JAV geodezinės pėdos, metrai, milimetrai, mastelis, neteisingas dydis, per didelis, per mažas, klausti, prisimenama, INSUNITS, brėžinio vienetai"
from: 60921963
---

## Ką darysite

Įkelkite failą į projektą ir įsitikinkite, kad jis įkeliamas teisingu dydžiu.

## Veiksmai

1. Atidarykite failą įprastai: {{ui:Atidaryti}}, įmeskite jį į planą arba naudokite CAD brėžinio komandą.
2. Jei failas nurodo savo vienetus, nieko neklausiama: importavimo lange jie rodomi kaip **Kaip nurodyta brėžinyje**.
3. Jei nenurodo, prieš atidarant importavimo langą rodomas dialogas, klausiantis **Failo vienetai**. Pasirinkite, koks yra vienas vienetas faile, ir spustelėkite {{ui:Naudoti šiuos vienetus}}.
4. {{ui:Atšaukti}} (arba {{key:Esc}}) praleidžia failą. Nieko iš jo nenuskaitoma į projektą.

## Kurie failai nurodo vienetus

- **DWG ir DXF**: brėžinio įterpimo vienetai (`$INSUNITS`). Failas be jų – apie juos klausiama. Importavimo lange esantis sąrašas **Brėžinio vienetai** pradeda nuo jūsų atsakymo ir dar gali būti pakeistas.
- **STL ir OBJ** (kraštovaizdžio laisvos formos): niekada nenurodo vienetų. Jūsų klausiama.
- **Taškų sąrašai** (CSV, TXT) ir eigos geodezijos sąrašai: sąrašas, kuris pirmose eilutėse nurodo savo vienetą, konvertuojamas, ir apie tai rašoma būsenos eilutėje. Sąrašo, kuris vieneto nenurodo, klausiama, kai paspaudžiate {{ui:Importuoti}}, prieš įkeliant taškus. Platumos ir ilgumos stulpeliai vietoj to eina per koordinačių sistemą.
- **Taškų debesų priedas**: klausia, kai kuriate debesį, kurio failas vieneto nenurodo, ir debesies skaičius pažymi vienetu, kurį jis turi.
- **IFC ir LandXML**: nurodo savo vienetus; jie konvertuojami į projekto vienetus.
- **LAS, LAZ ir aukščių rastrai**: išdėstomi pagal savo koordinačių sistemą; reljefo dialogas klausia aukščio vieneto, kai failas to nenurodo.

## Verta žinoti

- Atsakymas tam failui prisimenamas šiame kompiuteryje, visose CadCraft programose. Kitą kartą jo neklausiama.
- Kad vėl būtų klausiama: komandų paletė ({{key:Mod+K}}) › **Vėl klausti importuotų failų vienetų**.
- Sąrašo nurodomas vienetas nuskaitomas iš pirmųjų aštuonių eilučių: eilutė, pavyzdžiui `units: ft`, arba stulpelių antraštės, kurios visos turi tą patį vienetą skliaustuose, pavyzdžiui `Elevation (m)`.
