---
title: Planiranje terena za krajobraz
summary: Platoi, nasipići, zaravnjeni jarci (swale) i slobodno planiranje s visinskim kotama i izohipsama koje povlačite, iskop i nasip uživo, analiza nagiba, strelice tečenja i lokve, sve u projektiranoj površini CivilCraft-a.
keywords: potporni zid, potporni zidovi, okomita strana, zid umjesto nagiba, nagib po strani, nasip, planiranje, planiranje za krajobraz, plato, terasa, nasipić, humak, swale, visinska kota, kota točke, izohipse, uređivanje izohipsi, iskop i nasip, zemljani radovi, analiza nagiba, pristupačnost, strmi nagibi, strelice tečenja, odvodnja, lokve
from: e1559eb9
---

Sve se ovdje planira u **projektiranu površinu** istim planiranjem kao platoi i koridori. **Postojeći teren** se nikad ne mijenja, a Zemljani radovi ga sve računaju. Izbornik Planiranje nalazi se u grupi Krajobraz.

## Platoi

{{ui:Planiranje}} › {{ui:Platforma}}, zatim kliknite kutove i pritisnite {{key:Enter}}. Platforma počinje na srednjoj koti terena ispod nje; upišite **Kota** da je postavite, ili je ispraznite da ponovno slijedi teren. **Pad** u % i **Smjer pada** u stupnjevima (0 = istok, 90 = sjever) je naginju. Njene strane se planiraju do terena pri **Nagibu iskopa** i **Nagibu nasipa** (vodoravno do 1).

## Strane po nagibu i potporni zidovi

U **Strane i potporni zidovi** u Svojstvima platoa, nasipića ili platforme svaka strana može biti planirana na svoj način. Strana 1 ide od prvog kuta koji ste kliknuli do drugog, strana 2 od drugog do trećeg, i tako dalje.

- **Sve strane**: **Nagnuto** koristi gore navedene nagibe iskopa i nasipa na svakoj strani; **Vertikalne: potporni zidovi** stavlja zid na svaku stranu.
- Po strani: **Nagibi iznad**, **Vlastiti nagibi** (upišite nagib iskopa i nasipa za tu stranu) ili **Vertikalno (potporni zid)**.
- Upišite nagib kao `3` ili `3:1` (vodoravno do 1 okomito), `33%` ili `18.4°`; prikazuje se kao H:1. Vlastiti **Nagib iskopa** i **Nagib nasipa** platoa prihvaćaju isto.
- Okomita strana nema nasipa: potporni zid ide duž ruba, od platoa dolje do postojećeg terena (u nasipu) ili od terena dolje do platoa (u iskopu). **Debljina zida** (u početku 0.3 m ili 1 ft) je koliko se teren stepenasto spušta od ruba platoa do postojećeg terena. Volumeni iskopa i nasipa ne uključuju nasip koji ta strana više nema.
- Gdje se zid spaja s nagnutom stranom, nagib se obavija oko kraja zida; dva zida se spajaju u kosom spoju.
- Ispod polja: duljina zidova, izložena ploha (visina × duljina), najveća i prosječna visina.

Tlocrt crta vanjsku plohu svakog zida kratkim crticama preko nje i njenu visinu na oba kraja i na najvišoj točki (na sloju potpornih zidova, koji ide i u DXF i DWG). 3D prikaz prikazuje zidove kao tijela (Prikaz › Potporni zidovi), a izvoz GLB, OBJ i USD ih uključuje. Presjeci preko ruba pokazuju stepenicu.

**Upozorenja** (u Svojstvima i na ploči Problemi): zid viši od **Upozori iznad visine zida od** (u početku 1.0 m ili 3.3 ft) dobiva poruku „možda treba projektirani zid ili dozvolu; provjerite lokalne propise”, a kad upišete **Najstrmiji nagib koji tlo podnosi**, svaka strana čiji je nagib iskopa ili nasipa strmiji od toga. To su upozorenja: planiranje se i dalje izgrađuje. Svaka promjena je jedan korak za {{key:Mod+Z}}.

## Nasipići

{{ui:Planiranje}} › {{ui:Nasipić (berma)}}: humak čiji je vrh na **Visini** iznad srednjeg terena ispod njega, a strane su mu planirane.

## Zaravnjeni jarci (swale)

{{ui:Planiranje}} › {{ui:Zaravnjeni jarak (swale)}}, zatim kliknite duž zaravnjenog jarka **kako voda teče** i pritisnite {{key:Enter}}. Postavite njegovu **Dubinu**, **Širinu dna** (0 za V) i **Nagib strane**. Bez **Pada**, njegovo dno prati teren, na dubini ispod njega, i nikad ne ide uzbrdo; upišite pad da dobije stalan nagib od svog početka.

## Visinske kote i izohipse

1. {{ui:Planiranje}} › {{ui:Područje planiranja}}: kliknite obris područja koje želite oblikovati.
2. {{ui:Planiranje}} › {{ui:Visinska kota}}: kliknite unutar područja. Upišite njenu visinu u Svojstvima ili upotrijebite gumbe ▲ ▼.
3. {{ui:Planiranje}} › {{ui:Uredi izohipsu}}: kliknite izohipsu unutar područja da je uzmete kao liniju koju možete preoblikovati.

Odaberite visinsku kotu ili izohipsu i **povucite** je (ili njene točke) na tlocrtu: površina slijedi kad pustite, kao jedan korak poništavanja. Unutar područja teren se ponovno izrađuje od svog ruba (gdje se spaja s postojećim terenom), visinskih kota i uređenih izohipsi.

## Iskop i nasip uživo

Svojstva svakog objekta planiranja pokazuju njegov **Iskop** i **Nasip** te onaj cijelog lokaliteta, metodom mreže koju koriste Zemljani radovi, dok to mijenjate. Problemi (izvan površine, obris koji siječe sam sebe) navedeni su ondje.

## Provjere planiranja

U odjeljku **Provjere planiranja** lijevo:

- **Analiza nagiba** boji površinu prema gradijentu: do granice blagih nagiba, između, i strmije od granice strmih nagiba (u početku 5 % i 33.3 %: uobičajenih 1:20 za pristupačne rute i 1:3 za košnju). Legenda kaže koliki dio područja pada u svaku. Strma područja ispisuju se i na listovima.
- **Strelice tečenja i lokve** crtaju kuda voda teče i obilježavaju svako mjesto gdje bi se zadržala lokva, s njenom dubinom; odjeljak kaže koliko je takvih mjesta, koje je najdublje i koliko vode zadržavaju.

Provjere čitaju projektiranu površinu kad je išta isplanirano, inače postojeći teren.
