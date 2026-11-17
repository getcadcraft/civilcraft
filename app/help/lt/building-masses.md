---
title: Pastatų masės vietovėje
summary: Nubraižykite pastato masę sklype, nurodykite aukštus ir aukšto aukštį, peržiūrėkite bendrą grindų plotą, pasirinkite, kaip ji stovi ant šlaitinio grunto, stumkite ir traukite jos aukštį 3D vaizde ir siųskite į BimCraft arba įrašykite kaip IFC failą.
keywords: masė, masavimas, pastato masė, tūris, pėdsakas, aukštai, aukšto aukštis, bendras grindų plotas, GFA, nuolydis, podiumas, iškasa ir pylimas, stumti traukti, 3D, vietovės tyrimas, ankstyvasis projektavimas, IFC, plėtoti, BimCraft, A-MASS
from: e5a67c16
---

Pastato masė – tai pėdsakas, aukštų skaičius ir aukšto aukštis: ankstyvas klausimas „kiek pastato čia telpa ir ką tai daro grunte“. Masės plane rodomos su savo pavadinimu, aukštų skaičiumi ir bendru grindų plotu, patenka į PDF lapą ir DWG bei DXF eksportus sluoksniuose `A-MASS` ir `A-MASS-TEXT` ir įrašomos projekto faile.

## Nubraižyti masę

1. **Ypatybėse**, skyriuje **Pastatų masės**, spustelėkite **Nubraižyti masę**. (Ji taip pat yra įrankių juostos meniu **Daugiau** šalia **Paviršius**.)
2. Spustelėkite pėdsako kampus. Spustelėjimas arti sklypo kampo ar geodezinės nuotraukos taško perima tikslią to taško vietą.
3. Spustelėkite pirmąjį kampą dar kartą arba paspauskite {{key:Enter}}, kad baigtumėte. {{key:Backspace}} atima paskutinį kampą; {{key:Esc}} sustabdo.

Nauja masė turi tris aukštus ir 12 ft (3.6 m) aukšto aukštį bei priklauso tam sklypui, kuriame yra jos vidurys.

## Aukštai, aukštis ir plotas

Spustelėkite masę, kad pakeistumėte jos **Pavadinimą**, **Paskirtį**, **Aukštus**, **Aukšto aukštį** ir **Sklypą**. **Aukštis** yra aukštų skaičius, padaugintas iš aukšto aukščio: įveskite aukštį, o aukštų skaičius tampa artimiausiu sveikuoju skaičiumi (ne mažiau kaip vienas). **Pėdsakas** ir **Bendras grindų plotas** (pėdsakas, padaugintas iš aukštų) apskaičiuojami jums.

## Ant šlaitinio grunto

Po mase esantis gruntas nuskaitomas iš paviršiaus: esamas gruntas arba suformuotas gruntas, kai pasirinkote **Projektuojamas gruntas (suformuotas)**. **Ant šlaitinio grunto** nurodo, kur eina pirmas aukštas:

- **Laiptuotas**: pagal vidutinį gruntą po pėdsaku. Žemoji pusė užpilama iki jo, aukštoji – iškasama, ir abi beveik subalansuojamos.
- **Podiumas**: pagal aukščiausią gruntą. Vientisas pagrindas užpildo žemąją pusę.
- **Iškasa**: pagal žemiausią gruntą. Aukštoji pusė įkasama į kalvą.

**Ypatybėse** rodomas grunto aukščių intervalas po mase, **Pirmo aukšto lygis** ir pylimo bei iškasos tūris tarp grunto ir to lygio. Pėdsako vieta, esanti už paviršiaus ribų, neįtraukiama, o **Ypatybėse** nurodoma, kiek tokių vietų yra.

## 3D vaizde

Masės braižomos 3D vietovės vaizde, su linija aplink kiekvieną aukštą ir jų pavadinimais virš stogo. **Rodyti** turi žymimąjį langelį **Pastatų masės**. Spustelėkite masę, kad ją pasirinktumėte. Pasirinkus masę:

- vilkite jos stogą aukštyn arba žemyn, kad stumtumėte ar trauktumėte po vieną aukštą, arba paspauskite {{key:PageUp}} ir {{key:PageDown}};
- visas perkėlimas yra vienas atšaukimo žingsnis.

Gatvės vaizde **Važiavimas** taip pat mato mases, o **Saulė** meta jų šešėlius ant grunto.

## Siųskite toliau

- **Masės kaip IFC** įrašo kiekvieną masę kaip IFC4 failą: vietovę, pastatą su jo aukštais ir masę kaip pastato elementą su jos skaičiais savybių rinkinyje `CadCraft_SiteMass`. Jei projektui nustatyta koordinačių sistema, failas padedamas žemėlapyje ir turi vietovės platumą bei ilgumą; jei ne, jame nieko nesakoma apie vietą.
- **Plėtoti BimCraft** atidaro BimCraft naujame skirtuke su masėmis. Ten pasirinkus masę rodomi jos skaičiai ir **Plėtoti šią masę**, kuris pagal pėdsaką sukuria sienas kiekvienam lygiui ir grindis po pastatu – vienu atšaukimo žingsniu. Nieko neįkeliama: failas keliauja tarp dviejų šios naršyklės skirtukų.

Taip pat žr. **Zonavimo ribos** ir **Saulės valandos**.
