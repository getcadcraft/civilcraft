---
title: Nacrtajte parcele i napišite njihove pravne opise
summary: Nacrtajte parcelu po njenim uglovima ili unesite pravce iz isprave ili plana parcelacije, proverite koliko se pravci zatvaraju, obeležite pravce i rastojanja na planu, pretvorite svaku deonicu u krivinu i kopirajte nacrt pravnog opisa.
keywords: parcele, parcele zemljišta, granice poseda, međa, isprava, plan parcelacije, mere i međe, pravac, rastojanje, zatvaranje, greška zatvaranja, tačnost, pravni opis, početna tačka, krivina, poluprečnik, površina, ari, akri
from: 6793d6ce
---

Parcele se nalaze na planu sa pravcem i rastojanjem duž svake prave deonice (krivina pokazuje svoj poluprečnik, dužinu i centralni ugao), a njihov naziv i površina su u sredini. Ulaze u PDF ispis i DWG i DXF izvoze, na slojevima `V-PROP` (linije) i `V-PROP-TEXT` (natpisi). Sve je pod **Parcele** u desnom panelu kada ništa nije izabrano.

## Nacrtaj parcelu

1. Kliknite **Nacrtaj parcelu**.
2. Kliknite uglove, počevši od početne tačke. Klik blizu tačke premera uzima tačno mesto te tačke.
3. Kliknite prvi ugao ponovo ili pritisnite {{key:Enter}} da završite. {{key:Backspace}} opoziva poslednji ugao; {{key:Esc}} odbacuje dosadašnje uglove; pritisnite ga ponovo da napustite alat.

## Unesi pravce iz isprave

1. Kliknite **Unesi pravce iz isprave**.
2. Recite gde pravci počinju: broj tačke premera, ili severni i istočni koordinat.
3. Ukucajte ili nalepite pravce, jedan po redu:
   - prava deonica: pravac i rastojanje, na primer `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` i azimuti (`AZ 45°30'15"`) takođe rade, a reči „thence“, zapete i „feet“ se ignorišu.
   - krivina: `C R 300 L 52.36 right` (poluprečnik i dužina luka) ili `C R 300 D 10°00'00" left` (poluprečnik i centralni ugao). Krivina sledi deonicu pre nje; kada ne sledi, dodajte pravac tetive: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` započinje red komentara.
4. Dok kucate, dijalog prikazuje dužinu pravaca, **grešku zatvaranja** (koliko daleko od početka se završavaju i u kom smeru), **tačnost** (dužina podeljena greškom zatvaranja, 1 : 10,000 i tako dalje) i površinu. Redovi koje ne može da pročita navode se sa brojevima redova.
5. Kliknite **Dodaj parcelu**. Kada pravci ne zatvaraju, parcela se zatvara pravom deonicom preko praznine, pa proverite pravce u odnosu na ispravu. Da biste raspodelili grešku poligona premera po njegovim deonicama, prvo je podesite.

## Krivine

U **Svojstvima** parcele svaka deonica ima **Poluprečnik**. Ukucajte ga da bi ta deonica postala krivina kroz ista dva ugla (poluprečnik manji od polovine rastojanja između uglova ne može da se dostigne, pa se odbija), i izaberite **Desno** ili **Levo** u **Krivinama**: krivina udesno ima centar desno od smera kretanja, kao u ispravi. Obrišite poluprečnik da bi opet bila prava. Svaka promena je jedan korak: {{key:Mod+Z}} je opoziva.

## Pravni opis

Svojstva parcele se završavaju njenim pravnim opisom, napisanim iz crteža:

- „Počinje u“ **Početnoj tački** koju ukucate (na primer „severoistočni ugao Parcele 4“), inače severni i istočni koordinat prvog ugla, ili tačka premera iz koje su pravci počeli.
- „zatim“ svaka deonica: pravac i rastojanje, ili krivina sa poluprečnikom, dužinom luka, centralnim uglom i pravcem i rastojanjem tetive.
- „Sadrži“ svoju površinu u kvadratnim stopama i akrima (kvadratnim metrima i hektarima u projektu u metrima).

**Kopiraj** stavlja ga na privremenu memoriju; **Preuzmi kao tekst** ga čuva kao datoteku `.txt`.

:::warning
Pravni opis je nacrt iz crteža, a ne geodetski premer. Licencirani geodetski inženjer ga mora proveriti u odnosu na evidenciju i potpisati pre nego što iko na njega osloni.
:::

Kliknite unutar parcele na planu da je izaberete; {{key:Delete}} je uklanja. Parcele se čuvaju u datoteci projekta.
