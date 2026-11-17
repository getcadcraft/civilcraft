---
title: Podzemni kabeli
summary: Trase kabela u rovovima između nosača i opreme, pokrov i križanja, spojevi prema duljini bubnja te količine rova i kabela.
keywords: podzemni kabel, trasa kabela, rov, kanal, pokrov, križanje, križanje s cijevi, spoj, bubanj, ormarić, transformator, izvor, pad napona
from: adfd2717
---

## Nacrtajte trasu kabela

1. Ako kabel završava na ormariću, transformatoru ili spoju, prvo postavite opremu: {{ui:Oprema}}, zatim kliknite.
2. Kliknite {{ui:Kabel}} i kliknite trasu; započnite i završite na nosaču ili opremi da biste se na njih spojili. Za završetak pritisnite {{key:Enter}}.

U Svojstvima odaberite **Kabel**, **Vrstu rova**, koliko **kabela jedan do drugoga** i **višak** (%). Trasa prikazuje svoju duljinu, mjesto početka i završetka te struju koju nosi.

## Što se provjerava

- **Pokrov**: vrh kabela ispod terena duž trase, u odnosu na pokrov za vrstu rova (ili najmanji pokrov iz skupa pravila).
- **Križanja**: gdje trasa siječe CivilCraft cijev ili drugi kabel, razmak između njih provjerava se prema pravilu razmaka: vlastiti **Razmak križanja** trase (u njezinim Svojstvima) kada ga odaberete, inače pravilo **Podzemna križanja** iz skupa pravila (primjeri koriste *Podzemno križanje*, 0.3 m), inače razmak do drugih instalacija iz vrste rova. Ako se dva kabela križaju, vrijedi veći od njihova dva. Nadzemni vod koji je presječen navodi se radi informacije, a kabel se prikazuje u profilu tog voda.
- **Spojevi**: jedan na svaku duljinu bubnja kabela (s viškom), kada stavka kabela daje duljinu bubnja.

## Oprema

Oprema ima stavku knjižnice, **opterećenje** (kW) s **faktorom snage** i može biti **izvor**: mreža se napaja odatle. Napon izvora dolazi iz njegove stavke knjižnice ili, inače, iz voda ili kabela koji ga napaja.

## Količine

{{ui:Više}} › {{ui:Količine…}} broji kabel (duljina trase × (1 + višak) × kabela jedan do drugoga + uspon na svakom kraju), rov po vrsti, volumene iskopa, posteljice i zatrpavanja, kanale i spojeve, s vodičem nadzemnih vodova, nosačima i opremom.
