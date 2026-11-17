---
title: Žogi
summary: Žogs gar līniju, zemesgabalu vai platformu: stabi, sijas, paneļi vai latiņas, vārti, sekojoši reljefam vai pakāpjveidīgi, specifikācija, plāna simboli un IFC elementi. Pieejams arī palīgam.
keywords: žogs, stabi, sijas, paneļi, latiņas, vārti, sekots reljefam, pakāpjveidīgi, reljefs, specifikācija, ifc, margas, robeža
from: c0e7b84a
---

Izveidojiet žogu gar raksturīgu līniju, trasi, zemesgabalu vai platformu, un tā stabi un vārti tiks novietoti automātiski.

## Žoga izveide

1. Atlasiet līniju, zemesgabalu vai platformu.
2. Atveriet **Virsma, Vairāk, Žogi...**
3. Izvēlieties stilu (paneļi, sijas vai latiņas), sekot reljefam vai pakāpjveidīgi, augstumu, stabu soli un vārtu platumu, pēc tam **Žogs gar atlasi** vai **Ar vārtiem**, lai novietotu vārtus vislielākā taisnā posma vidū.

Stabi tiek novietoti galos, katrā stūrī (virsotnē, kur līnija pagriežas par 20 grādiem vai vairāk), abās katru vārtu malās un vienādos laukos starp tiem; neviens lauks nav garāks par soli. **Sekojošie** paneļi seko zemei starp saviem stabiem. **Pakāpjveidīgie** paneļi paliek horizontāli un pakāpjas pie stabiem; sprauga zem paneļa ir vislielākā pie tā stabiem nogāzes lejas pusē, un logs brīdina, ja šī sprauga pārsniedz robežu vai ja zeme paceļas caur paneli. Vārti, kas ir 6 pēdas (1.8 m) plati vai platāki, saņem divus vērtņus; plānā vērtņi ir attēloti atvērti ar to atvēršanas virzienu.

## Specifikācija un izvades

Katram žogam tiek rādīts tā garums, stabi pēc veida, paneļi, vārti un pakāpieni, kā arī **CSV** specifikācija ar stabiem, paneļiem, sijām, latiņām un vārtiem. Plānā ir žoga slāņi (C-FENC, C-FENC-POST, C-FENC-GATE) PDF, DXF un DWG formātiem. IFC eksportā ir stabi (IfcMember, post), paneļi (IfcRailing, user defined fence panel), sijas (IfcMember) un vārti (IfcDoor, gate), viena sistēma katram žogam.

## No palīga

`fence_build` izveido žogu (punktus vai nosauktu līniju, zemesgabalu vai platformu, vārtus pēc stacijas), un `fence_list` uzskaita žogus ar to specifikāciju.

## Kas nav izdarīts

Sākotnējie izmēri ir parastas izvēles, nevis normatīvs. Tipi no Bibliotēkas tiek pārnesti tikai kā nosaukums. Vārtiem jāatrodas vienā taisnā posmā. BimCraft šim rīkam vēl nav.
