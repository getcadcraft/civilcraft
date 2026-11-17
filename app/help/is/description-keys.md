---
title: Lýsingarlyklar og línukóðar
summary: Breyttu reitskóðum í punktahópa með lýsingum og tengdu kóðaða punkta í línur (byrjun, endi, lokun) sem verða brotlínur.
keywords: lýsingarlyklar, reitskóðar, línukóðar, mælimyndir, línuteikning, byrjun, endir, loka, punktahópar, kóðar, mælingakóðar, gagnasafnari, brotlínur, kantsteinn, jaðar slitlags
from: b3d1af8d
---

Mælingamenn á vettvangi kóða hverja mælingu: `EP` fyrir brún slitlags, `TC` fyrir efri brún kantsteins, `BLDG` fyrir horn byggingar. Kóðinn er fyrsta orðið í lýsingu punktsins. CivilCraft raðar punktum í hópa eftir honum og breytir línukóðum á eftir honum í línur.

## Línukóðar

Línukóði er orðið rétt á eftir reitskóðanum:

| Lýsing | Merking |
|---|---|
| `EP B` | Byrja nýja brún slitlags-línu í þessum punkti |
| `EP` | Halda áfram með núverandi EP-línu |
| `EP E` | Ljúka núverandi EP-línu í þessum punkti |
| `BLDG C` | Loka byggingunni: tengja þennan punkt aftur við fyrsta punkt línunnar |

Punktar með sama kóða eru tengdir í röð punktanúmera. Ólíkir kóðar eru ólíkar línur, jafnvel þótt þeir deili hópi, þannig að `EP1` og `EP2` gefa tvær brúnir í einu. Kóði sem notar aldrei línukóða er tengdur í gegnum alla sína punkta, eins og í eldri útgáfum.

Línur í hópi sem notaður er sem **Brotlína** verða brotlínur, ein fyrir hverja línu, þannig að kantsteinn með bili er ekki teygður yfir bilið. Línur í öðrum hópum eru teiknaðar á teikninguna (lag V-NODE-LINE) og fara út í DXF, DWG og PDF.

Orðin fyrir byrjun, endi og lokun eru `B`, `BEG`, `START`; `E`, `END`; og `C`, `CLO`, `CLOSE`. Breyttu þeim, eða slökktu á línukóðum, í glugganum hér að neðan.

## Lýsingarlyklar

Lýsingarlykill breytir kóða í punktahóp, notkun og ítarlega lýsingu.

1. Undir **Punktar** smelltu á {{ui:Lýsingarlyklar og línukóðar}}.
2. Smelltu á {{ui:Bæta við lykli}} og fylltu út reitina:
   - **Kóði**: reitskóðinn sem á að passa við. `*` stendur fyrir hvaða stafi sem er og `?` fyrir einn staf, þannig að `EP*` nær EP, EP1 og EP12.
   - **Hópur**: punktahópurinn sem þessir punktar tengjast (tómt = kóðinn sjálfur). `EP*` með hópnum `EP` setur EP1 og EP2 í einn hóp meðan þær eru áfram aðskildar línur.
   - **Notkun**: Punktar, Brotlína eða Sleppt, fyrir það þegar hópurinn birtist fyrst (eða láttu það vera í töflunni **Punktar**).
   - **Lýsing**: langa heitið, sem birtist í **Eiginleikum** punkts.
3. Dálkurinn **Punktar** telur punktana sem hver lykill nær þegar þú skrifar. Fyrsti lykillinn sem passar við kóða vinnur.
4. Smelltu á {{ui:Beita}}. Hóparnir, yfirborðið og teikningin fylgja í einu skrefi: {{key:Mod+Z}} afturkallar það.

Hópur heldur notkuninni sem þú gafst honum í töflunni **Punktar**; notkun lykils ákvarðar hana aðeins fyrir hóp sem er nýr. Lyklarnir og línukóðarnir eru vistaðir í verkefnisskránni.
