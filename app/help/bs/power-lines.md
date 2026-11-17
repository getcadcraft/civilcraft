---
title: Radni prostor za dalekovode
summary: Nadzemni vodovi i podzemni kablovi na vašoj lokaciji, s vlastitim bibliotekama, ugibom i napetošću prema vašim slučajevima opterećenja, provjerama slobodnih visina i čvrstoće, tablicama zatezanja, količinama, listovima i izvozom za GIS.
keywords: dalekovod, nadzemni vod, elektro, distribucija, stubovi, vodič, ugib, napetost, zatezanje, slobodna visina, podzemni kabl, rov, radni prostor, komunalno
from: 638dd856
---

Radni prostor Dalekovodi smješta nadzemne vodove i podzemne kablove na CivilCraft lokaciju koju već imate: iste tačke snimanja, isti teren, istu datoteku projekta.

:::warning
Pomoćno sredstvo za projektovanje. Radni prostor računa ugib, napetost, slobodne visine i opterećenja iz **vaših** slučajeva opterećenja i ograničenja; nijedan državni standard nije ugrađen. Inženjer provjerava svaki rezultat prema standardu koji važi prije nego što se išta izgradi.
:::

## Otvorite ga

Odaberite {{ui:Površina}} › {{ui:Više}} › {{ui:Radni prostor za dalekovode}}, ili **Dalekovodi** pod Radni prostor. Traka sa alatima tada prikazuje grupu **Dalekovodi**; grupe Projektovanje i GIS se povlače. Odaberite **Građevinski** pod Radni prostor da se vratite. CivilCraft pamti radni prostor koji ste zadnji koristili na ovom računaru.

Lijevi panel dobija dva odjeljka na vrhu:

- **Dalekovodi**: vaši slučajevi opterećenja i ograničenja, vodovi i kablovi u projektu, te **Provjere**, uvijek ažurne. Kliknite na provjeru da odaberete ono na šta se odnosi.
- **Biblioteka**: vaši vlastiti vodiči, kablovi, stubovi, oprema i tipovi rova. Pogledajte [Vaša biblioteka dalekovoda](topic:power-line-library).

## Šta je u grupi Dalekovodi

| Alat | Šta radi | Tema |
|---|---|---|
| **Vod** | Nadzemni vod: kliknite na svaki stub | [Crtanje nadzemnog voda](topic:overhead-line) |
| **Stub** | Dodaje stub na raspon | [Crtanje nadzemnog voda](topic:overhead-line) |
| **Kabl** | Trasa podzemnog kabla u rovu | [Podzemni kablovi](topic:underground-cables) |
| **Oprema** | Ormar, transformator, spojnica ili izvor iz kojeg se mreža napaja | [Podzemni kablovi](topic:underground-cables) |
| **Prepreka** | Nešto što vod prelazi: put, zgrada, drugi vod | [Provjere](topic:power-line-checks) |
| **Uzdužni profil** | Profil voda: teren, stubovi i vodič pri svakom slučaju opterećenja | [Crtanje nadzemnog voda](topic:overhead-line#the-line-profile) |
| **Više** | Slučajevi opterećenja i ograničenja, tablice zatezanja, količine, listovi i izvještaj, GIS, studijske datoteke | [Ugib i napetost](topic:sag-and-tension), [Izlazi](topic:power-line-outputs), [Studijske datoteke](topic:power-line-study-file) |

Sve što dodate je jedan korak poništavanja, čuva se u datoteci projekta i crta se na planu na slojevima nazvanim `C-POWR-…`, tako da je DXF, DWG i PDF izvoz također nose.
