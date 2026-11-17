---
title: Oblikovalci terena in žive kote
summary: Vse, kar oblikuje predvideni teren, v enem urejenem seznamu (kasnejši prevlada tam, kjer se prekrivata), izkop in nasip po posameznem oblikovalcu, preverjanje stikov v podoknu Težave ter točkovne kote in puščice naklona, ki berejo teren sproti.
keywords: oblikovalci terena, sklad, vrstni red, predvideni teren, obstoječi teren, prekrivanje, izkop in nasip, stik, podporni zid, rob tlakovanja, kota postelje, podest stopnic, točkovna kota, točkovna višina, puščica naklona, oznaka naklona, padci
from: 3998a5b0
---

Predvideni teren = obstoječi teren + oblikovalci, v vrstnem redu. Obstoječi teren se nikoli ne spremeni.

## Seznam

{{ui:Kote}} › {{ui:Oblikovalci terena…}} prikaže vsak objekt, ki oblikuje teren: ploščadi, nasipe, zatravljene jarke, območja niveliranja, tlakovanje in poti, zasajena območja z dokončano koto ter stopnice in klančine, pri katerih je potrditveno polje **Oblikuje teren** obkljukano (z njihovima spodnjo in zgornjo koto). Kjer se dva prekrivata, velja **kasnejši**. Povlecite vrstico ali uporabite puščici, da spremenite vrstni red; teren se takoj znova izračuna. Vsaka vrstica prikazuje svoj izkop in nasip (kar oblikuje po tistih nad njo), skupna vsota je pod seznamom.

## Preverjanje stikov

Podokno Težave našteje naslednje, z **pojdi na**:

- zid, katerega visoka stran sega nad njegov vrh (zemlja čez zid), ali katerega nizka stran prikazuje svojo temeljno stopo;
- zasajeno območje, katerega dokončana kota je nad robom tlakovanja, ki ga stika, ali več kot običajnih 150 mm pod njim;
- stopnice, katerih spodnji ali zgornji del ne sega do tlakovanja, na katerem pristajajo;
- dva oblikovalca, ki se prekrivata (tam velja kasnejši).

Podporni zid lahko svoj vrh vodi po visoki strani terena: njegova višina se ponovno izračuna vsakič, ko se teren spremeni.

## Podporni zid, ki oblikuje teren

Izberite podporni zid in obkljukajte **Oblikuje teren**. Pas pod zidom (širok toliko, kot je zid debel) se pridruži seznamu kot oblikovalec:

- rob na **visoki strani** se vzdolž zidu drži na terenu, tako da vrh zidu sledi visoki strani (z zaključno kapo na vrhu). Če vpišete kot **Vrh**, bo visoko stran držal na tej koti minus kapa;
- rob na **nizki strani** se drži na koti **Teren, zadržan na nizki strani**, ki jo vpišete, ali, če je prazno, na terenu tam;
- visoka stran je stran, katere teren je višji čez celoten zid, zato se vzdolž zidu nikoli ne zamenja;
- teren onkraj pasu se ne spremeni, obstoječi teren pa se nikoli.

Kot vsak oblikovalec stoji tudi ta v seznamu, in oblikovalec, naveden za njim, prevlada tam, kjer se prekrivata. Zid, katerega zadržana kota na koncu je več kot običajnih 150 mm od obstoječega terena tam, dobi opozorilo v podoknu Težave (z **pojdi na**). Prostostoječi zid ne oblikuje terena. Polje je v datotekah iz prejšnjih izdaj izklopljeno, zato se odprejo tako, kot so bile.

## Točkovne kote in puščice naklona

{{ui:Točkovna kota}} (en klik) in {{ui:Puščica naklona}} (dva klika) beretja teren vsakič, ko ju narišete: premaknite ali ponovno uravnate objekt, oznake sledijo. V **Lastnostih** izberite, ali oznaka bere predvideni ali obstoječi teren; oznake obstoječega terena so prikazane v oklepajih. Puščice kažejo navzdol po pobočju in navajajo `1:20 (5.0 %)`.
