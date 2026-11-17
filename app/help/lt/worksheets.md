---
title: Žiniaraščiai: lentelės, susietos su objektais
summary: Įrašyti žiniaraščiai su eilutėmis iš augalų, sodinamų plotų, dangų, sienų, laiptų, žemės modifikatorių ar visų kiekių; jūsų stulpeliai ir formulės, grupės ir sumos; CSV, XLSX ir lentelė lapuose, visada atnaujinta.
keywords: žiniaraštis, tvarkaraštis, augalų žiniaraštis, kietųjų dangų žiniaraštis, kiekiai, stulpeliai, formulė, suma, skaičius, grupė, filtras, csv, xlsx, skaičiuoklė, lentelė lape
from: 11bc1bac
---

{{ui:Žiniaraščiai}} (Kraštovaizdžio darbo sritis › Daugiau) atveria šio projekto žiniaraščius. Pirmą kartą **augalų žiniaraštis** ir **kietųjų dangų ir plotų žiniaraštis** sukuriami jums. Žiniaraštis apskaičiuojamas iš objektų kiekvieną kartą, kai jis rodomas, įrašomas ar dedamas ant lapo: pakeiskite lysvę – jos kiekiai pasikeičia visur.

- **Eilutės iš**: augalų (viena eilutė kiekvienai rūšiai, veislei ir dydžiui), sodinamų plotų, dangų, sienų, laiptų, žemės modifikatorių (iškasa ir pylimas) arba visų kiekių.
- **Stulpeliai**: laukas (`qty`, `area`, `botanical` arba pavadinimas laužtiniuose skliaustuose, pavyzdžiui, `[Grynas plotas]`) arba formulė: `+ - * / ^ %`, `&` tekstui jungti, `= <> < <= > >=`, ir `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Formulė, kurios neįmanoma apskaičiuoti, langelyje rodo `#ERR` (arba `#DIV/0`). Formules skaito pačios CadCraft programos analizatorius; joks jų elementas nevykdomas kaip kodas.
- **Viso** kiekvienam stulpeliui (suma, skaičius, vidurkis, mažiausias, didžiausias), **Grupuoti pagal** (tarpinės sumos kiekvienai grupei) ir **Tik eilutės, kur**.
- {{ui:Įrašyti kaip CSV}}, {{ui:Įrašyti kaip XLSX}} ir **Įdėti šį žiniaraštį į lapus** (Lapai › Žiniaraščiai nubraižo jį kaip lentelę, per tiek lapų, kiek reikia).

Etiketės ant augalų ir plotų naudoja tuos pačius laukų pavadinimus (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
