---
title: Radni prostor za dalekovode
summary: Nadzemni vodovi i podzemni kablovi na tvojoj lokaciji, sa sopstvenim bibliotekama, ugibom i zatezanjem pod tvojim slučajevima opterećenja, proverama razmaka i čvrstoće, tabelama zatezanja, količinama, listovima i izvozom za GIS.
keywords: dalekovod, nadzemni vod, električni, distribucija, stubovi, provodnik, ugib, zatezanje, postavljanje provodnika, napon, razmak, podzemni kabl, rov, radni prostor, komunalno
from: 638dd856
---

Radni prostor Dalekovodi stavlja nadzemne vodove i podzemne kablove na CivilCraft lokaciju koju već imaš: iste tačke premera, isti teren, isti projekat.

:::warning
Pomoćno sredstvo za projektovanje. Radni prostor računa ugib, zatezanje, razmake i opterećenja prema **tvojim** slučajevima opterećenja i ograničenjima; nijedan državni standard nije ugrađen. Inženjer proverava svaki rezultat prema standardu koji važi pre nego što se bilo šta izgradi.
:::

## Otvori ga

Izaberi {{ui:Površ}} › {{ui:Više}} › {{ui:Radni prostor za dalekovode}}, ili **Dalekovodi** pod Radni prostor. Traka sa alatkama tada prikazuje grupu **Dalekovodi**; grupe Projektovanje i GIS se sklanjaju. Izaberi **Građevinski** pod Radni prostor da se vratiš. CivilCraft pamti radni prostor koji si poslednji koristio na ovom računaru.

Levi panel dobija dva odeljka na vrhu:

- **Dalekovodi**: tvoji slučajevi opterećenja i ograničenja, vodovi i kablovi u projektu i **Provere**, uvek ažurne. Klikni proveru da izabereš ono na šta se odnosi.
- **Biblioteka**: tvoji provodnici, kablovi, stubovi, oprema i tipovi rovova. Vidi [Tvoja biblioteka dalekovoda](topic:power-line-library).

## Šta je u grupi Dalekovodi

| Alat | Šta radi | Tema |
|---|---|---|
| **Linija** | Nadzemni vod: klikni svaki stub | [Nacrtaj nadzemni vod](topic:overhead-line) |
| **Stub** | Dodaj stub na raspon | [Nacrtaj nadzemni vod](topic:overhead-line) |
| **Kabl** | Trasa podzemnog kabla u rovu | [Podzemni kablovi](topic:underground-cables) |
| **Oprema** | Ormarić, transformator, spoj ili izvor iz kojeg se mreža napaja | [Podzemni kablovi](topic:underground-cables) |
| **Prepreka** | Nešto što vod prelazi: put, zgrada, drugi vod | [Provere](topic:power-line-checks) |
| **Profil** | Profil voda: teren, stubovi i provodnik pri svakom slučaju opterećenja | [Nacrtaj nadzemni vod](topic:overhead-line#the-line-profile) |
| **Više** | Slučajevi opterećenja i ograničenja, tabele zatezanja, količine, listovi i izveštaj, GIS, studijske datoteke | [Ugib i zatezanje](topic:sag-and-tension), [Izlazi](topic:power-line-outputs), [Studijske datoteke](topic:power-line-study-file) |

Sve što dodaš je jedan korak opozivanja, čuva se u datoteci projekta i crta se na osnovi, na slojevima nazvanim `C-POWR-…`, pa ga izvoze DXF, DWG i PDF takođe nose.
