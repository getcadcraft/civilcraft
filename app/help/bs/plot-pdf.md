---
title: Iscrtavanje plana u PDF
summary: Iscrtajte sve ili trenutni prikaz u vektorski PDF na standardnom listu, u inženjerskoj ili metričkoj razmjeri, u bojama slojeva ili crno.
keywords: iscrtavanje, štampanje, pdf, list, razmjera, veličina papira, list plana, objavljivanje, naslovni blok, strelica sjevera, skala
from: 9af396ca
---

{{ui:PDF}} iscrtava plan u vektorski PDF na jednom listu, s naslovnom trakom, strelicom sjevera i skalom. PDF se pravi u pregledniku i preuzima se; ne ide kroz dijalog za štampanje preglednika.

## Iscrtavanje

1. Postavite plan pod **Prikaz**: prikazanu površ, interval izohipsi i šta je uključeno. Iscrtavanje slijedi ove postavke.
2. Ako želite samo dio lokacije, zumirajte i pomjerite plan na taj dio.
3. Kliknite {{ui:PDF}} u grupi **Izvoz** ili pritisnite {{key:Mod+P}}.
   Otvara se dijalog **Iscrtavanje plana u PDF**.
4. Odaberite **Područje**: {{ui:Everything}} ili {{ui:What is on screen}}.
5. Odaberite **Papir**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 ili A1. Projekt u stopama počinje na Tabloidu, a projekt u metrima na A3. Listovi su uvijek vodoravni.
6. Odaberite **Razmjeru**. Lista označava najveću razmjeru koja stane, uz "(stane)", i nju odabire.
   - Stope: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metri: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Odaberite **Tinta**: {{ui:Layer colors}} ili {{ui:Black}}.
8. Pročitajte red ispod izbora. Daje veličinu područja na papiru i veličinu lista, na primjer "Područje je 297 × 222 mm pri 1" = 40' na listu 432 × 279 mm (vodoravno)."
9. Kliknite {{ui:Download PDF}}.
   Preglednik preuzima `<name>.pdf`. Statusna traka kaže "Iscrtano <name>.pdf pri 1" = 40'."

Ako je područje veće od lista pri odabranoj razmjeri, iscrtavanje se centrira i ivice se odsijeku. Odaberite razmjeru označenu sa "(stane)" ili veći list.

## Šta je na listu

- Plan, centriran u području crtanja, kao prave vektorske linije: izohipse, oznake, osovine sa stacionažama, koridori, platoi i linije iskopa i nasipa, cijevi, tačke.
- Debljine linija po sloju: osovine, platoi i cijevi su deblje; trouglovi i sporedne izohipse su fine.
- Naslovna traka duž dna s **Nazivom** projekta, razmjerom, napomenom o intervalu izohipsi i kojoj površi (postojećoj ili projektovanoj), te datumom i verzijom programa s desne strane.
- Strelica sjevera u gornjem desnom uglu (sjever plana je gore) i skala u naslovnoj traci.
- Slojevi karte prikazani ispod plana (slika, pločice karte ili kartografski servis), kad je označeno **Slojevi karte ispod plana**: iscrtavaju se kao jedna slika cijelog područja crtanja pri 150 tačaka po inču, ispod linija, a atribucija karte ide u naslovnu traku. CivilCraft čeka do 8 sekundi slike karte koje još pristižu; ako neke još nedostaju, statusna traka to kaže.

Tekst koristi ugrađeni font Helvetica iz PDF-a. Znakovi van zapadnoevropskog skupa (Windows-1252) štampaju se kao "?", a poruka o statusu ih broji.

## Šta nije iscrtano

- Pojasi kota.
- Prikaz profila. Iscrtavanje profila još nije dostupno.
- Više od jednog lista (za trasu koristite [listove plana i profila](topic:plan-profile-sheets)), prikazne okvire, prilagođeni naslovni blok ili uspravne listove.

:::note
Dijalog kaže da su strelice nagiba samo za ekran. U ovoj verziji strelice nagiba koje su uključene pod **Prikaz** se iscrtavaju (i izvoze u DXF). Isključite ih prije iscrtavanja ako ih ne želite.
:::

## Štampanje na papir

Otvorite preuzeti PDF u bilo kojem pregledniku PDF-a i štampajte ga na 100% (stvarna veličina) da razmjera ostane tačna. "Uklopi u stranicu" mijenja razmjeru.
