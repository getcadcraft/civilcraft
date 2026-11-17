---
title: Radni prostor Dalekovodi
summary: Nadzemni vodovi i podzemni kabeli na vašem gradilištu, s vlastitim knjižnicama, provjerom progiba i napetosti pri vašim slučajevima opterećenja, provjerom slobodnih visina i čvrstoće, tablicama zatezanja, količinama, listovima i izvozom za GIS.
keywords: dalekovod, nadzemni vod, električni, distribucija, stupovi, nosači, vodič, progib, napetost, zatezanje, slobodna visina, podzemni kabel, rov, radni prostor, komunalni
from: 638dd856
---

Radni prostor Dalekovodi stavlja nadzemne vodove i podzemne kabele na CivilCraft gradilište koje već imate: iste točke snimanja, isti teren, istu datoteku projekta.

:::warning
Pomoćno sredstvo za projektiranje. Radni prostor izračunava progib, napetost, slobodne visine i opterećenja iz **vaših** slučajeva opterećenja i granica; nijedan državni standard nije ugrađen. Inženjer provjerava svaki rezultat prema standardu koji vrijedi prije nego se išta izgradi.
:::

## Otvaranje

Odaberite {{ui:Teren}} › {{ui:Više}} › {{ui:Radni prostor Dalekovodi}}, ili **Dalekovodi** pod Radni prostor. Traka tada prikazuje grupu **Dalekovodi**; grupe Projektiranje i GIS se povlače. Odaberite **Građevina** pod Radni prostor za povratak. CivilCraft pamti radni prostor koji ste zadnje koristili na ovom računalu.

Lijevi panel dobiva dva odjeljka na vrhu:

- **Dalekovodi**: vaši slučajevi opterećenja i granice, vodovi i kabeli u projektu te **Provjere**, uvijek ažurno. Kliknite provjeru da odaberete ono na što se odnosi.
- **Knjižnica**: vaši vlastiti vodiči, kabeli, stupovi, oprema i vrste rovova. Pogledajte [Vaša knjižnica dalekovoda](topic:power-line-library).

## Što je u grupi Dalekovodi

| Alat | Što radi | Tema |
|---|---|---|
| **Vod** | Nadzemni vod: kliknite svaki stup | [Crtanje nadzemnog voda](topic:overhead-line) |
| **Stup** | Dodaje stup na raspon | [Crtanje nadzemnog voda](topic:overhead-line) |
| **Kabel** | Trasa podzemnog kabela u rovu | [Podzemni kabeli](topic:underground-cables) |
| **Oprema** | Ormarić, transformator, spoj ili izvor kojim se mreža napaja | [Podzemni kabeli](topic:underground-cables) |
| **Prepreka** | Nešto što vod siječe: cesta, zgrada, drugi vod | [Provjere](topic:power-line-checks) |
| **Profil** | Uzdužni profil voda: teren, stupovi i vodič pri svakom slučaju opterećenja | [Crtanje nadzemnog voda](topic:overhead-line#the-line-profile) |
| **Više** | Slučajevi opterećenja i granice, tablice zatezanja, količine, listovi i izvještaj, GIS, datoteke studije | [Progib i napetost](topic:sag-and-tension), [Izlazi](topic:power-line-outputs), [Datoteke studije](topic:power-line-study-file) |

Sve što dodate jedan je korak poništavanja, sprema se u datoteku projekta i crta se na tlocrtu na slojevima nazvanim `C-POWR-…`, pa to nose i izvozi DXF, DWG i PDF.
