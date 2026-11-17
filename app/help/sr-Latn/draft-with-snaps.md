---
title: Crtanje sa hvatanjem, izabrani uglovi i pomeranje, kopiranje i rotiranje
summary: Postavi trase, platoe, parcele i linije obeležja tačno na tačke i uglove koje već imaš, ukucaj ili izaberi istočnu i severnu koordinatu ugla, okreni tangentu ka dve tačke i pomeri, kopiraj ili rotiraj objekat za rastojanje ili ugao.
keywords: hvatanje, hvatanja, osnap, hvatanje za tačku, hvatanje za ugao, PI, teme, ugao, izbor, nišan, istok, sever, koordinate, ukucane koordinate, tangenta, pravac, azimut, pomeri, kopiraj, rotiraj, transformacija, kopiraj rotirano, dupliraj, alt, slobodna tačka, crtanje
from: 49864dda
---

Novo u 0.9: kad crtaš, kursor se postavlja na tačke i uglove koji su već u planu, a ugao plata, parcele ili linije obeležja može da se ukuca ili izabere. Ova tema prolazi kroz tri alata.

## Šta ćeš raditi

- Crtaj sa hvatanjem, tako da nova trasa, plato, parcela ili linija počinje i završava tačno na nečemu što već postoji.
- Postavi istočnu i severnu koordinatu ugla tako što ćeš je ukucati ili izabrati mesto u planu.
- Okreni tangentu trase ka dve izabrane tačke.
- Pomeri, kopiraj ili rotiraj ceo objekat.

## Koraci

1. Izaberi alat za crtanje, na primer {{ui:Trasa}}, {{ui:Plato}}, {{ui:Parcela}} ili {{ui:Linija obeležja}}. Približi pokazivač geodetskoj tački, PI tački trase, uglu plata, parcele ili mase, temenu linije obeležja ili objektu kišne kanalizacije. Pojavljuje se oznaka sa nazivom (PI, Ugao, Teme, Objekat ili Tačka i njen broj) i istočna i severna koordinata na koju će da padne. Klikni da postaviš tačku tamo.
2. Da postaviš tačku slobodno, drži {{key:Alt}} dok klikneš. Hvatanje se isključuje.
3. Izaberi plato, parcelu ili liniju obeležja. U **Svojstvima** blok {{ui:Uglovi}} navodi svaki ugao sa poljem za istok i poljem za sever. Ukucaj nove brojeve ili pritisni dugme nišana pored ugla i klikni mesto u planu. Ugao preuzima tu istočnu i severnu koordinatu. Pritisni {{key:Esc}} da otkažeš izbor. Nišan radi samo u planu: prvo zatvori 3D prikaz.
4. Da okreneš tangentu, izaberi trasu. U **Svojstvima**, pod {{ui:Tangenta iz dve tačke}}, izaberi tangentu, pritisni {{ui:Prva tačka}} i klikni u planu, pritisni {{ui:Druga tačka}} i klikni opet, pa pritisni {{ui:Postavi pravac}}. Tangenta se okreće tako da ide od prve tačke ka drugoj i zadržava svoju dužinu.
5. Da pomeriš, kopiraš ili rotiraš, izaberi trasu, plato, parcelu ili liniju obeležja. U **Svojstvima**, pod {{ui:Pomeri, kopiraj i rotiraj}}, ukucaj {{ui:Pomeri na istok}} i {{ui:Pomeri na sever}} (negativni brojevi idu na zapad i jug) i pritisni {{ui:Premesti}} ili {{ui:Kopiraj}}. Ili pritisni {{ui:Rastojanje iz dve tačke}} i klikni tačku s koje se pomera i tačku na koju se pomera.
6. Da rotiraš, ukucaj ugao u {{ui:Rotiraj suprotno od kazaljke na satu}} (stepeni), pa pritisni {{ui:Rotiraj}} ili {{ui:Kopiraj rotirano}}. Rotira se oko sredine svojih uglova, osim ako ne izabereš tačku oko koje rotira nišanom pored ugla.

## Napomene

- Kopija ostavlja original tamo gde jeste, a posle se bira.
- Svako pomeranje, kopiranje, rotiranje, izabrani ugao i okrenuta tangenta jesu jedan korak za opozivanje.
- Hvatanje dopire 10 piksela na ekranu od kursora. Oznaka hvatanja samo nudi mesto; ništa se ne menja dok ne klikneš.
- Isti nišan je i u redovima PI tačaka trase. Videti [Trase](topic:alignment), [Parcele](topic:parcels) i [Linije obeležja](topic:feature-lines).
