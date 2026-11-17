---
title: Sokszögvonal megadása és kiigazítása iránytű-szabállyal
summary: Írja be a mezőszögeket vagy irányszögeket és a távolságokat, ellenőrizze a szögzárást, a vonalzárást és a pontosságot, végezze el a kiigazítást iránytű-szabállyal, és adja hozzá az állomásokat felmérési pontként, a hurkot pedig telekként.
keywords: sokszögvonal, zárt sokszögvonal, hurok, jobbra mért szögek, visszatekintés, irányszögek, távolságok, zárás, zárási hiba, pontosság, iránytű-szabály, bowditch, kiigazítás, felmérés
from: 56ce5a8c
---

A sokszögvonal mért szakaszok sora: minden állomáson egy szög (vagy irányszög) és egy távolság a következő pontig. Ha semmi nincs kijelölve, kattintson a jobb oldali panelen, a **Sokszögvonal** alatt a **Sokszögvonal megadása** gombra.

## Hol kezdődik és hol ér véget

1. **Kezdőpont felmérési pontja**: annak száma. Vagy adja meg az északi és a keleti koordinátát.
2. **A szakaszok**: **Jobbra mért szögek és távolságok**, vagy **Irányszögek és távolságok**.
3. Szögeknél adja meg, honnan indulnak: egy **Visszatekintési felmérési pont**, vagy **az azimutja** (az első állomástól a visszatekintési pont felé, északtól óramutató járásával megegyezően).
4. **Vég**: **vissza a kezdőponthoz (hurok)**, vagy **felmérési pont** és annak száma (nyitott sokszögvonal ismert pontok között).

## Írja be a szakaszokat

Egy szakasz egy sorba kerül: először a szög, utána a távolság, végül – ha akarja – annak az állomásnak a neve, amelyre a szakasz vezet:

- Jobbra mért szögek, az állomáson, ahonnan a szakasz indul, az előző állomástól a következő felé, óramutató járásával megegyezően: `270°00'10" 125.50 B`. A `270-00-10`, a `270 00 10` és a `270.0028` is működik.
- Irányszögek: `N 45°30'15" E 125.50 B`, vagy azimut egy szóként: `AZ 45-30-15 125.50 B`.
- Hurok szögekkel esetén a `close` szóval és utána a kezdőponton a szöggel fejezze be, amelyet az utolsó állomástól a második felé mérünk: `close 270°00'05"`. Ez ellenőrzi a szögeket.

A nem olvasható sorokat a sorszámukkal együtt listázza. A „feet” szó, a vesszők és a `#` kezdetű megjegyzéssorok rendben vannak.

## A zárás kiolvasása

Ahogy gépel, a párbeszédpanel megmutatja:

- **Szögzárási hiba**: mennyire tér el a szögek összege a zárástól, és az egyes szögek mekkora részt vesznek ki belőle. Záró szög nélkül a szögek nincsenek ellenőrizve, és a bennük lévő hiba a vonalzárási hibában jelenik meg.
- **Vonalzárási hiba**: mennyivel tér el a sokszögvonal vége attól, ahol lennie kellene, és milyen irányban.
- **Pontosság**: a sokszögvonal hossza osztva a vonalzárási hibával: 1 : 10 000 azt jelenti, hogy 1 ft-ot 10 000 ft-en.
- A kiigazítás utáni állomások, és hogy az egyes állomások mennyit mozdultak el.

## A kiigazítás

Először a szögzárási hibát egyenlően osztja el a szögek között. Ezután a vonalzárási hibát iránytű-szabállyal (Bowditch) osztja el a szakaszokon: minden állomás a hibával ellentétes irányban mozdul el, arányosan azzal a hosszal, amelyet az eléréséig megtett, így a sokszögvonal pontosan oda ér, ahová kell.

:::note
Az iránytű-szabály szokásos kiigazítás, nem legkisebb négyzetes módszer, és nem súlyozza a szögeket a távolságokhoz képest. Hogy a pontosság elég jó-e, azt az Ön saját szabványai és a helyi szabályozás döntik el.
:::

## Az eredmény felhasználása

- **Hozzáadás felmérési pontként**: a kiigazított állomások felmérési pontokká válnak az Ön által adott nevekkel (különben a következő szabad számokkal), leírásuk `TRAV`, magasság nélkül. A hurok utolsó állomása a kezdőpontja, ezért nem adódik hozzá kétszer. Egy lépésben: {{key:Mod+Z}} visszavonja.
- **Hozzáadás telekként** (hurkok): a kiigazított állomások [telekké](topic:parcels) válnak, a feliratukkal és a jogi leírásukkal együtt.
- **Jelentés (CSV)**: a zárási sorok, majd minden állomás iránya, távolsága, a kiigazítás előtti és utáni koordinátái, valamint a javításai.
