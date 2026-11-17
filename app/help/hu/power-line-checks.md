---
title: Távvezetéki ellenőrzések
summary: Amit a CivilCraft minden vezetéken és kábelen ellenőriz, mindig naprakészen: szabad magasság, fázistávolság, lengés, felemelkedés, tartóterhelés és méretezés, szerelvények, feszítőkötelek, alapozás, hiányzó adatok, csatlakozások, túlterhelések és feszültségesés.
keywords: ellenőrzések, szabad magasság, földfelszíni szabad magasság, akadály, keresztezés, fázistávolság, szigetelőlengés, felemelkedés, tartóterhelés, névleges terhelés, méretezés, alapozás, feszítőkötél, szerelvény, keresztkar, feszültségesés, túlterhelés, hiányzó adat, nincs csatlakoztatva
from: e6a0da47
---

A Távvezetékek szakaszban az **Ellenőrzések** felsorolja az összes problémát: a piros a hibát, a borostyán a figyelmeztetést jelöli. Kattintson egy elemre, és a kijelölés a vezetéket, tartót, kábelt vagy berendezést választja ki, amelyre vonatkozik; a hibás tartók és fesztávok pirossal vannak bekarikázva a tervrajzon, amíg a munkaterület nyitva van.

:::warning
Tervezési segédeszköz: ezek a tervezés ellenőrzései a saját szabályai szerint, nem tanúsítványok.
:::

## Szabad magasságok

A vezető legalacsonyabb fázisát minden fesztávon, minden terhelési esetben követi. Legalacsonyabb szabad magasságának el kell érnie a vonal **Szabad magassági szabályát**. Ahol a fesztáv egy **akadályt** keresztez (a {{ui:Akadály}} eszközzel rajzolva: pont vagy vonal, a talajtól mért magassággal és saját szabad magassági szabállyal), az akadály teteje feletti szabad magasságot ugyanígy ellenőrzi.

**A Tájrendezési munkaterület talaj fölé helyezett elemei is számítanak.** Az egyes növények (koronájuk érett szélességével és magasságával), a sövények és ültetési ágyások (bennük a legmagasabb fajjal) és a falak (tetejükkel) a vonal alatt akadályként számítanak, anélkül, hogy újra kellene rajzolni őket. A {{ui:Terhelési esetek és határértékek…}} menüben beállított szabályok érvényesek rájuk: **Tájrendezési növények a vonal alatt** (a mintakészletekben a *Fák és növények*, 3 m) és **Tájrendezési falak a vonal alatt** (*Épület*); a **Nincs ellenőrizve** választásával kihagyhatók. A szabad magasságot egyenesen felfelé mérjük a növény vagy a fal tetejétől a vezetőig, ott, ahol a fesztáv keresztezi; a vonal melletti korona oldalirányú távolságát nem ellenőrizzük. Egy fa áthelyezése vagy egy fal megemelése azonnal megváltoztatja az ellenőrzéseket.

A szabad magassági szabályok a saját szabályai: bármelyik **Szabad magassági szabály** melletti **Szabályok…** gombbal (vagy a {{ui:Terhelési esetek és határértékek…}} menüből) nyissa meg őket, és adjon hozzá, nevezzen át, módosítson vagy távolítson el szabályt.

## Fázistávolság és lengés

- **Szükséges fázistávolság**: k·√(lehajlás + szigetelőhossz) + U/150, a meleg eset lehajlásával és az U feszültséggel kV-ban (gyakori alak; a k a szabálykészlet szerinti érték). Összevetve a keresztkar fázistávolságával.
- **Szigetelő-lengés** függesztő tartókon, a szél esetében: atan(keresztirányú terhelés ÷ függőleges terhelés), a szabálykészlet legnagyobb lengésével összevetve.
- **Felemelkedés**: a szomszédjainál alacsonyabb függesztő tartó hidegben felemelkedhet; megjelölésre kerül.

## Tartóterhelések és méretezés

Minden tartóra és terhelési esetre, a vonal minden vezetőjével:

- **Keresztirányú**: szél méterenként × szél-fesztávolság (a két fesztáv fele), plusz 2·H·sin(szög ÷ 2) sarokban.
- **Vonal mentén**: a két oldal feszítőerejének különbsége végtartónál vagy szögtartónál; függesztő tartónál csak egy oldalon jég esetén (minden fesztávot külön számítva, ami a biztonságos oldalra téved).
- **Függőleges**: a függőleges terhelés méterenként × súly-fesztávolság (a két oldal legalacsonyabb pontjai között), plusz a berendezés.

A vízszintes terhelést a tartó névleges pontjára vetítik (egyenértékű terhelés = terhelés × rögzítési magasság ÷ a névleges pont magassága), és összevetik a tartó **névleges terhelésével** × a szabálykészlet tényezőjével. Ha túl gyenge, a könyvtárban ugyanabból az anyagból a legkisebb olyan tartót javasolja, amely elbírja. A **feszítőkötéllel** rendelkező tartó a vízszintes terhelést a feszítőkötélre adja át, amely terhelés ÷ sin(feszítőkötél szöge) értéket visel, és a saját teherbírásával összevetve ellenőrzik.

A szerelvényeket (bilincsek, szigetelők, keresztkarok) a névleges terhelésükkel összevetve ellenőrzik: a rögzítő szerelvény a vezető feszítőerejét viseli, a függesztő szerelvény a függőleges és keresztirányú terhelés részét. A megjelenített **alapozás** a tartó talajba nyúló mélysége és a talpánál valamivel szélesebb gödör.

## Adatok, csatlakozások és áram

- Olyan elem, amelynek kötelező mezője üres, vagy amelynek kulcsa nincs a könyvtárban.
- Kábelútvonal végpontja vagy berendezés, amely semmihez nincs csatlakoztatva.
- **Feszültségesés** és **áram** minden forrástól (a forrásként jelölt berendezéstől) a fogyasztókig (kW és teljesítménytényező a berendezésen), a szabadvezetékes fesztávok és kábelek mentén: √3·I·L·(R cos φ + X sin φ), az R 20 °C-on. Az áramterhelhetőségnél nagyobb áram, vagy a szabálykészlet által megengedettnél nagyobb feszültségesés jelölésre kerül.
