---
title: Crtanje uz hvatanje, odabrani uglovi i pomjeranje, kopiranje, rotiranje
summary: Postavite trase, platoe, parcele i linije obilježja tačno na tačke i uglove koje već imate, upišite ili odaberite istočnu i sjevernu koordinatu ugla, okrenite tangentu prema dvije tačke i pomjerite, kopirajte ili rotirajte objekat za udaljenost ili ugao.
keywords: hvatanje, hvatanja, osnap, hvatanje na tačku, hvatanje na ugao, PI, vrh, ugao, odabir, nišan, istok, sjever, koordinate, upisane koordinate, tangenta, smjer, azimut, pomjeri, kopiraj, rotiraj, transformiši, kopiraj rotirano, dupliciraj, alt, slobodna tačka, crtanje
from: 49864dda
---

Novo u 0.9: kad crtate, kursor se hvata za tačke i uglove koji su već u planu, a ugao platoa, parcele ili linije obilježja može se upisati ili odabrati. Ova tema prolazi kroz tri alata.

## Šta ćete raditi

- Crtati uz hvatanje, tako da nova trasa, plato, parcela ili linija počinje i završava tačno na nečemu što postoji.
- Postaviti istočnu i sjevernu koordinatu ugla tako što ćete je upisati ili odabrati mjesto u planu.
- Okrenuti tangentu trase prema dvije odabrane tačke.
- Pomjeriti, kopirati ili rotirati cijeli objekat.

## Koraci

1. Odaberite alat za crtanje, na primjer {{ui:Trasa}}, {{ui:Plato}}, {{ui:Parcela}} ili {{ui:Linija obilježja}}. Pomjerite pokazivač blizu geodetske tačke, PI tačke trase, platoa, ugla parcele ili mase, vrha linije obilježja ili okna kanalizacije. Pojavljuje se oznaka s natpisom (PI, Ugao, Vrh, Okno ili Tačka i njen broj) i istočna i sjeverna koordinata na koju će pasti. Kliknite da postavite tačku tu.
2. Da postavite tačku slobodno, držite {{key:Alt}} dok klikćete. Hvatanje se isključuje.
3. Odaberite plato, parcelu ili liniju obilježja. U **Svojstvima**, blok {{ui:Uglovi}} navodi svaki ugao s poljem Istok i poljem Sjever. Upišite nove brojeve ili pritisnite dugme nišana pored ugla i kliknite mjesto u planu. Ugao preuzima tu istočnu i sjevernu koordinatu. Pritisnite {{key:Esc}} da otkažete odabir. Nišan radi samo u planu: prvo zatvorite 3D prikaz.
4. Da okrenete tangentu, odaberite trasu. U **Svojstvima**, pod {{ui:Tangenta iz dvije tačke}}, odaberite tangentu, pritisnite {{ui:Prva tačka}} i kliknite u planu, pritisnite {{ui:Druga tačka}} i kliknite ponovo, zatim pritisnite {{ui:Postavi smjer}}. Tangenta se okreće tako da ide od prve tačke prema drugoj i zadržava svoju dužinu.
5. Da pomjerite, kopirate ili rotirate, odaberite trasu, plato, parcelu ili liniju obilježja. U **Svojstvima**, pod {{ui:Pomjeri, kopiraj i rotiraj}}, upišite {{ui:Pomjeri na istok}} i {{ui:Pomjeri na sjever}} (negativni brojevi idu na zapad i jug) i pritisnite {{ui:Premjesti}} ili {{ui:Kopiraj}}. Ili pritisnite {{ui:Udaljenost iz dvije tačke}} i kliknite tačku s koje se pomjera i tačku na koju se pomjera.
6. Da rotirate, upišite ugao u {{ui:Rotiraj suprotno od kazaljke}} (stepeni), zatim pritisnite {{ui:Rotiraj}} ili {{ui:Kopiraj rotirano}}. Okreće se oko sredine svojih uglova, osim ako ne odaberete tačku oko koje se rotira nišanom pored ugla.

## Napomene

- Kopija ostavlja original na mjestu i nakon toga je odabrana.
- Svako pomjeranje, kopiranje, rotiranje, odabrani ugao i okrenuta tangenta je jedan korak poništavanja.
- Hvatanje dopire do 10 piksela ekrana od kursora. Oznaka hvatanja samo nudi mjesto; ništa se ne mijenja dok ne kliknete.
- Isti nišan je na redovima PI tačke trase. Vidi [Trase](topic:alignment), [Parcele](topic:parcels) i [Linije obilježja](topic:feature-lines).
