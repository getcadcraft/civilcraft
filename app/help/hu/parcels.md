---
title: Telkek rajzolása és jogi leírásuk
summary: Telek rajzolása a sarkai alapján, vagy az okiratból származó szakaszadatok beírása, a szakaszok zárásának ellenőrzése, az irányszögek és távolságok feliratozása az alaprajzon, bármely szakasz ívvé alakítása, és egy piszkozat jogi leírás másolása.
keywords: telkek, telekhatárok, ingatlanhatár, határ, okirat, térképvázlat, határleírás, irányszög, távolság, zárás, zárási hiba, pontosság, jogi leírás, kezdőpont, ív, sugár, terület, hold
from: 6793d6ce
---

A telkek az alaprajzon helyezkednek el; minden egyenes szakaszuk mentén látszik az irányszög és a távolság (egy ív a sugarát, hosszát és középponti szögét mutatja), középen pedig a nevük és a területük. Bekerülnek a PDF-ábrázolásba, valamint a DWG- és DXF-exportba, a `V-PROP` (vonalak) és a `V-PROP-TEXT` (feliratok) rétegeken. Minden a **Telkek** alatt található a jobb oldali panelen, ha semmi sincs kijelölve.

## Telek rajzolása

1. Kattintson a **Telek rajzolása** gombra.
2. Kattintson a sarkokra, a kezdőponttól kezdve. A közeli felmérési pontra kattintva a program az adott pont pontos helyét veszi.
3. Kattintson újra az első sarokra, vagy nyomja meg az {{key:Enter}} billentyűt a befejezéshez. A {{key:Backspace}} visszavonja az utolsó sarkot; az {{key:Esc}} eldobja az eddigi sarkokat; újabb lenyomásával kilép az eszközből.

## Okiratban szereplő szakaszadatok beírása

1. Kattintson az **Okirati szakaszok beírása** gombra.
2. Adja meg, honnan indulnak a szakaszok: egy felmérési pont számát, vagy egy északi és egy keleti koordinátát.
3. Írja be vagy illessze be a szakaszokat, soronként egyet:
   - egy egyenes: irányszög és távolság, például `N 45°30'15" E 125.50`. A `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` és az azimutok (`AZ 45°30'15"`) is működnek; a „thence” szó, a vesszők és a „feet” figyelmen kívül maradnak.
   - egy ív: `C R 300 L 52.36 right` (sugár és ívhossz), vagy `C R 300 D 10°00'00" left` (sugár és középponti szög). Az ív az előtte lévő szakasz folytatása; ha nem az, adja meg a húrirányát is: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - a `#` jellel kezdődő sor megjegyzés.
4. Ahogy gépel, a párbeszédpanel megmutatja a szakaszok hosszát, a **zárási hibát** (mennyire térnek el a kiindulástól, és merre), a **pontosságot** (a hossz osztva a zárási hibával, például 1 : 10 000), valamint a területet. A nem értelmezhető sorokat a program a sorszámukkal együtt listázza.
5. Kattintson a **Telek hozzáadása** gombra. Ha a szakaszok nem záródnak, a telek egyenes szakasszal záródik a hézagon: ellenőrizze a szakaszokat az okirathoz képest. Ha a hibát egy mezőmérés szakaszai között el akarja osztani, előbb igazítsa.

## Ívek

A telek **Tulajdonságai** között minden szakasznak van egy **Sugár** mezője. Írjon be egyet, hogy a szakasz ív legyen ugyanazon két sarok között (a sugár nem lehet kisebb a sarkok távolságának felénél, ezt a program elutasítja), és az **Ívek** alatt válassza a **Jobbra** vagy a **Balra** lehetőséget: a jobbra ívelő szakasz középpontja a haladási irányhoz képest jobbra esik, ahogy az okiratban is. Ha üresen hagyja a sugár mezőt, a szakasz újra egyenes lesz. Minden változtatás egy lépés: a {{key:Mod+Z}} visszavonja.

## A jogi leírás

A telek Tulajdonságai a rajzból írt jogi leírással végződnek:

- „Kiindulva” az Ön által megadott **Kezdőpont** (például „a 4. telek északkeleti sarka”), különben az első sarok északi és keleti koordinátája, vagy az a felmérési pont, ahonnan a szakaszok indultak.
- „majd” minden szakasz: irányszög és távolság, vagy ív a sugarával, ívhosszával, középponti szögével, húrirányával és húrtávolságával.
- „Területe” a terület négyzetlábban és holdban (méteres projektben négyzetméterben és hektárban).

A **Másolás** a vágólapra teszi; a **Letöltés szövegként** `.txt` fájlként menti.

:::warning
A jogi leírás a rajzból készült piszkozat, nem földmérési dokumentum. Mielőtt bárki támaszkodna rá, egy okleveles földmérőnek kell ellenőriznie a nyilvántartással, és alá kell írnia.
:::

Kattintson a telek belsejébe az alaprajzon a kijelöléshez; a {{key:Delete}} billentyű eltávolítja. A telkek a projektfájlban mentődnek.
