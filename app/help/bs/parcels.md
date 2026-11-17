---
title: Crtanje parcela i pisanje njihovih pravnih opisa
summary: Nacrtaj parcelu po njenim uglovima ili unesi pravce iz isprave ili geodetskog plana, provjeri koliko se pravci zatvaraju, označi smjerove i dužine na planu, pretvori bilo koji pravac u krivinu i kopiraj nacrt pravnog opisa.
keywords: parcele, lotovi, granice posjeda, granica, isprava, geodetski plan, mjere i granice, smjer, dužina, zatvaranje, odstupanje, tačnost, pravni opis, početna tačka, krivina, radijus, površina, acres
from: 6793d6ce
---

Parcele se nalaze na planu sa smjerom i dužinom duž svakog pravolinijskog pravca (krivina pokazuje radijus, dužinu i središnji ugao), a njihov naziv i površina su u sredini. Ulaze u PDF ispis i u DWG i DXF izvoze, na slojevima `V-PROP` (linije) i `V-PROP-TEXT` (oznake). Sve je pod **Parcele** u desnom panelu kad ništa nije odabrano.

## Nacrtaj parcelu

1. Klikni **Nacrtaj parcelu**.
2. Klikni uglove, počevši od početne tačke. Klik blizu tačke premjera uzima tačno mjesto te tačke.
3. Klikni prvi ugao ponovo, ili pritisni {{key:Enter}}, da završiš. {{key:Backspace}} vraća posljednji ugao; {{key:Esc}} odbacuje dosadašnje uglove; pritisni ga ponovo da izađeš iz alata.

## Unesi pravce iz isprave

1. Klikni **Unesi pravce iz isprave**.
2. Reci gdje pravci počinju: broj tačke premjera ili sjeverni i istočni koordinat.
3. Ukucaj ili nalijepi pravce, jedan po redu:
   - pravac: smjer i dužina, kao `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` i azimuti (`AZ 45°30'15"`) također rade, a riječi `thence`, zarezi i `feet` se ignorišu.
   - krivina: `C R 300 L 52.36 right` (radijus i dužina luka) ili `C R 300 D 10°00'00" left` (radijus i središnji ugao). Krivina slijedi pravac prije nje; kad ne slijedi, dodaj njen smjer tetive: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` počinje red komentara.
4. Dok kucaš, dijalog pokazuje dužinu pravaca, **odstupanje zatvaranja** (koliko daleko od početka završavaju i u kojem smjeru), **tačnost** (dužina podijeljena odstupanjem, 1 : 10.000 i tako dalje) i površinu. Redovi koje ne može pročitati navode se s brojevima redova.
5. **Dodaj parcelu**. Kad se pravci ne zatvaraju, parcela se zatvara pravom linijom preko praznine: provjeri pravce u odnosu na ispravu. Da raspodijeliš grešku terenskog poligonskog vlaka po njegovim pravcima, prvo je podesi.

## Krivine

U **Svojstvima** parcele, svaki pravac ima **Radijus**. Upiši jedan da taj pravac postane krivina kroz ista dva ugla (radijus manji od polovine razmaka između uglova ne može doseći, pa se odbija), i odaberi **Desno** ili **Lijevo** u **Krivine**: krivina udesno ima središte desno od smjera kretanja, kao u ispravi. Obriši radijus da opet bude pravolinijska. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava.

## Pravni opis

Svojstva parcele završavaju njenim pravnim opisom, napisanim iz crteža:

- "Počinje od" **Početne tačke** koju upišeš (na primjer "sjeveroistočni ugao Parcele 4"), inače sjeverni i istočni koordinat prvog ugla, ili tačka premjera od koje su pravci počeli.
- "zatim" svaki pravac: smjer i dužina, ili krivina sa radijusom, dužinom luka, središnjim uglom te smjerom i dužinom tetive.
- "Obuhvata" njenu površinu u kvadratnim stopama i akrima (kvadratnim metrima i hektarima u projektu u metrima).

**Kopiraj** ga stavlja u međuspremnik; **Preuzmi kao tekst** ga spašava kao `.txt` datoteku.

:::warning
Pravni opis je nacrt iz crteža, a ne premjer. Ovlašteni geodeta ga mora provjeriti u odnosu na evidenciju i potpisati prije nego ga iko počne oslanjati.
:::

Klikni unutar parcele na planu da je odabereš; {{key:Delete}} je uklanja. Parcele se spašavaju u datoteci projekta.
