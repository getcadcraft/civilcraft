---
title: Žemės ir vietinės koordinatės
summary: Dirbkite žemės (paviršiaus) koordinatėmis, perskaičiuotomis iš tinklelio pagal jūsų įvestą ar taške apskaičiuotą bendrą mastelio koeficientą, arba įsivaizduojamu objekto tinkleliu, susietu su sistema dviem kontroliniais taškais.
keywords: žemės koordinatės, paviršiaus koordinatės, tinklelis į žemę, bendras mastelio koeficientas, csf, bendras koeficientas, tinklelio koeficientas, aukščio koeficientas, jūros lygio koeficientas, konvergencija, atvaizdavimo kampas, mastelio koeficientas, įsivaizduojamos koordinatės, vietinės koordinatės, objekto tinklelis, 5000 5000, kontroliniai taškai, lokalizavimas, kalibravimas, du taškai, nesutapimas
from: 3d7453de
---

Valstybinės plokštumos ir UTM koordinatės yra **tinklelio** koordinatės: kartografinė projekcija šiek tiek ištempia arba suspaudžia atstumus (dešimtys dalių milijone), o kuo aukštesnė vietovė, tuo labiau išmatuotas žemės atstumas skiriasi nuo tinklelio atstumo. Todėl daugelis apžvalgų perduoda **žemės** koordinates, pamastelintas taip, kad plano atstumai būtų lygūs atstumams, išmatuotiems žemėje, arba **įsivaizduojamą** objekto tinklelį (5000, 5000 kontroliniame taške). CivilCraft išsaugo jūsų skaičius tokius, kokie yra, ir įrašo, kaip jie susiję su tinkleliu, todėl platuma ir ilguma, GIS failai ir žemėlapių sluoksniai vis tiek patenka į tinkamą vietą.

Atidarykite {{ui:Koordinatės}} **GIS** grupėje, pasirinkite (arba palikite) sistemą, tada skiltyje **Tinklelio, žemės arba vietinės koordinatės** pasirinkite:

| Pasirinkimas | Jūsų koordinatės yra | Kaip jos susijusios su tinkleliu |
|---|---|---|
| {{ui:Tinklelio}} | Sistemos pačios (pradinės) | Tie patys skaičiai |
| {{ui:Žemė}} | Pamastelintos pagal žemės atstumus | tinklelis = bazė + bendras koeficientas × (žemė − bazė) |
| {{ui:Vietinės}} | Įsivaizduojamas objekto tinklelis | Perkeltos, pasuktos ir pamastelintos į tinklelį pagal du kontrolinius taškus |

Ką pasirinksite, išsaugoma su projektu ir yra vienas anuliavimo žingsnis; niekas nejuda.

## Žemės koordinatės

1. Pasirinkite {{ui:Žemė}}.
2. Įveskite **Bendras mastelio koeficientas** iš apžvalgos (pavyzdžiui, `0.99987`), arba apskaičiuokite jį:
   1. Skiltyje **Apskaičiuoti koeficientą taške** taškas pradžioje yra projekto viduryje. Spustelėkite {{ui:Pasirinkti tašką plane}} ir spustelėkite vietą (spustelėjimas netoli topografinio taško paima tą tašką), arba įveskite E ir N.
   2. Aukštis paimamas iš paviršiaus toje vietoje; jei reikia, įveskite kitą.
   3. Spustelėkite {{ui:Skaičiuoti}}. CivilCraft parodo:
      - **Tinklelio mastelio koeficientas k**: kiek kartografinė projekcija ten ištempia atstumus.
      - **Aukščio koeficientas**: kiek trumpesni atstumai elipsoide nei tame aukštyje.
      - **Bendras koeficientas** = k × aukščio koeficientas: tinklelio atstumas = žemės atstumas × šis skaičius.
      - **Konvergencija**: kampas nuo tinklelio šiaurės iki tikrosios šiaurės ten (geodezinis azimutas = tinklelio azimutas + konvergencija).
   4. Spustelėkite mygtuką {{ui:Paskirtis}} po skaičiais, kad bendras koeficientas įsirašytų į langelį.
3. Nustatykite **Bazinį tašką**, kuriame žemės ir tinklelio koordinatės sutampa. Pradžioje jis yra 0, 0: dauguma jurisdikcijų, skelbiančių žemės koordinates, mastelį taiko apie pradžios tašką, todėl žemės koordinatės lieka atpažįstamai artimos tinklelio koordinatėms. Kai kurios apžvalgos mastelį taiko apie projekto kontrolinį tašką: naudokite tai, ką nurodo apžvalga.
4. Spustelėkite {{ui:Taikyti}}.

:::warning
Aukštis imamas kaip aukštis virš elipsoido. CivilCraft neturi geoido modelio, todėl ten, kur geoidas yra 30 m (100 ft) žemiau arba aukščiau elipsoido, aukščio koeficientas nukrypsta maždaug 5 ppm. Kai apžvalga nurodo savo bendrą koeficientą, įveskite būtent jį.
:::

## Vietinės (įsivaizduojamos) koordinatės

1. Pasirinkite {{ui:Vietinės}}.
2. **Kontrolinis taškas 1**: įveskite apžvalgos taško numerį (arba spustelėkite {{ui:Pasirinkti}} ir spustelėkite jį plane). Jo vietinės koordinatės rodomos šalia.
3. Įveskite jo **tinklelio** E ir N arba jo platumą ir ilgumą trečiame langelyje (pavyzdžiui, `30.2672, -97.7431`).
4. Tą patį padarykite **Kontroliniam taškui 2**, kuo toliau nuo pirmojo.
5. CivilCraft parodo rastą **Mastelį** ir **Pasukimą** ir primena: **Du taškai visada sutampa tiksliai, patikrinkite trečią.**
6. Nurodykite **Patikros tašką** tuo pačiu būdu. CivilCraft parodo, kiek toli nuo jūsų įvestų tinklelio koordinačių jį padeda sutapimas (jo nesutapimas projekto vienetais ir dalimis milijone). Didelis nesutapimas reiškia klaidingą tašką, rašybos klaidą arba koordinates kitais vienetais.
7. Spustelėkite {{ui:Taikyti}}.

Mastelis toli nuo 1 (už 0.5 iki 2 ribų) atmetamas: patikrinkite taškus ir jų vienetus.

## Ką patikrinome

- Mastelio koeficientas ir konvergencija sutampa su PROJ (pyproj 3.7.1 su PROJ 9.5.1), koordinačių biblioteka, kurią naudoja dauguma GIS programų, iki 1 dalies milijarde daugiau nei 300 sistemų su konforminėmis projekcijomis (valstybinė plokštuma, UTM, skersinė Merkatoriaus, Lambert konforminė kūginė), ir naršyklėje taške, pasirinktame plane.
- Žemės ir vietiniai žingsniai konvertuojami pirmyn ir atgal iki 1 dalies milijarde; du kontroliniai taškai grąžina mastelį ir pasukimą, iš kurių jie buvo sukurti; patikros taškas, nukrypęs 0.05 ft, rodo 0.05 ft nesutapimą.
