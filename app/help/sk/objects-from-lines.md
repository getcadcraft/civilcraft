---
title: Objekty z čiarovej grafiky, zachované prepojené
summary: Vytvorte dláždenie, osadenú plochu, záhon, živý plot, chodník, stenu, obrubník, schody, rampu, plošinu, priekopu alebo charakteristickú čiaru z čiary; sleduje pohyb čiary, kým prepojenie nezrušíte.
keywords: z čiary, čiarová grafika, DWG, DXF, prepojenie, prepojený, sledovať, znova vytvoriť, zrušiť prepojenie, charakteristická čiara, importovaná vrstva, obrys, supercad studio, kreslená čiara
from: eb67a0c6
---

{{ui:From a line}} (Krajina › {{ui:More}}): kliknite na charakteristickú čiaru, alebo na čiaru či obrys importovanej vrstvy DWG/DXF. Uzavretá čiara môže vytvoriť dláždenie, trávnik, osadenú plochu, lúku, pokryvnú vegetáciu, záhon alebo plošinu; otvorená čiara chodník, stenu, obrubník, schody (ich prvý a posledný bod), rampu, živý plot alebo priekopu. Oba druhy môžu vytvoriť **charakteristickú čiaru**, okrem samotnej charakteristickej čiary.

## Charakteristická čiara z čiary

Charakteristická čiara vytvorená z čiary prevezme jej body a zostane uzavretá, ak bola čiara uzavretá. Jej úrovne sa nastavia na jestvujúci terén (0, ak zatiaľ žiadny nie je) a jej použitie je **Vypnuté**: netvaruje žiadny terén, kým nezvolíte použitie a nenastavíte jej úrovne vo Vlastnostiach. Keď sa čiara posunie, charakteristická čiara s rovnakým počtom bodov si zachová každú úroveň, ktorú ste nastavili; keď čiara získa alebo stratí body, úrovne sa znova nastavia na terén. Pozri [Charakteristické čiary](topic:feature-lines).

Nový objekt si zachová **prepojenie** na svoju čiaru. Keď sa čiara posunie (ťaháte jej body, alebo sa výkres posunie či znova načíta), objekt v tom istom kroku späť získa nový tvar a cez úpravy terénu sa navrhovaný terén prispôsobí. Vlastnosti uvádzajú, s čím je objekt prepojený; {{ui:Break link}} ho uvoľní.

Čiary sa najskôr kontrolujú: čiara potrebuje aspoň 2 body (3 pre obrys), najviac 5000, reálne čísla; obrys musí byť uzavretý a nesmie sa pretínať. Čiara, ktorá neprejde kontrolou, sa nepoužije: objekt zostane, ako bol, a panel Problémy vysvetlí dôvod. Ak sa čiara zmaže, objekt zostane a panel Problémy to zaznamená.

## V SuperCad Studio

Otvorte lokalitu a 2D výkres v tom istom projekte. Vyberte jednu čiaru alebo lomenú čiaru vo 2D výkrese, stlačte Ctrl+K a spustite {{ui:Krajinný objekt z vybranej čiary výkresu}}: CivilCraft sa opýta, čo vytvoriť, ako vyššie, a objekt zostane prepojený s touto čiarou výkresu. Po zmene čiar vo výkrese Ctrl+K {{ui:Aktualizovať krajinu z výkresu}} zabezpečí, že objekty ich budú sledovať, s jedným krokom späť pre každú čiaru. Súbor prepojení projektu zaznamenáva, ktorý objekt sleduje ktorú čiaru. Vlastná nápoveda SuperCad Studio obsahuje tému Krajina.
