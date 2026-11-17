---
title: Plànols de plantació i quadres
summary: Col·loqueu plantes soles, bancals de plantació plens a la separació de les plantes amb mescles per percentatge, i setos; etiqueteu-los; compteu-los en un quadre de plantes per a un full de càlcul o TakeoffCraft.
keywords: plànol de plantació, quadre de plantes, bancal de plantació, plantació massiva, seto, arbre, arbust, cobridora, separació, separació triangular, recompte de plantes, amidaments, etiquetes, capçada, símbols de planta, ifc, amidament
from: ab49eab5
---

## Col·locar plantes

1. Trieu una planta a **Plantes** a l'esquerra.
2. Feu clic a {{ui:Planta}}, i després feu clic al plànol: cada clic col·loca una planta. Premeu {{key:Esc}} per aturar-vos.

El símbol d'una planta es dibuixa amb la seva amplada a la maduresa; Més › {{ui:Mostra a la mida de plantació}} dibuixa cada planta a la mida amb què es planta. Els arbres se situen sobre el terra que hi ha sota ells: quan modeleu el terreny més tard, en segueixen el nivell. Per fixar una planta a una cota, escriviu-la a **Cota** a Propietats.

## Bancals de plantació

1. Trieu la planta principal, feu clic a {{ui:Bancal}} i feu clic als cantons del bancal. Premeu {{key:Enter}} (o feu clic de nou al primer cantó) per tancar-lo.
2. El bancal s'omple amb aquella planta a la seva separació, en un patró **triangular** (el més habitual: cada planta a la mateixa distància de sis altres), a mitja separació de la vora.
3. A Propietats, **Afegeix una planta** barreja la planta triada a l'esquerra. Definiu el **Percentatge** de cada planta: el bancal n'ocupa exactament aquest tant de cada una, repartit per tot. **Torna a barrejar** canvia on van.

**Separació** buida usa la separació pròpia de les plantes (ponderada pels seus percentatges); escriviu-ne una per usar-la per a totes les plantes. **Patró** pot ser quadrat, i **Orientació de les files** gira les files.

## Setos

Trieu la planta del seto, feu clic a {{ui:Seto}}, feu clic al llarg del seto i premeu {{key:Enter}}. Les plantes van al llarg de la línia a la seva separació, centrades perquè els dos extrems tinguin el mateix marge. Un seto pot ser de **dues files al tresbolillo**, a una distància fixada.

## Etiquetes

Les plantes soles s'etiqueten amb la configuració d'etiqueta (`{name}` per defecte); escriviu-ne una de pròpia per a una planta a Propietats. Els bancals s'etiqueten amb el recompte de cada planta, els setos amb el seu. Més › {{ui:Etiquetes de plantes}} activa i desactiva les etiquetes. Camps de l'etiqueta: `{name}`, `{botanical}`, `{size}` (el contenidor), `{qty}`, `{height}`, `{spread}`, `{container}`.

## El quadre de plantes

Més › {{ui:Quadre de plantes…}} compta cada planta per espècie, des de les plantes soles, els bancals i els setos junts, amb la seva mida de plantació. Deseu-lo com a **CSV** o **XLSX**, o **Envia a TakeoffCraft**: un fitxer d'amidaments que TakeoffCraft obre per pressupostar les plantes (amb les quantitats de paviment i reg al costat).

## IFC

Més › {{ui:Exporta IFC de paisatgisme}} desa el paisatgisme com a fitxer IFC (IFC 4.3) que un model BIM pot contenir: cada planta és un `IfcGeographicElement` de tipus VEGETATION, tipificat per la seva espècie amb les propietats de la planta (nom botànic, mides, rusticitat, aigua, llum), i cada bancal i seto és un element amb els seus recomptes, al terreny. BimCraft l'obre al costat de l'edifici.
