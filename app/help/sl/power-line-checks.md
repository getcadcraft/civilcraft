---
title: Preverjanja daljnovodov
summary: Kaj CivilCraft preverja pri vsaki liniji in kablu, vedno posodobljeno: odmike, razmike, zanihanje, dvig, obremenitve podpor in dimenzioniranje, okove, zatege, temelje, manjkajoče podatke, povezave, preobremenitve in padec napetosti.
keywords: preverjanja, odmik, odmik od tal, ovira, križanje, razmik faz, zanihanje izolatorja, dvig, obremenitev podpore, nazivna obremenitev, dimenzioniranje, temelj, zatega, vlečna vrv, okov, prečka, padec napetosti, preobremenitev, manjkajoči podatki, odklopljeno
from: e6a0da47
---

**Preverjanja** v razdelku Daljnovodi navajajo vse težave: rdeče za to, kar ne uspe, in jantarno za opozorila. Kliknite eno od njih, da izberete linijo, podporo, kabel ali opremo, na katero se nanaša; podpore in razponi, ki ne ustrezajo, so v tlorisu obkroženi z rdečo, dokler je delovno okolje odprto.

:::warning
Pripomoček za načrtovanje: to so preverjanja vašega načrta glede na vaša lastna pravila, ne potrdilo.
:::

## Odmiki

Najnižja faza vodnika se spremlja vzdolž vsakega razpona pri vsakem obtežnem primeru. Njen najnižji odmik nad tlemi mora doseči **pravilo odmika** črte. Kjer razpon seka **oviro** (narisano z {{ui:Ovira}}: točka ali črta, z njeno višino nad tlemi in lastnim pravilom odmika), se odmik nad vrhom ovire preveri enako.

**Tudi tisto, kar delovno okolje Krajina postavi nad tla, šteje.** Posamezne rastline (njihova krošnja pri zreli širini in višini), živice in sadilne grede (najvišja vrsta v njih) ter zidovi (njihov vrh) so pod črto ovire, brez ponovnega risanja. Ohranijo pravila, nastavljena v {{ui:Obtežni primeri in omejitve …}}: **Krajinske rastline pod črto** (primerjalni nabori uporabljajo *Drevesa in rastline*, 3 m) in **Krajinski zidovi pod črto** (*Stavba*); izberite **Ni preverjeno**, da jih izpustite. Odmik se meri naravnost navzgor od vrha rastline ali zidu do vodnika tam, kjer ga razpon seka; razdalja vstran do krošnje ob črti se ne preverja. Premik drevesa ali dvig zidu takoj spremeni preverjanja.

Vaša pravila odmikov so vaša: odprite jih z **Pravila …** poleg katerega koli **pravila odmika** (ali {{ui:Obtežni primeri in omejitve …}}), da jih dodate, preimenujete, spremenite ali odstranite.

## Razmiki in zanihanje

- Potreben **razmik faz**: k·√(povesanje + dolžina izolatorja) + U/150, s povesanjem v vročem primeru in napetostjo U v kV (pogosta oblika; k je iz vašega nabora pravil). Primerja se z razmikom faz prečke.
- **Zanihanje izolatorja** na viseči podpori, pri vetrnem primeru: atan(prečna obremenitev ÷ navpična obremenitev), v primerjavi z največjim zanihajem iz nabora pravil.
- **Dvig**: viseča podpora, nižja od sosednjih, se lahko pozimi dvigne; označi se.

## Obremenitve podpor in dimenzioniranje

Za vsako podporo in obtežni primer, z vsemi vodniki črte:

- **Prečno**: veter na meter × vetrni razpon (polovica obeh razponov), plus 2·H·sin(kot zavoja ÷ 2) pri zavoju.
- **Vzdolž črte**: razlika napetosti obeh strani pri končni podpori ali kotu; pri viseči podpori le pod ledom na eni strani (vsak razpon se obravnava posebej, kar je na varni strani).
- **Navpično**: navpična obremenitev na meter × tehtalni razpon (med najnižjima točkama na obeh straneh) plus oprema.

Vodoravna obremenitev se prenese na nazivno točko podpore (enakovredna obremenitev = obremenitev × višina pritrditve ÷ višina nazivne točke) in primerja z njeno **nazivno obremenitvijo** × faktor nabora pravil. Če je prešibka, se predlaga najmanjša podpora istega materiala v vaši knjižnici, ki jo prenese. Podpora z **zatego** prenese vodoravno obremenitev na zatego, ta nosi obremenitev ÷ sin(kot zatege) in se preveri glede na lastno nosilnost.

Okovi (objemke, izolatorji, prečke) se preverijo glede na nazivno obremenitev: sidrni okov prenese napetost vodnika, viseči okov pa svoj delež navpične in prečne obremenitve. Prikazani **temelj** je globina podpore v tleh in jama, ki je nekoliko širša od njenega podnožja.

## Podatki, povezave in tok

- Element s praznim potrebnim poljem ali ključ, ki ni v knjižnici.
- Konec kabelske trase ali oprema, ki ni povezana z ničemer.
- **Padec napetosti** in **tok** od vsakega vira (oprema, označena kot vir) do bremen (kW in faktor moči na opremi), vzdolž nadzemnih razponov in kablov: √3·I·L·(R cos φ + X sin φ), z R pri 20 °C. Več kot nazivni tok kabla ali več padca, kot ga dovoljuje nabor pravil, se označi.
