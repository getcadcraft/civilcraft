---
title: Ievadīt poligonu un izlīdzināt to ar kompasa likumu
summary: Ievadiet lauka leņķus vai rumbus un attālumus, pārbaudiet leņķisko un lineāro slēgumu un precizitāti, izlīdziniet ar kompasa likumu un pievienojiet punktus kā uzmērījuma punktus vai cilpu kā zemesgabalu.
keywords: poligons, slēgts poligons, cilpa, leņķi pa labi, atpakaļskats, rumbi, attālumi, slēgums, neslēgums, precizitāte, kompasa likums, Bauditča, izlīdzināšana, uzmērīšana
from: 56ce5a8c
---

Poligons ir izmērītu posmu virkne: katrā punktā leņķis (vai rumbs) un attālums līdz nākamajam. Noklikšķiniet uz **Ievadīt poligonu** zem **Poligons** labajā panelī, kad nekas nav atlasīts.

## Kur tas sākas un beidzas

1. **Sākt no uzmērījuma punkta**: tā numurs. Vai ievadiet ziemeļu un austrumu koordinātas.
2. **Posmi kā**: **Leņķi pa labi un attālumi** vai **Rumbi un attālumi**.
3. Ar leņķiem norādiet, no kurienes tie sākas: **Atpakaļskata uzmērījuma punkts** vai **tā azimuts** (no pirmā punkta uz atpakaļskatu, pulksteņrādītāja virzienā no ziemeļiem).
4. **Beigas**: **atpakaļ sākumā (cilpa)** vai **uz uzmērījuma punkta** un tā numurs (atvērts poligons starp zināmiem punktiem).

## Ievadiet posmus

Viens posms ir viena rindiņa: vispirms leņķis vai rumbs, tad attālums un, ja vēlaties, to punktu nosaukums, uz kuru posms ved:

- Leņķi pa labi, pagriezti pulksteņrādītāja virzienā punktā, no kura posms iet, no iepriekšējā punkta uz nākamo: `270°00'10" 125.50 B`. Darbojas arī `270-00-10`, `270 00 10` un `270.0028`.
- Rumbi: `N 45°30'15" E 125.50 B`, vai azimuts vienā vārdā: `AZ 45-30-15 125.50 B`.
- Cilpai ar leņķiem beidziet ar `close` un vēlreiz sākuma punkta leņķi, pagrieztu no pēdējā punkta uz otro: `close 270°00'05"`. Tieši tas pārbauda leņķus.

Rindas, ko nevar nolasīt, tiek uzskaitītas ar to rindu numuriem. Vārds `feet`, komati un `#` komentāru rindas ir pieļaujami.

## Lasiet slēgumu

Kamēr rakstāt, dialogs rāda:

- **Leņķiskais neslēgums**: cik tālu leņķi ir no slēguma un kādu daļu katrs leņķis veido. Bez slēguma leņķa leņķi netiek pārbaudīti, un jebkura kļūda tajos parādās lineārajā neslēgumā.
- **Lineārais neslēgums**: cik tālu poligona gals ir no vietas, kur tam vajadzētu beigties, un kurā virzienā.
- **Precizitāte**: poligona garums dalīts ar lineāro neslēgumu: 1 : 10,000 nozīmē 1 ft uz 10,000 ft.
- Punkti pēc izlīdzināšanas un cik tālu katrs no tiem ir pārvietojies.

## Izlīdzināšana

Vispirms leņķiskais neslēgums tiek vienmērīgi sadalīts starp leņķiem. Tad lineārais neslēgums tiek sadalīts pa posmiem ar kompasa likumu (Bauditča): katrs punkts pārvietojas pret neslēgumu proporcionāli nobrauktajam garumam līdz tam, tāpēc poligons beidzas tieši tur, kur tam jābeidzas.

:::note
Kompasa likums ir standarta izlīdzināšana, nevis mazāko kvadrātu metode, un tas nesvara leņķus pret attālumiem. Vai precizitāte ir pietiekama, nosaka jūsu pašu standarti un jūsu jurisdikcijas prasības.
:::

## Izmantojiet rezultātu

- **Pievienot kā uzmērījuma punktus**: izlīdzinātie punkti kļūst par uzmērījuma punktiem ar jūsu dotajiem nosaukumiem (citādi nākamajiem brīvajiem numuriem), aprakstu `TRAV`, bez augstuma. Cilpas pēdējais punkts ir tās sākums, tāpēc tas netiek pievienots divreiz. Viens solis: {{key:Mod+Z}} to atsauc.
- **Pievienot kā zemesgabalu** (cilpām): izlīdzinātie punkti kļūst par [zemesgabalu](topic:parcels) ar tā uzrakstiem un juridisko aprakstu.
- **Atskaite (CSV)**: slēguma rindas, tad katra punkta virziens, attālums, nelabotās un izlīdzinātās koordinātas un labojumi.
