---
title: Ispis tlocrta u PDF
summary: Ispis svega ili trenutnog prikaza u vektorski PDF na standardnom listu u inženjerskom ili metričkom mjerilu, u bojama slojeva ili crno.
keywords: plotanje, ispis, pdf, list, mjerilo, veličina papira, list tlocrta, objava, zaglavlje, strelica sjevera, traka mjerila
from: 9af396ca
---

{{ui:PDF}} plotira tlocrt u vektorski PDF na jednom listu, sa zaglavljem, strelicom sjevera i trakom mjerila. PDF se izrađuje u pregledniku i preuzima; ne prolazi kroz dijaloški okvir ispisa preglednika.

## Plotanje

1. Postavite tlocrt pod **Prikaz**: prikazani teren, interval izohipsa i što je uključeno. Plotanje slijedi te postavke.
2. Ako želite samo dio lokacije, zumirajte i pomaknite prikaz tlocrta na nju.
3. Kliknite {{ui:PDF}} u grupi **Izvoz** ili pritisnite {{key:Mod+P}}.
   Otvara se dijaloški okvir **Ispis tlocrta u PDF**.
4. Odaberite **Područje**: {{ui:Sve}} ili {{ui:Ono što je na zaslonu}}.
5. Odaberite **Papir**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 ili A1. Projekt u stopama počinje na Tabloidu, a projekt u metrima na A3. Listovi su uvijek položeni vodoravno.
6. Odaberite **Mjerilo**. Popis označava najveće mjerilo koje stane oznakom „(uklapa se)“ i odabire ga.
   - Stope: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metri: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Odaberite **Boju ispisa**: {{ui:Boje slojeva}} ili {{ui:Crno}}.
8. Pročitajte redak ispod izbora. On daje veličinu područja na papiru i veličinu lista, na primjer: „Područje je 297 × 222 mm pri 1" = 40' na listu 432 × 279 mm (vodoravno).“
9. Kliknite {{ui:Preuzmi PDF}}.
   Preglednik preuzima `<name>.pdf`. Statusna traka kaže: „Isplotano: <name>.pdf pri 1" = 40'.“

Ako je područje veće od lista u odabranom mjerilu, ispis se centrira i rubovi se odsijecaju. Odaberite mjerilo označeno „(uklapa se)“ ili veći list.

## Što je na listu

- Tlocrt, centriran u području crteža, kao pravi vektori: izohipse, oznake, osi trasa sa stacionažama, koridori, platoi i linije nožice pokosa, cijevi, točke.
- Debljine linija prema sloju: osi trasa, platoi i cijevi deblje; trokuti i sporedne izohipse tanje.
- Zaglavlje uz donji rub s **Nazivom** projekta, mjerilom, napomenom o intervalu izohipsa i o kojem je terenu riječ (postojeći ili planirani), te s datumom i verzijom programa s desne strane.
- Strelica sjevera u gornjem desnom kutu (sjever tlocrta je gore) i traka mjerila u zaglavlju.
- Slojevi karte prikazani ispod tlocrta (slika, pločice karte ili servis karte), kad je označeno **Slojevi karte ispod tlocrta**: crtaju se kao jedna slika cijelog područja crteža pri 150 točaka po inču, ispod linija, a navođenje autora karte ide u zaglavlje. CivilCraft čeka do 8 sekundi na slike karte koje još pristižu; ako neke još nedostaju, statusna traka to navodi.

Tekst koristi ugrađeni font Helvetica iz PDF-a. Znakovi izvan zapadnoeuropskog skupa (Windows-1252) ispisuju se kao „?“, a statusna poruka ih broji.

## Što se ne ispisuje

- Pojasi kota.
- Prikaz profila. Ispis profila još nije dostupan.
- Više od jednog lista (za os trase koristite [listove tlocrta i uzdužnog profila](topic:plan-profile-sheets)), viewporte, prilagođeno zaglavlje ili uspravne listove.

:::note
Dijaloški okvir navodi da su strelice nagiba samo na zaslonu. U ovoj verziji strelice nagiba uključene pod **Prikaz** se ispisuju (i izvoze u DXF). Isključite ih prije ispisa ako ih ne želite.
:::

## Ispis na papir

Otvorite preuzeti PDF u bilo kojem pregledniku PDF-a i ispišite ga pri 100 % (stvarna veličina) kako mjerilo ostane točno. „Prilagodi stranici“ mijenja mjerilo.
