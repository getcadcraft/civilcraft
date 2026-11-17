---
title: Uvoz geodetskih točk
summary: Odprite datoteko točk CSV ali besedilno, preverite vrstni red stolpcev v pogovornem oknu Uvoz točk, popravite vrstice, ki jih ni mogoče prebrati, in razvrstite točke v skupine.
keywords: uvoz točk, csv, txt, pnezd, penzd, datoteka točk, geodezija, cogo točke, skupine točk, stolpci, severna, vzhodna
from: ad33d88a
---

Datoteka točk je besedilna datoteka z eno točko na vrstico: številka točke, severna, vzhodna, višina in opis v nekem vrstnem redu, ločeni z vejicami, tabulatorji, podpičji ali presledki. CivilCraft jo prebere v brskalniku in takoj iz nje zgradi površje.

## Preden začnete

- Če lahko, poznajte vrstni red stolpcev v datoteki (za računalnik sta PNEZD in PENZD videti enako).
- Poznajte njene enote. CivilCraft jih ne pretvarja: nastavite **Enote** v levem podoknu, da ustrezajo datoteki (glejte [Enote, stacionaže in oblike števil](topic:units-and-stations)).
- Koordinate so lahko velike (severne in vzhodne koordinate državne ravnine v milijonih so v redu).

## Uvoz datoteke

1. Kliknite {{ui:Odpri}} na orodni vrstici ali pritisnite {{key:Mod+O}} in izberite datoteko. Lahko jo tudi povlečete na tloris.
   Pogovorno okno **Uvoz točk** se odpre z imenom datoteke, seznamom **Stolpci**, nastavljenim na {{ui:Zaznaj}}, povzetkom in prvimi šestimi točkami.
2. Preberite povzetek. Pove, koliko točk je bilo prebranih, v kakšnem vrstnem redu stolpcev, kako je bil ta vrstni red ugotovljen in kaj ločuje stolpce. Vrstni red se ugotovi na tri načine:
   - „iz vrstice z glavo“: prva vrstica poimenuje stolpce (Point, Northing, Easting, Elevation, Description ali X, Y, Z …). To je najvarnejše.
   - „kot izbrano“: vrstni red ste izbrali v **Stolpci**.
   - „ugibano iz števila stolpcev in vaše nastavitve **Vrstice točk** (PNEZD) — preverite, ali severna in vzhodna nista zamenjani“: ni bilo uporabne glave. Če vaše datoteke običajno začnejo z vzhodno koordinato, nastavite **Vrstice točk** na P, E, N, Z, D v [nastavitvah CivilCraft](topic:settings).
3. Preverite tabelo predogleda. Njeni stolpci so vedno **Točka**, **Severna**, **Vzhodna**, **Višina**, **Opis**, ne glede na vrstni red v datoteki. Severne in vzhodne koordinate pravega zemljišča so običajno jasno različnih velikosti: če izgledata zamenjani, je bila ugotovitev napačna.
4. Če je vrstni red napačen, izberite pravilnega v **Stolpci** (na primer {{ui:PENZD — točka, vzhodna, severna, višina, opis}}). Povzetek in predogled se takoj posodobita.
5. Pod predogledom poiščite **Vrstice, ki niso prebrane**. Vsaka vrstica navaja številko vrstice v datoteki, razlog in začetek vrstice. Glejte [Vrstice, ki niso prebrane](topic:import-points#rows-that-are-not-read).
6. Kliknite {{ui:Uvozi}}.
   Točke se pojavijo na tlorisu, pogled se približa nanje in površje je zgrajeno. Vrstica stanja pove na primer: „Uvoženo 276 točk iz site.csv; površje: 546 trikotnikov.“

Če projekt še nima imena, dobi ime datoteke.

## Preverite skupine

Vsaka točka pripada skupini, poimenovani po **prvi besedi njenega opisa**, z velikimi črkami: „GRD“, „FL 12“ in „fl“ so skupine GRD, FL in FL. Točke brez opisa gredo v „(brez opisa)“.

1. Poglejte tabelo pod **Točke** v levem podoknu: skupina, število točk in izbira **Površje**.
2. Vsaka skupina se na začetku nastavi na {{ui:Točke}}. Linije toka, robove tlakovanja, vrhove in noge brežin, grebene in podobne kodirane črte spremenite v {{ui:Prelomnica}}. Skupine, ki naj ne oblikujejo terena (kontrolne točke, vrhovi dreves, komunalni drogovi, izmerjeni na vrhu), nastavite na {{ui:Izpuščeno}}.
3. Kliknite točko na tlorisu (z {{ui:Izberi}}), da v desnem podoknu vidite njeno številko, koordinate, višino, opis in skupino.

:::warning
Skupina prelomnice združi **vse** svoje točke v **eno** črto, po vrstnem redu številk točk. To deluje, kadar je bila vsaka kodirana črta izmerjena zaporedno z lastno kodo. Dve ločeni liniji toka, obe kodirani „FL“, postaneta ena črta, ki cikcak med njima. Če so vaše kode skupne, uporabite orodje {{ui:Prelomnica}}, da kliknete točke vsake črte posebej (glejte [Izdelava in dopolnitev površja](topic:build-surface)).
:::

## Vrstice, ki niso prebrane

| Prikazan razlog | Kaj to pomeni | Kaj storiti |
|---|---|---|
| „severna ali vzhodna koordinata ni število“ | Stolpec koordinate vsebuje besedilo | Preverite vrstni red stolpcev ali pa poiščite napačno besedilno vrstico sredi datoteke |
| „višina ni število“ | Stolpec višine vsebuje besedilo | Napačen vrstni red stolpcev ali opis v stolpcu višine |
| „ni številke točke“ | Stolpec točk je prazen | Oštevilčite točko ali izberite vrstni red brez P (NEZD, NEZ …): točke bodo nato oštevilčene 1, 2, 3 … |
| „točka 12 se pojavi dvakrat (prva je ohranjena)“ | Dve vrstici delita isto številko | Preštevilčite eno od njiju v datoteki, če sta obe pravi meritvi |
| „3 stolpci, pričakovanih je 5 (PNEZD)“ | Vrstica je prekratka | Pokvarjena vrstica ali napačen vrstni red stolpcev |

Točka s prazno višino ostane, vendar se ne uporabi v površju. Podatki o **Točkah** pokažejo, koliko točk ima višino.

Vrstice, ki se začnejo z `#`, `;` ali `//`, so komentarji in se preskočijo. Prazne vrstice se preskočijo.

## Zamenjava ali dodajanje točk

Ponovni uvoz **zamenja** vse točke; ne doda jih k obstoječim. Vaše trase, ploščadi, cevi, narisane prelomnice in meja ostanejo. Zgodovina razveljavitev se izbriše, zato najprej shranite projekt, če boste morda potrebovali stare točke nazaj. Za združitev dveh datotek jih pred uvozom povežite v urejevalniku besedila ali preglednici (pazite na ponovljene številke točk).

Točk znotraj CivilCraft še ni mogoče premikati, urejati ali brisati. Popravite jih v datoteki in ponovno uvozite.

## Sorodno

- [Formati datotek s točkami](topic:point-file-formats): vsak vrstni red stolpcev in kako se glave prepoznajo.
- [Izdelava in dopolnitev površja](topic:build-surface).
