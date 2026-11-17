---
title: Načrti sajenja in razpredelnice
summary: Postavitev posameznih rastlin, gredic, napolnjenih z razmikom rastlin in mešanico po odstotkih, ter živih mej; označite jih in prešteite v razpredelnici rastlin za preglednico ali TakeoffCraft.
keywords: načrt sajenja, razpredelnica rastlin, gredica, skupinska sadnja, živa meja, drevo, grm, pokrovnica, razmik, trikotni razmik, število rastlin, količine, oznake, krošnja, simboli rastlin, ifc, predizmere, takeoff
from: ab49eab5
---

## Postavitev rastlin

1. Izberite rastlino v **Rastline** na levi.
2. Kliknite {{ui:Plant}}, nato kliknite na tloris: vsak klik postavi eno rastlino. Pritisnite {{key:Esc}}, da ustavite.

Simbol rastline je narisan v širini pri zrelosti; Več › {{ui:Show at planting size}} nariše vsako rastlino v velikosti, v kateri se posadi. Drevesa se naslanjajo na teren pod njimi: ko kasneje oblikujete teren, sledijo njemu. Če želite rastlino postaviti na določeno višino, jo vnesite v **Višina** v Lastnostih.

## Gredice za sajenje

1. Izberite glavno rastlino, kliknite {{ui:Bed}} in kliknite vogale gredice. Pritisnite {{key:Enter}} (ali kliknite prvi vogal znova), da jo zaprete.
2. Gredica se napolni s to rastlino pri njenem razmiku, v **trikotnem** vzorcu (običajnem: vsaka rastlina je enako oddaljena od šestih drugih), pol razmika od roba.
3. V Lastnostih **Dodaj rastlino** zmeša rastlino, izbrano na levi. Nastavite **Delež %** vsake rastline: gredica zavzame natanko toliko vsake, razporejene po njej. **Znova zmešaj** premeša, kam gredo.

**Razmik** prazen uporabi lastne razmike rastlin (uteženo z njihovimi deleži); vnesite enega, da ga uporabite za vse rastline. **Vzorec** je lahko kvadraten, **Vrstice pod kotom** pa zasuka vrstice.

## Žive meje

Izberite rastlino za živo mejo, kliknite {{ui:Hedge}}, kliknite vzdolž meje in pritisnite {{key:Enter}}. Rastline se postavijo vzdolž črte pri svojem razmiku, centrirane tako, da imata oba konca enak rob. Živa meja je lahko **dvovrstna, zamaknjena**, na določeni medsebojni razdalji.

## Oznake

Posamezne rastline so označene z nastavitvijo oznak (privzeto `{name}`); za eno rastlino vnesite lastno oznako v Lastnostih. Gredice so označene s številom rastlin vsake, žive meje z njihovim. Več › {{ui:Plant labels}} vklopi in izklopi oznake. Polja oznak: `{name}`, `{botanical}`, `{size}` (posoda), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Razpredelnica rastlin

Več › {{ui:Plant schedule…}} šteje vsako rastlino po vrsti, iz posameznih rastlin, gredic in živih mej skupaj, z njeno velikostjo sajenja. Shranite jo kot **CSV** ali **XLSX**, ali **Pošlji v TakeoffCraft**: datoteka količin, ki jo TakeoffCraft odpre, da oceni ceno rastlin (ob trdnih podlagah in namakanju).

## IFC

Več › {{ui:Export landscape IFC}} shrani krajino kot datoteko IFC (IFC 4.3), ki jo lahko vsebuje BIM model: vsaka rastlina je `IfcGeographicElement` tipa VEGETATION, tipizirana po vrsti, z lastnostmi rastline (botanično ime, velikosti, odpornost, voda, svetloba), vsaka gredica in živa meja pa je en element s svojimi števili, na mestu. BimCraft jo odpre ob stavbi.
