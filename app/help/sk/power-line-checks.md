---
title: Kontroly elektrických vedení
summary: Čo CivilCraft kontroluje na každom vedení a kábli, vždy aktuálne: odstupy, rozstupy, výchylku, nadvihnutie, zaťaženie podpôr a dimenzovanie, armatúry, kotevné lano, základy, chýbajúce údaje, pripojenia, preťaženia a úbytok napätia.
keywords: kontroly, odstup, výška nad terénom, prekážka, križovanie, fázový rozstup, výchylka izolátora, nadvihnutie, zaťaženie podpory, menovité zaťaženie, dimenzovanie, základ, kotevné lano, lano, armatúra, traverza, úbytok napätia, preťaženie, chýbajúce údaje, odpojené
from: e6a0da47
---

**Kontroly** v časti Elektrické vedenia uvádza každý problém: červenou to, čo zlyháva, a oranžovou upozornenia. Kliknutím na jeden vyberiete vedenie, podperu, kábel alebo zariadenie, ktorého sa týka; zlyhávajúce podpery a úseky sú v pôdoryse počas otvoreného pracovného priestoru orámované červenou.

:::warning
Pomôcka pri návrhu: ide o kontroly vášho návrhu podľa vašich vlastných pravidiel, nie o certifikáciu.
:::

## Odstupy

Najnižšia fáza vodiča sa sleduje po celom každom úseku pri každom zaťažovacom stave. Jej najnižší odstup nad terénom musí dosiahnuť **Pravidlo odstupu** vedenia. Kde úsek križuje **prekážku** (nakreslenú pomocou {{ui:Prekážka}}: bod alebo čiara, s výškou nad terénom a vlastným pravidlom odstupu), odstup nad vrcholom prekážky sa kontroluje rovnakým spôsobom.

**Počíta sa aj to, čo pracovný priestor Krajina kladie nad terén.** Jednotlivé rastliny (ich koruna pri dospelej šírke a výške), živé ploty a záhony (najvyššie druhy v nich) a múry (ich vrch) sú pod vedením prekážkami, bez toho, aby ste ich znova kreslili. Zachovávajú pravidlá nastavené v {{ui:Zaťažovacie stavy a limity…}}: **Rastliny Krajiny pod vedením** (vzorové sady používajú *Stromy a rastliny*, 3 m) a **Múry Krajiny pod vedením** (*Budova*); ak ich chcete vynechať, vyberte **Nekontrolovať**. Odstup sa meria priamo nahor od vrchu rastliny alebo múra k vodiču v mieste, kde ho úsek križuje; vodorovná vzdialenosť ku korune vedľa vedenia sa nekontroluje. Presun stromu alebo zvýšenie múra okamžite zmení kontroly.

Vaše pravidlá odstupu sú vaše vlastné: otvorte ich tlačidlom **Pravidlá…** vedľa ľubovoľného **Pravidla odstupu** (alebo cez {{ui:Zaťažovacie stavy a limity…}}) a pridajte, premenujte, zmeňte alebo odstráňte.

## Rozstupy a výchylka

- Potrebný **fázový rozstup**: k·√(previsnutie + dĺžka izolátora) + U/150, s previsnutím pri teplom stave a napätím U v kV (bežný tvar; k je podľa vašich pravidiel). Porovnáva sa s fázovým rozstupom traverzy.
- **Výchylka izolátora** na závesných podperách pri veternom stave: atan(priečne zaťaženie ÷ zvislé zaťaženie), porovnaná s najväčšou výchylkou podľa vašich pravidiel.
- **Nadvihnutie**: závesná podpera nižšia ako jej susedia môže byť v chlade nadvihnutá; označí sa.

## Zaťaženie podpôr a dimenzovanie

Pre každú podperu a zaťažovací stav so všetkými vodičmi vedenia:

- **Priečne**: vietor na meter × veterné rozpätie (polovica oboch úsekov), plus 2·H·sin(uhol zalomenia ÷ 2) pri zalomení.
- **Pozdĺž vedenia**: rozdiel napätí oboch strán na koncovej alebo uhlovej podpere; na závesnej podpere iba pri námraze na jednej strane (každý úsek sa rieši samostatne, čo je na bezpečnej strane).
- **Zvislé**: zvislé zaťaženie na meter × váhové rozpätie (medzi najnižšími bodmi na oboch stranách) plus zariadenie.

Vodorovné zaťaženie sa prenesie do menovitého bodu podpery (ekvivalentné zaťaženie = zaťaženie × výška uchytenia ÷ výška menovitého bodu) a porovná sa s jej **menovitým zaťažením** × koeficient pravidiel. Ak je slabé, navrhne sa najmenšia podpera rovnakého materiálu vo vašej knižnici, ktorá ho unesie. Podpera s **kotevným lanom** prenáša vodorovné zaťaženie do lana, ktoré nesie zaťaženie ÷ sin(uhol lana) a kontroluje sa voči svojmu vlastnému menovitému zaťaženiu.

Armatúry (svorky, izolátory, traverzy) sa kontrolujú voči svojmu menovitému zaťaženiu: kotviaca armatúra nesie napätie vodiča, závesná armatúra svoj podiel zvislého a priečneho zaťaženia. Zobrazený **základ** je hĺbka podpery v zemi a jama o niečo širšia ako jej päta.

## Údaje, pripojenia a prúd

- Položka s prázdnym potrebným poľom alebo kľúč, ktorý nie je v knižnici.
- Koniec trasy kábla alebo zariadenie, ktoré nie je pripojené k ničomu.
- **Úbytok napätia** a **prúd** z každého zdroja (zariadenie označené ako zdroj) k záťažiam (kW a účinník na zariadení), pozdĺž nadzemných úsekov a káblov: √3·I·L·(R cos φ + X sin φ), pri R pri 20 °C. Prúd nad prúdovú zaťažiteľnosť kábla alebo úbytok väčší, než dovoľujú pravidlá, sa označí.
