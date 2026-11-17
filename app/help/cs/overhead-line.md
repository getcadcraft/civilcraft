---
title: Nakreslení venkovního vedení
summary: Umístěte podpěry na plán, nechte CivilCraft určit roli každé podpěry a úseky mezi koncovými podpěrami, a přesouvejte podpěry na plánu nebo na profilu vedení.
keywords: venkovní vedení, podpěra, stožár, pole, úsek, koncová podpěra, úhel, závěs, profil, výška, traverza, kotva, kotvení
from: b8e5e272
---

## Nakreslete ho

1. Mějte povrch: terén pod vedením pochází z něj ([Vytvořte povrch](topic:build-surface)). Podpěra bez terénu pod sebou je uvedena v **Kontrolách**; místo toho zadejte její **Výšku terénu** ve Vlastnostech.
2. Klikněte na {{ui:Vedení}} ve skupině **Venkovní vedení** a klikněte na každou podpěru na plánu.
3. Poslední podpěru dvakrát klikněte, nebo stiskněte {{key:Enter}}.

Vedení dostane vodič, podpěru a vybavení, které jste naposledy použili na tomto počítači (poprvé: příklady z knihovny). Změňte je ve Vlastnostech.

## Vedení ve Vlastnostech

Vyberte vedení (klikněte na pole), abyste nastavili jeho **Vodič**, **Vodiče na okruh**, **Okruhy**, **Napětí**, **Pravidlo odstupu**, který musí dodržet nad terénem, a vybavení **Na každé podpěře** (traverza, izolátory, armatury). Tabulka uvádí jeho **úseky** s jejich řídicím polem, každodenním napětím a zatěžovacím stavem, který je řídí.

## Podpěry

Klikněte na podpěru, abyste ji vybrali. Ve Vlastnostech:

- **Podpěra**: její položka knihovny. Když je příliš slabá, {{ui:Použít …}} vloží nejmenší podpěru stejného materiálu ve vaší knihovně, která unese zatížení.
- **Role**: Automaticky, Závěsná, Úhlová nebo Koncová. Automaticky znamená: první a poslední podpěra jsou koncové; zlom nad úhel v sadě pravidel dělá úhlovou podpěru; větší zlom koncovou.
- **Výška nad terénem**: prázdné pole ji převezme z položky knihovny (její délka minus hloubka v zemi).
- **Také na této podpěře**: přídavné vybavení, například **kotvení** (lano). Podpěra s kotvením předává tah vedení svému kotvení.
- **Stávající podpěra**: kontroluje se jako ostatní, ale nezapočítává se do výměr.

{{ui:Podpěra}} přidá podpěru na pole nejblíže vašemu kliknutí. Přetažením podpěry na plánu ji přesunete. {{key:Delete}} ji odstraní (vedení si ponechá alespoň dvě).

Úseky vedou mezi koncovými podpěrami: uvnitř úseku vodič volně prochází závěsnými svorkami, takže jedno napětí platí pro celý úsek.

## Profil vedení

Klikněte na {{ui:Profil}} (nebo na **Profil** ve Vlastnostech vedení). Panel pod plánem ukazuje terén podél vedení, každou podpěru od terénu k jejímu vrcholu, nejnižší fázi vodiče při **Zatěžovacím stavu**, který zvolíte, a odstup, který vedení musí dodržet, jako čárkovanou čáru. Pole, které neprojde, je červené; číslo pod každým polem je jeho nejmenší odstup.

- **{{ui:Vedení}}** vybere venkovní vedení k zobrazení. Výběr jiného vedení nebo jeho podpěry na plánu přepne profil na něj.
- Najeďte kurzorem nad profil: vodicí čára ho sleduje a popisek ukazuje vzdálenost podél vedení, terén, vodič a odstup v tomto místě (a řekne, kdy je odstup pod pravidlem vedení).
- {{ui:Měřit}} v liště profilu: klikněte na dva body a získáte vodorovnou vzdálenost, výškový rozdíl, přímou vzdálenost a sklon mezi nimi. Klik blízko terénu, vodiče nebo vrcholu podpěry se k němu přichytí. Pro ukončení znovu klikněte na {{ui:Měřit}}.
- Překážky, které vedení překračuje, vyčnívají z terénu: nakreslené jako pruhy, rostliny z Krajiny jako svá koruna, zdi jako pruhy (viz [Kontroly venkovního vedení](topic:power-line-checks#clearances)). Kabelové trasy a potrubí, které vedení překračuje, jsou označeny pod terénem u svého vrcholu, se svým názvem.

- Přetažením podpěry do strany ji posunete podél vedení.
- Přetáhněte její vrchol nahoru nebo dolů a nastavíte její výšku nad terénem.
