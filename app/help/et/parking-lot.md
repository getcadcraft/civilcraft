---
title: Parkla paigutus
summary: Paiguta parkimiskohad, sõidurajad, invaparkimiskohad, kaubikukohad ja saared kontuuri sisse, planeeri parkla langused sademeveekaevudeni olemasoleva maapinna suhtes ning seejärel sillutu ja istuta. Saadaval ka assistendile.
keywords: parkla, parkimine, parkimiskoht, sõidutee, invakoht, ada, kaubik, saar, sademeveekaev, langus, planeerimine, kaevamine, täitmine, sillutis, sillutuskivid, istutus, puud, maastik, punktipilv, mcp, assistent
from: 06c14da9
---

Sobita parkla kinnistusse, alusesse või suletud joonde ning saa loendus, planeerimine ja sillutus ühe sammuga.

## Paigutamine

1. Vali plaanil kinnistu, alus või suletud joon.
2. Ava **Pind, Veel, Parkla...**
3. Vali reeglid, parkimiskoha nurk (90, 75, 60, 45, 30 kraadi või paralleelne) ning ühesuunalised või kahesuunalised sõidurajad. Parkimiskohtade, sõiduteede ja saarte mõõdud algavad tabelist ning iga mõõdu võib üle kirjutada.
4. Vali **Paiguta**.

Read jooksevad mööda kontuuri serva, mis annab kõige rohkem kohti (või nurga, mille sisestad). Kohta loetakse ainult siis, kui see jääb täielikult kontuuri sisse. Kui ruumi jääb ühele reale ja sõidurajale, lisatakse üherealine riba. Aknas on loetletud ruumid, invaparkimine ja kaubikukohad, saared, sademeveekaevud ning pindala ruumi kohta; plaan näitab parkimiskohti, invakohti koos nende šrafeeritud juurdepääsurajadega, saari, sõidurajade keskjooni ja sademeveekaevusid omaette kihtidel (C-PARK-...), et need jõuaksid PDF-i, DXF-i ja DWG-sse.

## Invaparkimiskohad

USA reeglite korral järgib arv 2010. aasta ADA standardite tabelit 208.2 pakutud kohtade jaoks (üks kuuest, ülespoole ümardatud, on kaubikukoht), paigutatud kontuuri esimese nurga (sissepääsu) lähedale, igaüks koos juurdepääsurajaga; kaks jagavad ühte. Parkimiskoht, mis on kitsam kui invalaius, või kalle üle 1:48 invakohtadel kuvatakse probleemina. **Need numbrid on standardist mälu järgi sisestatud ega ole trükitud standardiga kontrollitud.** Tüüpilised parkimiskoha ja sõidurea mõõdud pärinevad parkla projekteerimise juhenditest ning neidki pole kontrollitud. Kontrolli mõlemat ja oma kohalikke eeskirju enne, kui sa neile toetud. Vali **Kohandatud**, et sisestada oma invakohtade arv.

## Langused sademeveekaevudesse, lõige ja täide

Kui sa seda ei lülita välja, muutub parkla planeerimisalaks Maastiku tööruumis. Sademeveekaevud asetatakse sõidurajade keskjoontele umbes iga 100 feet (30 m) järel; pind tõuseb igast kaevust sinu antud langusega (alguses 1,5 protsenti), nii et iga punkt langeb oma lähimasse kaevu. Tase valitakse nii, et parkla lõige ja täide tasakaalustuvad olemasoleval maapinnal. Olemasolev maapind on projekti olemasolev pind, mis võib tulla mõõdistuspunktidest, LandXML-ist, lidari- või skaneerimispunktipilvest, mis on muudetud pinnaks, või kõverjoontest. Aknas on lõike ja täite hinnang; projekti enda mahud näitavad hiljem täpse arvu. Planeerimisala hoiab oma serva olemasoleval maapinnal, seega kui uus pind serval maapinnast erineb, tekib aste ning aken ütleb, kui suur see on.

## Sillutus ja istutus

Kogu kontuur saab kivisillutise (tellismuster, mida saab muuta jaotises Maastik, Kõvapinnad) ning iga saar saab põõsaistutuse ja, kui see on piisavalt lai, puu, mis võetakse taimenimekirjast. Pärast seda on kõik tavaline maastiku objekt: muuda seda või vali **Paiguta uuesti**, et asendada see, mille parkla tegi. Parkla eemaldamine eemaldab selle, mille ta tegi.

## Assistendilt

Sama parkla saab paluda MCP kaudu: `parking_layout` teeb eelvaate, `parking_build` kirjutab ja `parking_remove` eemaldab parkla. Küsi kinnistu nime järgi või saada kontuur.

## Mida pole tehtud

Kas sõidurajad jõuavad tänavani, ei kontrollita. Sillutis katab kogu kontuuri, seega sisaldab selle pindala saari. Teegi sillutusmaterjale ja teegi tüüpi parkimiskohti pole loodud; sillutusmuster on Kõvapinna oma. Teiste riikide eeskirju pole loodud.
