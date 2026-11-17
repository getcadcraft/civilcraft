---
title: Crtanje katastarskih čestica i pisanje njihovih pravnih opisa
summary: Nacrtajte česticu po njezinim kutovima ili unesite navode iz isprave ili geodetskog plana, provjerite koliko se navodi zatvaraju, označite smjerne kutove i duljine na tlocrtu, pretvorite svaku dionicu u krivulju i kopirajte nacrt pravnog opisa.
keywords: čestice, parcele, katastarske čestice, granice vlasništva, isprava, geodetski plan, mjere i međe, smjerni kut, duljina, zatvaranje, pogreška zatvaranja, preciznost, pravni opis, početna točka, krivulja, radijus, površina, jutra
from: 6793d6ce
---

Čestice se nalaze na tlocrtu sa smjernim kutom i duljinom uz svaku ravnu dionicu (krivulja pokazuje svoj radijus, duljinu i središnji kut), a njihov naziv i površina nalaze se u sredini. Ulaze u PDF ispis te DWG i DXF izvoze, na slojevima `V-PROP` (linije) i `V-PROP-TEXT` (oznake). Sve je pod **Čestice** na desnoj ploči kada ništa nije odabrano.

## Nacrtajte česticu

1. Kliknite **Nacrtaj česticu**.
2. Kliknite kutove, počevši od početne točke. Klik blizu geodetske točke uzima njezino točno mjesto.
3. Ponovno kliknite prvi kut ili pritisnite {{key:Enter}} za završetak. {{key:Backspace}} poništava posljednji kut; {{key:Esc}} odbacuje kutove do sada; ponovno ga pritisnite da napustite alat.

## Unesite navode iz isprave

1. Kliknite **Unesi navode iz isprave**.
2. Recite gdje navodi počinju: broj geodetske točke ili sjeverna i istočna koordinata.
3. Upišite ili zalijepite navode, jedan po retku:
   - linija: smjerni kut i duljina, poput `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` i azimuti (`AZ 45°30'15"`) također rade, a „thence”, zarezi i „feet” se zanemaruju.
   - krivulja: `C R 300 L 52.36 right` (radijus i duljina luka) ili `C R 300 D 10°00'00" left` (radijus i središnji kut). Krivulja slijedi dionicu prije nje; kada to nije slučaj, dodajte njezin tetivni smjerni kut: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` započinje redak komentara.
4. Dok tipkate, okvir prikazuje duljinu navoda, **pogrešku zatvaranja** (koliko daleko od početka završavaju i u kojem smjeru), **preciznost** (duljina podijeljena s pogreškom zatvaranja, 1 : 10,000 i tako dalje) i površinu. Redci koje ne može pročitati navedeni su s brojevima redaka.
5. **Dodaj česticu**. Kada se navodi ne zatvaraju, čestica se zatvara ravnom dionicom preko razmaka: provjerite navode u odnosu na ispravu. Da biste raspodijelili pogrešku terenske poligonske izmjere po njezinim dionicama, prvo je prilagodite.

## Krivulje

U **Svojstvima** čestice svaka dionica ima **Radijus**. Upišite ga da dionica postane krivulja kroz ista dva kuta (radijus manji od polovine udaljenosti između kutova ne može doseći i odbija se), a u **Krivuljama** odaberite **Desno** ili **Lijevo**: krivulja udesno ima središte s desne strane smjera kretanja, kao u ispravi. Obrišite radijus da dionica opet bude ravna. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava.

## Pravni opis

Svojstva čestice završavaju njezinim pravnim opisom, napisanim iz crteža:

- „Počinje u” **Početnoj točki** koju upišete (na primjer „sjeveroistočni kut parcele 4”), inače sjeverna i istočna koordinata prvog kuta ili geodetska točka od koje su počeli navodi.
- „zatim” svaka dionica: smjerni kut i duljina, ili krivulja s radijusom, duljinom luka, središnjim kutom te tetivnim smjerom i duljinom.
- „Obuhvaća” njezinu površinu u kvadratnim stopama i jutrima (kvadratnim metrima i hektarima u projektu u metrima).

**Kopiraj** stavlja ga u međuspremnik; **Preuzmi kao tekst** sprema ga kao datoteku `.txt`.

:::warning
Pravni opis je radna verzija izrađena iz crteža, a ne geodetski elaborat. Ovlašteni geodet mora ga provjeriti u odnosu na evidenciju i potpisati ga prije nego što se itko na njega osloni.
:::

Kliknite unutar čestice na tlocrtu da je odaberete; {{key:Delete}} je uklanja. Čestice se spremaju u datoteku projekta.
