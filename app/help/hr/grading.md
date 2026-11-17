---
title: Planiranje građevinskog platoa
summary: Nacrtajte ravan plato, postavite njegovu visinu i nagibe iskopa i nasipa te pustite CivilCraft da ga poveže s postojećim terenom i doda u projektirani teren.
keywords: potporni zid, potporni zidovi, okomita strana, zid umjesto nagiba, nagib po strani, nasip, planiranje, plato, plato zgrade, linija nožice pokosa, grupa planiranja, nagib iskopa, nagib nasipa, završna kota, projektirani teren, planiranje terena, značajna linija
from: 482319a6
---

Plato je ravna površina na jednoj visini. Od njegova ruba CivilCraft planira prema van vašim nagibom iskopa tamo gdje je teren viši od platoa i vašim nagibom nasipa tamo gdje je niži, dok nagib ne dotakne postojeći teren. Ta linija dodira je linija nožice pokosa. Plato i njegovi nagibi zamjenjuju postojeći teren unutar linije nožice pokosa i tako čine projektirani teren.

## Nacrtajte plato

Treba vam prvo postojeći teren.

1. Pritisnite {{key:G}}, ili kliknite {{ui:Plato}} u grupi **Projektiranje**.
   Natpis kaže „Plato: kliknite njegove vrhove. Enter ili dvostruki klik završava, Backspace uklanja zadnji, Esc odustaje.“
2. Kliknite vrhove platoa redom, bilo kojim smjerom. Plavi obris prati pokazivač.
3. Pritisnite {{key:Enter}} nakon posljednjeg vrha (najmanje tri).
   Plato je nacrtan i odabran. Počinje na visini terena u njegovu središtu, zaokružen na 0.1, s nagibom iskopa 2 : 1 i nagibom nasipa 3 : 1. Statusna traka kaže, na primjer, „Plato 1 na visini 254.3 (teren u njegovu središtu), iskop 2:1, nasip 3:1. Promijenite ih u Svojstvima.“

:::warning
Završite s {{key:Enter}}. Dvostruki klik također završava, ali u ovoj verziji odbacuje vrh na koji ste dvostruko kliknuli. Kliknite posljednji vrh jednom, pa pritisnite {{key:Enter}}.
:::

Obris platoa ne smije sam sebe presijecati („Obris platoa siječe sam sebe.“).

## Postavite visinu i nagibe

S odabranim platoom desni okvir prikazuje **Plato**:

1. **Naziv**.
2. **Visina**: ravna visina platoa.
3. **Nagib iskopa** i **Nagib nasipa**, kao H:V (2 znači 2 : 1). Oba moraju biti veća od 0.
4. **Površina platoa** i **Vrhovi** prikazani su radi pregleda.

Pritisnite {{key:Enter}} nakon svake vrijednosti. Linija nožice pokosa, projektirani teren i volumeni odmah se ažuriraju.

Ispod polja piše, na primjer, „Linija nožice pokosa: 48 linija nagiba (20 u iskopu, 28 u nasipu), najdalje 31.20 ft van.“ Tlocrt prikazuje liniju nožice pokosa i linije nagiba magentom.

## Kako se nalazi nožica pokosa

- Linije nagiba izlaze iz svakog ruba okomito na njega, otprilike svake dvadesetine veličine platoa.
- Na vanjskim kutovima razilaze se svakih 10°, pa nagib obilazi kut.
- Na unutarnjim kutovima jedna linija ide duž simetrale, gdje se susreću nagibi s dvaju rubova.
- Svaka linija penje se nagibom iskopa ili spušta nagibom nasipa dok ne dosegne teren.

## Nagibi po stranama i potporni zidovi

Pod **Strane i potporni zidovi** u Svojstvima platoa, platforme ili nasipa, svaka strana može biti planirana na svoj način. Strana 1 ide od prvog vrha koji ste kliknuli do drugog, strana 2 od drugog do trećeg, i tako dalje.

