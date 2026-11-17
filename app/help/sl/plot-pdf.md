---
title: Izris tlorisa v PDF
summary: Izris celotnega tlorisa ali trenutnega pogleda v vektorski PDF na standardnem listu v inženirskem ali metričnem merilu, v barvah slojev ali v črni.
keywords: izris, tiskanje, pdf, list, merilo, velikost papirja, list tlorisa, objava, glava risbe, puščica severa, merilna lestvica
from: 9af396ca
---

{{ui:PDF}} izriše tloris v vektorski PDF na en list, z glavo risbe, puščico severa in merilno lestvico. PDF se ustvari v brskalniku in prenese; ne gre skozi pogovorno okno tiskanja brskalnika.

## Izris

1. Nastavite tloris pod **Prikaz**: prikazano površje, interval plastnic in katere stvari so vklopljene. Izris sledi tem nastavitvam.
2. Če želite samo del mesta, povečajte in pomaknite tloris nanj.
3. Kliknite {{ui:PDF}} v skupini **Izvoz** ali pritisnite {{key:Mod+P}}.
   Odpre se pogovorno okno **Izris tlorisa v PDF**.
4. Izberite **Območje**: {{ui:Everything}} ali {{ui:What is on screen}}.
5. Izberite **Papir**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 ali A1. Projekt v čevljih se začne na Tabloid, projekt v metrih na A3. Listi so vedno v ležečem formatu.
6. Izberite **Merilo**. Seznam z „(ustreza)“ označi največje merilo, ki ustreza, in ga izbere.
   - Čevlji: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metri: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Izberite **Barve tiska**: {{ui:Layer colors}} ali {{ui:Black}}.
8. Preberite vrstico pod izbiro. Ta navede velikost območja na papirju in velikost lista, na primer „Območje je 297 × 222 mm pri 1" = 40' na listu 432 × 279 mm (ležeče).“
9. Kliknite {{ui:Download PDF}}.
   Brskalnik prenese `<name>.pdf`. Statusna vrstica pravi „Izrisano: <name>.pdf pri 1" = 40'.“

Če je območje pri izbranem merilu večje od lista, je izris centriran in robovi so odrezani. Izberite merilo, označeno z „(ustreza)“, ali večji list.

## Kaj je na listu

- Tloris, centriran v območju risbe, kot pravi vektorji: plastnice, oznake, trase s stacionažo, koridorji, ploščadi in črte preseka s terenom, cevi, točke.
- Debeline črt po slojih: trase, ploščadi in cevi debelejše; trikotniki in manjše plastnice tanjše.
- Glava risbe ob spodnjem robu z imenom projekta **Ime**, merilom, opombo o intervalu plastnic in površju (obstoječem ali urejenem), na desni datum in različico.
- Puščica severa v zgornjem desnem kotu (sever tlorisa je navzgor) in merilna lestvica v glavi risbe.
- Kartni sloji pod tlorisom (slika, kartne ploščice ali kartna storitev), če je označeno **Kartni sloji pod tlorisom**: narisani so kot ena slika celotnega območja risbe pri 150 dpi, pod črtno risbo, avtorska navedba karte pa gre v glavo risbe. CivilCraft čaka do 8 sekund na kartne slike, ki še prihajajo; če manjkajo, statusna vrstica to pove.

Besedilo uporablja vgrajeno pisavo PDF Helvetica. Znaki zunaj zahodnoevropskega nabora (Windows-1252) se natisnejo kot „?“, sporočilo o stanju pa jih prešteje.

## Kaj ni izrisano

- Višinski pasovi.
- Pogled profila. Izris profilov še ni na voljo.
- Več kot en list (za trase uporabite [liste tlorisa in vzdolžnega profila](topic:plan-profile-sheets)), pogledna okna, lastno glavo risbe ali pokončne liste.

:::note
Pogovorno okno pove, da so puščice naklona samo na zaslonu. V tej različici se izrišejo puščice naklona, ki so vklopljene pod **Prikaz** (in izvozijo v DXF). Pred izrisom jih izklopite, če jih ne želite.
:::

## Tiskanje na papir

Odprite preneseni PDF v poljubnem bralniku PDF in ga natisnite pri 100 % (dejanska velikost), da merilo ostane pravilno. „Prilagodi strani“ spremeni merilo.
