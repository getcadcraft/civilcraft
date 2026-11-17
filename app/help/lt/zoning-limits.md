---
title: Patikrinkite mases pagal jūsų įvestas zonavimo ribas
summary: Įveskite sklypo atstumus nuo ribų eilutė po eilutės, aukščio ribą, dangaus ekspozicijos plokštumą, grindų ploto koeficientą ir padengimą, pamatykite plane leidžiamą apvalkalą ir perskaitykite, kurios masės pažeidžia kurias ribas.
keywords: zonavimas, atstumas nuo ribos, atstumai, priekis, šonas, galas, apvalkalas, leidžiamas plotas, aukščio riba, dangaus ekspozicijos plokštuma, grindų ploto koeficientas, FAR, padengimas, sklypas, parcelis, potvarkis, kodo patikra
from: 3e267b31
---

**CivilCraft jame nėra zonavimo kodekso.** Jis nežino jokių miesto taisyklių ir jų bibliotekos neturi. Kiekvienas šio puslapio skaičius yra jūsų įvestas iš jūsų potvarkio, ir kiekvienas rezultatas nurodo, kad matuojama pagal jūsų įvestas ribas. Tai būdas pamatyti, kaip sklypo ribos formuoja pastatą, o ne sprendimas, ar projektas leidžiamas.

## Įveskite ribas

**Savybėse**, skyriuje **Pastatų masės**, pasirinkite **Parcelį** (arba pasirinkite masę: po ja rodomos jos parcelio ribos). Tada užpildykite tai, kas taikoma; tuščią langelį palikite „be ribos“:

- **Gatvės linija**: sklypo linija prie gatvės. **Priekinis atstumas nuo ribos** taikomas jai, **Galinis atstumas** – linijai, esančiai priešingiausiai jai, o **Šoninis atstumas** – likusioms.
- **Aukščio riba**.
- **Dangaus plokštuma**: ji prasideda nurodytu aukščiu prie sklypo linijos ir kyla kiekvienam vienam horizontaliam atstumui vidun per jūsų įvestą dydį, matuojant nuo gatvės linijos arba nuo kiekvienos sklypo linijos (2 reiškia 2 į 1). Leidžiamas aukštis virš taško yra mažiausias iš plokštumos ir aukščio ribos.
- **Grindų ploto koeficientas** (bendras grindų plotas sklype esančių masių, padalytas iš sklypo ploto) ir **Padengimas** (jų pėdsakai, padalyti iš sklypo ploto, įvedami procentais).

## Apvalkalas

Pažymėkite **Rodyti apvalkalą plane**, kad jis būtų nubrėžtas sluoksnyje `A-MASS-ENVL`. Apvalkalas yra sklypas, sumažintas nuo kiekvienos sklypo linijos pagal tos linijos atstumą, o poslinkio linijos susijungia suapvalintais kampais. Sklypo linija, sudaryta iš kreivės, imama kaip trumpos stygos, ne toliau nei 0,01 nuo kreivės. Tiek išgaubti, tiek įgaubti sklypai veikia. Jei atstumai persilanksto (gilus atstumas siauram ar labai įgaubtam sklypui), apvalkalo nėra ir **Savybės** tai nurodo; bandykite mažesnius atstumus.

## Rezultatas

Po langeliais kiekviena masė ir kiekviena riba gauna eilutę su varnele arba kryžiuku:

- **atstumai**: masės dalis, esanti už apvalkalo, plotas;
- **aukštis**: masės aukštis palyginti su didžiausiu leidžiamu virš jos pėdsako (vieno aukščio prizmę riboja mažiausias leidžiamas aukštis bet kuriame jos kampe);
- **grindų ploto koeficientas** ir **padengimas**: visos parcelyje esančios masės sudėtos.