- **Sve strane**: **Nagnuto** koristi gore navedene nagibe iskopa i nasipa na svakoj strani; **Okomito: potporni zidovi** stavlja zid na svaku stranu.
- Po strani: **Nagibi iznad**, **Vlastiti nagibi** (upišite nagib iskopa i nasipa za tu stranu) ili **Okomito (potporni zid)**.
- Upišite nagib kao `3` ili `3:1` (vodoravno prema 1 okomito), `33%` ili `18.4°`; prikazuje se kao H:1. Vlastiti **Nagib iskopa** i **Nagib nasipa** platoa prihvaćaju isto.
- Okomita strana nema nasip: potporni zid ide duž ruba, od platoa dolje do postojećeg terena (u nasipu) ili od terena dolje do platoa (u iskopu). **Debljina zida** (zasad 0.3 m ili 1 ft) je koliko se teren stepenasto spušta od ruba platoa do postojećeg terena. Volumeni iskopa i nasipa ne uključuju nasip koji ta strana više nema.
- Gdje se zid spaja s nagnutom stranom, nagib obilazi kraj zida; dva zida se spajaju u kosom spoju.
- Pod poljima: duljina zidova, izložena ploha (visina × duljina), najviša i prosječna visina.

Tlocrt crta vanjsku plohu svakog zida kratkim crticama preko nje i njezinu visinu na oba kraja i na najvišoj točki (na sloju potpornih zidova, koji također ide u DXF i DWG). 3D prikaz prikazuje zidove kao tijela (Prikaz › Potporni zidovi), a izvozi GLB, OBJ i USD ih uključuju. Presjeci preko ruba prikazuju stepenicu.

**Upozorenja** (u Svojstvima i na ploči Problemi): zid viši od **Upozori iznad visine zida** (zasad 1.0 m ili 3.3 ft) „može zahtijevati projektiran zid ili dozvolu; provjerite lokalne propise“, te, kad upišete **Najstrmiji nagib koji tlo drži**, svaka strana čiji je nagib iskopa ili nasipa strmiji od toga. To su upozorenja: planiranje se i dalje gradi. Svaka promjena je jedan korak za {{key:Mod+Z}}.

## Pomaknite kutove

Odaberite plato, zatim povucite kvadratnu ručku na kutu. Svako povlačenje je jedan korak poništavanja. Dodavanje ili uklanjanje kuta još nije dostupno: obrišite plato i nacrtajte ga ponovno.

## Kad ne planira

Crveni okvir pod **Zemljani radovi** navodi plato i problem:

| Poruka | Što učiniti |
|---|---|
| „3 linije nagiba izlaze s terena prije nego ga dotaknu: plato je preblizu ruba terena ili previsoko/prenisko.“ | Pomaknite plato od ruba terena ili približite njegovu visinu terenu. |
| „Linija nožice pokosa siječe sama sebe (nagibi s različitih strana platoa upadaju jedni u druge). Preoblikujte plato ili promijenite nagibe.“ | Tipično za uske ili L-oblike platoa u dubokom iskopu ili visokom nasipu. Proširite plato, smanjite razliku ili strmije postavite nagibe. |
| „Obris platoa siječe sam sebe.“ | Ponovno nacrtajte vrhove redom oko platoa. |

Plato s problemom izostavlja se iz projektiranog terena i volumena dok se ne popravi.

## Pogledajte rezultat

1. Pod **Prikaz** postavite **Teren** na {{ui:Projektirano (planirano)}}.
   Izohipse sada idu ravno preko platoa i prate nagibe do linije nožice pokosa.
2. Pomaknite pokazivač preko platoa: statusna traka prikazuje visine **Tlo** i **Isplanirano**.
3. Pročitajte iskop i nasip pod **Zemljani radovi**; vidi [Obujmi zemljanih radova](topic:volumes).

Platoi se planiraju nakon koridora, redom kojim su nacrtani. Kasniji plato zamjenjuje sve što je ranije unutar njegove vlastite linije nožice pokosa.

## Obrišite plato

Odaberite ga i pritisnite {{key:Delete}} (na Macu Fn i delete), ili kliknite {{ui:Izbriši}}.

## Još nije izrađeno

Platoi su ravni: nagnuti platoi, značajne linije s promjenjivim nagibom, berme te planiranje do udaljenosti ili ciljne visine još nisu dostupni. Vidi [Još nije izrađeno](topic:not-built-yet).
