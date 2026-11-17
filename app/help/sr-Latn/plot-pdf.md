---
title: Iscrtavanje plana u PDF
summary: Iscrtavanje svega ili trenutnog prikaza u vektorski PDF na standardnom listu u inženjerskoj ili metričkoj razmeri, u bojama slojeva ili crno.
keywords: iscrtavanje, štampa, pdf, list, razmera, veličina papira, list plana, objavljivanje, naslovni blok, strelica severa, linija razmere
from: 9af396ca
---

{{ui:PDF}} iscrtava plan u vektorski PDF na jednom listu, sa naslovnom trakom, strelicom severa i linijom razmere. PDF se pravi u pregledaču i preuzima se; ne ide kroz dijalog za štampanje pregledača.

## Iscrtavanje

1. Podesite plan pod **Prikaz**: prikazanu površ, interval izohipsi i šta je uključeno. Iscrtavanje prati ova podešavanja.
2. Ako želite samo deo lokacije, zumirajte i pomerajte plan do nje.
3. Kliknite {{ui:PDF}} u grupi **Izvoz** ili pritisnite {{key:Mod+P}}.
   Otvara se dijalog **Iscrtavanje plana u PDF**.
4. Izaberite **Područje**: {{ui:Sve}} ili {{ui:Šta je na ekranu}}.
5. Izaberite **Papir**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 ili A1. Projekat u stopama počinje na Tabloid, projekat u metrima na A3. Listovi su uvek vodoravni.
6. Izaberite **Razmeru**. Lista označava najveću razmeru koja staje oznakom „(staje)“ i bira je.
   - Stope: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metri: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Izaberite **Boju**: {{ui:Boje slojeva}} ili {{ui:Crno}}.
8. Pročitajte red ispod izbora. On daje veličinu područja na papiru i veličinu lista, na primer: "Površina je 297 × 222 mm u razmeri 1" = 40' na listu od 432 × 279 mm (vodoravno)."
9. Kliknite {{ui:Preuzmi PDF}}.
   Pregledač preuzima `<name>.pdf`. Statusna traka kaže "Iscrtano je <name>.pdf u razmeri 1" = 40'."

Ako je područje veće od lista u izabranoj razmeri, plan se centrira i ivice se seku. Izaberite razmeru označenu sa „(staje)“ ili veći list.

## Šta je na listu

- Plan, centriran u području crteža, kao prave vektorske linije: izohipse, oznake, trase sa stacionažom, koridori, platoi i linije preseka sa terenom, cevi, tačke.
- Debljine linija po sloju: trase, platoi i cevi deblje; trouglovi i sporedne izohipse tanje.
- Naslovna traka uz donju ivicu, sa **Nazivom** projekta, razmerom, napomenom o intervalu izohipsi i kojom površi (postojećom ili projektovanom), a datum i verzija programa su desno.
- Strelica severa u gornjem desnom uglu (sever plana je gore) i linija razmere u naslovnoj traci.
- Slojevi karte prikazani ispod plana (slika, pločice karte ili kartografski servis), kada je označeno **Slojevi karte ispod plana**: crtaju se kao jedna slika celog područja crteža na 150 tačaka po inču, ispod linija, a atribucija karte ide u naslovnu traku. CivilCraft čeka do 8 sekundi slike karte koje još stižu; ako neke još nedostaju, statusna traka to kaže.

Tekst koristi ugrađeni Helvetica font PDF-a. Znakovi van zapadnoevropskog skupa (Windows-1252) štampaju se kao "?", a statusna poruka ih broji.

## Šta se ne iscrtava

- Pojasi visinskih kota.
- Prikaz profila. Iscrtavanje profila još nije dostupno.
- Više od jednog lista (za trasu koristite [listove plana i profila](topic:plan-profile-sheets)), prozore pogleda, prilagođeni naslovni blok ili uspravne listove.

:::note
Dijalog kaže da su strelice nagiba samo na ekranu. U ovoj verziji strelice nagiba koje su uključene pod **Prikaz** se iscrtavaju (i izvoze u DXF). Isključite ih pre iscrtavanja ako ih ne želite.
:::

## Štampanje na papiru

Otvorite preuzeti PDF u bilo kom PDF pregledaču i štampajte ga na 100% (stvarna veličina) da razmera ostane tačna. „Prilagodi strani“ menja razmeru.
