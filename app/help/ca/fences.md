---
title: Tanques
summary: Una tanca al llarg d'una línia, parcel·la o plataforma: pals, travesses, panells o llistons, portes, inclinada o escalonada sobre el terreny, un quadre, símbols del plànol i elements IFC. També disponible per a un assistent.
keywords: tanca, pals, travesses, panells, llistons, porta, inclinada, escalonada, terreny, quadre, ifc, barana, límit
from: c0e7b84a
---

Feu una tanca al llarg d'una línia característica, un traçat, una parcel·la o una plataforma, amb els seus pals i portes col·locats automàticament.

## Fes una tanca

1. Seleccioneu una línia, una parcel·la o una plataforma.
2. Obriu **Superfície, Més, Tanques...**
3. Trieu l'estil (panells, travesses o llistons), inclinada o escalonada, l'alçada, l'espaiat dels pals i l'amplada de la porta, i després **Tanca al llarg de la selecció**, o **Amb una porta** per posar una porta al mig del tram recte més llarg.

Els pals van als extrems, a cada cantonada (un vèrtex que gira 20 graus o més), a les dues vores de cada porta i a trams iguals entre mig, cap més llarg que l'espaiat. Els panells **inclinats** segueixen el terreny entre els seus pals. Els panells **escalonats** es mantenen nivellats i fan un graó als pals; l'espai sota un panell és més ampli al pal de la part baixa, i la finestra avisa quan aquest espai supera el límit, o quan el terreny puja a través d'un panell. Les portes de 6 feet (1.8 m) o més amples tenen dues fulles; el plànol les mostra obertes amb el seu gir.

## Quadre i sortides

Cada tanca mostra la seva longitud, els pals per tipus, els panells, les portes i els graons, amb un quadre **CSV** de pals, panells, travesses, llistons i portes. El plànol té capes de tanca (C-FENC, C-FENC-POST, C-FENC-GATE) per a PDF, DXF i DWG. L'exportació IFC conté els pals (IfcMember, post), els panells (IfcRailing, user defined fence panel), les travesses (IfcMember) i les portes (IfcDoor, gate), un sistema per cada tanca.

## Des d'un assistent

`fence_build` fa una tanca (punts o una línia, parcel·la o plataforma amb nom, portes per PK) i `fence_list` llista les tanques amb el seu quadre.

## Què no està fet

Les mides inicials són opcions habituals, no un codi. Els tipus de la Biblioteca només es porten com a nom. Les portes han d'estar en un sol tram recte. BimCraft encara no té aquesta eina.
