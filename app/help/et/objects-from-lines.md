---
title: Objektid joontest, jäävad seotuks
summary: Tee joonest kivisillutis, istutusala, peenar, hekk, rada, sein, äärekivi, astmed, kalle, platvorm, kraav või tunnusjoon; see järgib joont, kuni katkestad seose.
keywords: joonest, joonestik, DWG, DXF, seos, seotud, järgib, uuesti genereeri, katkesta seos, tunnusjoon, tunnusjoon joonestikust, imporditud kiht, kontuur, supercad studio, joonistusjoon
from: eb67a0c6
---

{{ui:From a line}} (Maastik › {{ui:More}}): klõpsa tunnusjoonel või imporditud DWG/DXF kihi joonel või kontuuril. Suletud joon võib teha kivisillutise, muru, istutatud peenra, niidu, katteistanda, peenra või platvormi; avatud joon raja, seina, äärekivi, astmed (esimene ja viimane punkt), kalde, hekki või kraavi. Kumbki liik võib teha **tunnusjoone**, välja arvatud tunnusjoon ise.

## Tunnusjoon joonest

Joonest tehtud tunnusjoon võtab oma punktid, suletud, kui joon oli suletud. Selle kõrgused paigutatakse olemasolevale maapinnale (kui seda veel pole, siis 0) ja selle kasutus on **Off**: see ei kuju maad enne, kui valid kasutuse ja määrad kõrgused selle Omadustes. Kui joon liigub, säilitab sama arvu punktidega tunnusjoon iga kõrguse, mille sa määrasid; kui joonele tuleb punkte juurde või kaob neid, paigutatakse kõrgused maapinnale uuesti. Vaata [Tunnusjooned](topic:feature-lines).

Uus objekt säilitab **seose** oma joonega. Kui joon liigub (lohistad selle punkte või joonistust teisaldatakse või loetakse uuesti), võtab objekt uue kuju samas tagasivõtmise sammus ning läbi maapinna muutjate järgib kavandatud maapind. Omadused ütlevad, millega see on seotud; {{ui:Break link}} muudab selle vabaks.

Jooned kontrollitakse esimesena: joon peab olema vähemalt 2 punktiga (kontuur 3), kõige rohkem 5000, reaalarvud; kontuur peab olema suletud ega tohi iseend ristata. Joon, mis ei läbi kontrolli, ei kasutata: objekt jääb endiseks ja Probleemide paneel ütleb, miks. Kui joon kustutatakse, jääb objekt alles ja Probleemide paneel märgib seda.

## SuperCad Studios

Ava ala ja 2D-joonistus samas projektis. Vali üks joon või polüjoon 2D-joonistusel, vajuta Ctrl+K ja käivita {{ui:Landscape object from the picked drawing line}}: CivilCraft küsib, mida teha, nagu eespool, ja objekt jääb seotuks selle joonistuse joonega. Pärast joonte muutmist joonistusel teeb Ctrl+K {{ui:Update the landscape from the drawing}} objektid järgijaks, üks tagasivõtmise samm iga joone kohta. Projekti seoste fail salvestab, milline objekt millist joont järgib. SuperCad Studio enda abis on Maastiku teema.
