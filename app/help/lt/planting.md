---
title: Sodinimo planai ir žiniaraščiai
summary: Pastatykite atskirus augalus, sodinimo lysves, užpildytas pagal augalų atstumą su mišriais augalais procentais, ir gyvatvores; pažymėkite juos; suskaičiuokite augalų žiniaraštyje skaičiuoklei ar TakeoffCraft.
keywords: sodinimo planas, augalų žiniaraštis, sodinimo lysvė, masinis sodinimas, gyvatvorė, medis, krūmas, dengiantysis augalas, atstumas, trikampis atstumas, augalų kiekis, kiekiai, žymos, lajos, augalų simboliai, ifc, takeoff
from: ab49eab5
---

## Augalų įdėjimas

1. Kairėje skiltyje **Augalai** pasirinkite augalą.
2. Spustelėkite {{ui:Augalas}}, tada spustelėkite plane: kiekvienas spustelėjimas įdeda vieną augalą. Norėdami baigti, paspauskite {{key:Esc}}.

Augalo simbolis piešiamas pagal jo plotį užaugus; Daugiau › {{ui:Rodyti sodinimo dydžiu}} piešia kiekvieną augalą dydžiu, kuriuo jis sodinamas. Medžiai stovi ant žemės po savimi: vėliau, kai lyginate sklypą, jie seka jį. Norėdami fiksuoti augalą konkrečiame aukštyje, įveskite jį į laukelį **Aukščio atžyma** Ypatybėse.

## Sodinimo lysvės

1. Pasirinkite pagrindinį augalą, spustelėkite {{ui:Lysvė}} ir spustelėkite lysvės kampus. Paspauskite {{key:Enter}} (arba dar kartą spustelėkite pirmą kampą), kad ją uždarytumėte.
2. Lysvė užpildoma tuo augalu pagal jo atstumą, **trikampiu** išdėstymu (įprastasis: kiekvienas augalas vienodu atstumu nuo šešių kitų), pusę atstumo nuo krašto.
3. Ypatybėse **Pridėti augalą** sumaišo kairėje pasirinktą augalą. Nustatykite kiekvieno augalo **Dalis %**: lysvė paima tiksliai tiek kiekvieno, paskirstydama per visą plotą. **Maišyti iš naujo** perkelia, kur jie yra.

Jei **Atstumas** tuščias, naudojamas pačių augalų atstumas (sveriamas pagal jų dalis); įveskite vieną, kad jis būtų naudojamas visiems augalams. **Išdėstymas** gali būti kvadratinis, o **Eilės kryptis** pasuka eilutes.

## Gyvatvorės

Pasirinkite gyvatvorės augalą, spustelėkite {{ui:Gyvatvorė}}, spustelėkite palei gyvatvorę ir paspauskite {{key:Enter}}. Augalai išdėstomi palei liniją pagal atstumą, centruojami taip, kad abiejuose galuose būtų vienodas tarpas. Gyvatvorė gali būti **dviejų eilių, išdėstytų šachmatiniu būdu**, nustatytu atstumu viena nuo kitos.

## Žymos

Atskiri augalai pažymimi žymos nustatymu (pagal numatymą `{name}`); vieno augalo žymą įveskite Ypatybėse. Lysvės pažymimos kiekvieno augalo kiekiu, gyvatvorės – savo kiekiu. Daugiau › {{ui:Augalų etiketės}} įjungia ir išjungia žymas. Žymų laukai: `{name}`, `{botanical}`, `{size}` (talpa), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Augalų žiniaraštis

Daugiau › {{ui:Augalų žiniaraštis…}} suskaičiuoja kiekvieną augalą pagal rūšį – atskirus augalus, lysves ir gyvatvores kartu – su jo sodinimo dydžiu. Įrašykite kaip **CSV** arba **XLSX**, arba **Siųsti į TakeoffCraft**: kiekių failą, kurį TakeoffCraft atidaro augalams įvertinti (šalia – kietųjų dangų ir laistymo kiekiai).

## IFC

Daugiau › {{ui:Eksportuoti kraštovaizdžio IFC}} įrašo kraštovaizdį kaip IFC failą (IFC 4.3), kurį gali talpinti BIM modelis: kiekvienas augalas – `IfcGeographicElement` tipo VEGETATION, pagal rūšį, su augalo savybėmis (botaninis pavadinimas, dydžiai, atsparumas, vanduo, šviesa); kiekviena lysvė ir gyvatvorė – vienas elementas su savo kiekiais, sklype. BimCraft jį atidaro šalia pastato.
