---
title: De l'adreça a l'emplaçament
summary: Convertir una adreça en el que un emplaçament ha de saber: la parcel·la, els edificis del voltant, la zonificació, el sòl i la zona inundable, a partir de dades obertes que demaneu amb un botó o que porteu com a fitxers, i enviar-les a BimCraft com a suggeriments.
keywords: adreça, geocodificació, emplaçament, parcel·la, edificis, zonificació, sòl, inundació, dades obertes, openstreetmap, fema, ssurgo, usgs, context, ccsite, bimcraft
from: 125d848a
---

## Què fa

Superfície › Més › De l'adreça a l'emplaçament respon, per a un punt: a quina parcel·la és, els edificis del voltant, la zonificació, el sòl i la zona inundable. Les dades són obertes: els fitxers que afegiu (GeoJSON, shapefile, KML, GeoPackage) i, quan activeu els complements, botons que demanen un servei obert cadascun.

## Com s'utilitza

1. Escriviu una adreça i premeu el botó de cerca d'adreces (el complement "Cerca d'adreça"), o escriviu la latitud i la longitud.
2. Afegiu capes: fitxers amb "Afegeix fitxers", o els altres botons de font (zona inundable, edificis, sòl, alçada del terreny, parcel·les del comtat). Un servei només es consulta quan premeu el seu botó; no es descarrega res en iniciar.
3. Premeu el botó d'execució per obtenir la resposta en paraules, amb un CSV.
4. "Desa l'emplaçament com a fitxer" o "Envia a BimCraft com a suggeriments" donen els contorns a BimCraft o a ModelCraft; aquests els llisten i només n'afegeixen els que marqueu.

## Què cal saber

- La cerca d'adreces passa per getcadcraft.com, que consulta Nominatim d'OpenStreetMap per vosaltres (com a màxim una petició per segon; les respostes es conserven 90 dies perquè una mateixa adreça no es demani dues vegades; només es guarda un resum (hash) de l'adreça, mai qui l'ha demanat). Els altres botons van directament del vostre navegador al seu servei.
- Cada font té la seva pròpia llicència (OpenStreetMap és ODbL: mantingueu la línia de crèdit).
- Les capes són tan bones com les dades obertes del vostre territori. Verifiqueu el que és important amb un aixecament topogràfic.
