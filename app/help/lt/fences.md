---
title: Tvoros
summary: Tvora palei liniją, sklypą ar aikštelę: stulpai, skersiniai, sekcijos arba lentjuostės, vartai, įstrižai arba laiptuotai pagal žemę, žiniaraštis, plano simboliai ir IFC elementai. Pasiekiama ir per asistentą.
keywords: tvora, stulpai, skersiniai, sekcijos, lentjuostės, vartai, įstrižai, laiptuotai, reljefas, žiniaraštis, ifc, turėklai, riba
from: c0e7b84a
---

Sukurkite tvorą palei elemento liniją, trasą, sklypą ar aikštelę, o jos stulpai ir vartai bus išdėstyti automatiškai.

## Sukurti tvorą

1. Pasirinkite liniją, sklypą arba aikštelę.
2. Atidarykite **Paviršius, Daugiau, Tvoros...**
3. Pasirinkite stilių (sekcijos, skersiniai arba lentjuostės), įstrižą arba laiptuotą išdėstymą, aukštį, stulpų žingsnį ir vartų plotį, tada spustelėkite **Tvora palei pasirinkimą** arba **Su vartais**, kad vartai būtų įdėti ilgiausios tiesios atkarpos viduryje.

Stulpai dedami galuose, kiekviename kampe (viršūnėje, kur linija pasisuka 20 laipsnių ar daugiau), abiejose kiekvienų vartų pusėse ir lygiais tarpais tarp jų, nė vienas ne ilgesnis už žingsnį. **Įstrižos** sekcijos seka žemės paviršių tarp savo stulpų. **Laiptuotos** sekcijos lieka lygios ir laiptuojasi prie stulpų; tarpas po sekcija yra plačiausias prie jos žemyn nuožulnaus stulpo, o langas įspėja, kai tarpas viršija ribą arba kai žemė kyla per sekciją. Vartai, kurių plotis 6 feet (1.8 m) ar daugiau, turi dvi vartų dalis; plane vartai rodomi atidaryti su jų sukimosi kryptimi.

## Žiniaraštis ir išvestys

Kiekviena tvora rodo savo ilgį, stulpus pagal tipą, sekcijas, vartus ir laiptus, o **CSV** žiniaraštis pateikia stulpų, sekcijų, skersinių, lentjuosčių ir vartų sąrašą. Plane yra tvorų sluoksniai (C-FENC, C-FENC-POST, C-FENC-GATE), skirti PDF, DXF ir DWG. IFC eksportas apima stulpus (IfcMember, post), sekcijas (IfcRailing, user defined fence panel), skersinius (IfcMember) ir vartus (IfcDoor, gate); kiekviena tvora – viena sistema.

## Iš asistento

`fence_build` sukuria tvorą (taškais arba pavadinta linija, sklypu ar aikštele, vartai pagal stotį), o `fence_list` išvardija tvoras su jų žiniaraščiais.

## Ko dar nėra

Pradiniai dydžiai yra įprasti pasirinkimai, o ne norma. Tipai iš Bibliotekos perduodami tik pavadinimu. Vartai turi būti vienoje tiesioje atkarpoje. BimCraft dar neturi šios priemonės.
