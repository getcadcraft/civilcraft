---
title: Kontroly elektrických vedení
summary: Co CivilCraft kontroluje na každém vedení a kabelu, vždy aktuálně: světlé výšky, rozteče, výkyv, vytržení, zatížení podpěr a jejich dimenzování, armatury, kotvení, základy, chybějící údaje, připojení, přetížení a úbytek napětí.
keywords: kontroly, světlá výška, překážka, křížení, rozteč fází, výkyv izolátoru, vytržení, zatížení podpěry, jmenovité zatížení, dimenzování, základ, kotvení, armatura, traverza, úbytek napětí, přetížení, chybějící údaje, odpojeno
from: e6a0da47
---

**Kontroly** v části Elektrická vedení vypisují každý problém: červeně to, co nevyhovuje, oranžově varování. Kliknutím na problém vyberete vedení, podpěru, kabel nebo zařízení, kterého se týká. Nevyhovující podpěry a rozpětí jsou při otevřeném pracovním prostoru na půdorysu obkrouženy červeně.

:::warning
Pomocný nástroj pro návrh: jde o kontroly vašeho návrhu podle vašich vlastních pravidel, nikoli o certifikaci.
:::

## Světlé výšky

Nejnižší fáze vodiče se sleduje podél každého rozpětí při každém zatěžovacím stavu. Její nejnižší světlá výška nad terénem musí dosáhnout **pravidla světlé výšky** vedení. Tam, kde rozpětí kříží **překážku** (nakreslenou tlačítkem {{ui:Překážka}}: bod nebo čára, s výškou nad terénem a vlastním pravidlem světlé výšky), se světlá výška nad vrcholem překážky kontroluje stejným způsobem.

**Co na terénu stojí nad zemí, se také počítá.** Jednotlivé rostliny (jejich koruna při dospělé šíři a výšce), živé ploty a záhony (nejvyšší druh v nich) a zdi (jejich horní hrana) jsou pod vedením překážkami, aniž by se musely znovu kreslit. Řídí se pravidly nastavenými v {{ui:Zatěžovací stavy a limity…}}: **Rostliny v Krajině pod vedením** (vzorové sady používají *Stromy a rostliny*, 3 m) a **Zdi v Krajině pod vedením** (*Budova*). Zvolte **Nekontrolovat**, pokud je chcete vynechat. Světlá výška se měří svisle nahoru od vrcholu rostliny nebo zdi k vodiči v místě, kde rozpětí přes ně prochází. Vodorovná vzdálenost ke koruně vedle vedení se nekontroluje. Přesun stromu nebo zvednutí zdi změní kontroly okamžitě.

Vaše pravidla světlé výšky jsou vaše vlastní: otevřete je tlačítkem **Pravidla…** vedle libovolného **pravidla světlé výšky** (nebo v {{ui:Zatěžovací stavy a limity…}}) a přidejte, přejmenujte, změňte nebo odstraňte.

## Rozteče a výkyv

- **Požadovaná rozteč fází**: k·√(průvěs + délka izolátoru) + U/150, s průvěsem při teplém stavu a napětím U v kV (běžný tvar; k je dáno vaší sadou pravidel). Porovnává se s roztečí fází na traverze.
- **Výkyv izolátoru** u závěsných podpěr při větrném stavu: atan(příčné zatížení ÷ svislé zatížení), oproti největšímu výkyvu podle sady pravidel.
- **Vytržení**: závěsná podpěra, která je níže než její sousedé, může být za studena vytažena nahoru; označí se.

## Zatížení podpěr a dimenzování

Pro každou podpěru a každý zatěžovací stav, se všemi vodiči vedení:

- **Příčné**: vítr na metr × větrné rozpětí (polovina součtu obou rozpětí), plus 2·H·sin(úhel ÷ 2) v zalomení.
- **Podél vedení**: rozdíl napětí obou stran v koncové nebo úhlové podpěře; u závěsné podpěry jen při námraze na jedné straně (každé rozpětí se počítá samostatně, což je na straně bezpečnosti).
- **Svislé**: svislé zatížení na metr × váhové rozpětí (mezi nejnižšími body po obou stranách) plus zařízení.

Vodorovné zatížení se přepočítá na jmenovitý bod podpěry (ekvivalentní zatížení = zatížení × výška uchycení ÷ výška jmenovitého bodu) a porovná se s jejím **jmenovitým zatížením** × součinitel ze sady pravidel. Je-li podpěra příliš slabá, navrhne se nejmenší podpěra téhož materiálu ve vaší knihovně, která ho unese. Podpěra s **kotvením** předává vodorovné zatížení kotvení, které nese zatížení ÷ sin(úhel kotvení) a kontroluje se podle své vlastní hodnoty.

Armatury (svorky, izolátory, traverzy) se kontrolují podle jmenovitého zatížení: kotevní armatura nese napětí vodiče, závěsná armatura svůj podíl svislého a příčného zatížení. Zobrazený **základ** je hloubka podpěry v zemi a jáma o něco širší než její patka.

## Data, připojení a proud

- Položka s prázdným povinným polem nebo klíč, který není v knihovně.
- Konec kabelové trasy nebo zařízení, které není připojeno k ničemu.
- **Úbytek napětí** a **proud** od každého zdroje (zařízení označené jako zdroj) k odběrům (kW a účiník u zařízení) podél nadzemních rozpětí a kabelů: √3·I·L·(R cos φ + X sin φ), s R při 20 °C. Proud vyšší než jmenovitý proud kabelu nebo větší úbytek, než dovoluje sada pravidel, se označí.
