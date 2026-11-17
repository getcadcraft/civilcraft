---
title: Vizatoni parcelat dhe shkruani përshkrimet e tyre ligjore
summary: Vizatoni një parcelë sipas këndeve të saj ose shkruani thirrjet nga një akt pronësie ose planimetri, kontrolloni sa mirë mbyllen thirrjet, vendosni drejtimet dhe distancat në plan, bëjeni çdo drejtëz kurbë, dhe kopjoni një draft të përshkrimit ligjor.
keywords: parcela, lote, vija pronësore, kufi, akt pronësie, planimetri, matje sipas kufijve, drejtim, distancë, mbyllje, mosmbyllje, saktësi, përshkrim ligjor, pika e fillimit, kurbë, rreze, sipërfaqe, akra
from: 6793d6ce
---

Parcelat qëndrojnë në plan me drejtimin dhe distancën përgjatë secilës drejtëz (një kurbë shfaq rrezen, gjatësinë dhe këndin qendror), dhe me emrin dhe sipërfaqen e tyre në mes. Ato futen në plotimin PDF dhe në eksportet DWG dhe DXF, në shtresat `V-PROP` (vijat) dhe `V-PROP-TEXT` (etiketat). Gjithçka është nën **Parcelat** në panelin e djathtë kur nuk është përzgjedhur asgjë.

## Vizato një parcelë

1. Klikoni **Vizato një parcelë**.
2. Klikoni këndet, duke filluar nga pika e fillimit. Një klikim pranë një pike matjeje merr vendin e saktë të asaj pike.
3. Klikoni përsëri këndin e parë, ose shtypni {{key:Enter}}, për ta përfunduar. {{key:Backspace}} heq këndin e fundit; {{key:Esc}} heq këndet e deri tani; shtypeni përsëri për të dalë nga veglja.

## Shkruani thirrjet nga një akt pronësie

1. Klikoni **Shkruaj thirrjet e aktit**.
2. Thoni nga fillojnë thirrjet: numrin e një pike matjeje, ose një veri dhe lindje.
3. Shkruani ose ngjisni thirrjet, një në rresht:
   - një drejtëz: një drejtim dhe një distancë, si `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` dhe azimutet (`AZ 45°30'15"`) funksionojnë gjithashtu; fjalët "thence", presjet dhe "feet" injorohen.
   - një kurbë: `C R 300 L 52.36 right` (rreze dhe gjatësi harku), ose `C R 300 D 10°00'00" left` (rreze dhe kënd qendror). Një kurbë vazhdon drejtëzën para saj; kur nuk e bën, shtoni drejtimin e kordës: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` fillon një rresht koment.
4. Ndërsa shkruani, dialogu shfaq gjatësinë e thirrjeve, **mosmbylljen** (sa larg nga fillimi përfundojnë, dhe në cilin drejtim), **saktësinë** (gjatësia e pjesëtuar me mosmbylljen, 1 : 10,000 e kështu me radhë) dhe sipërfaqen. Rreshtat që nuk i lexon listohen me numrat e tyre.
5. **Shtoni parcelën**. Kur thirrjet nuk mbyllen, parcela mbyllet me një drejtëz të drejtë përtej hendekut: kontrolloni thirrjet me aktin. Për ta shpërndarë gabimin e një poligonali fushor mbi drejtëzat e tij, rregullojeni më parë.

## Kurbat

Te **Vetitë** e një parcele, çdo drejtëz ka një **Rreze**. Shkruani një rreze për ta bërë atë drejtëz një kurbë mes të dy të njëjtave kënde (një rreze më e vogël se gjysma e distancës mes këndeve nuk arrihet, kështu që refuzohet), dhe zgjidhni **Right** ose **Left** te **Kurbat**: një kurbë djathtas ka qendrën në të djathtën e drejtimit të lëvizjes, siç është në një akt. Fshini rrezen për ta bërë përsëri të drejtë. Çdo ndryshim është një hap: {{key:Mod+Z}} e zhbën.

## Përshkrimi ligjor

Vetitë e një parcele mbarojnë me përshkrimin e saj ligjor, i shkruar nga vizatimi:

- "Duke filluar nga" **Pika e fillimit** që shkruani (për shembull "këndi verior-lindor i Lotit 4"), përndryshe veriu dhe lindja e këndit të parë, ose pika e matjes nga e cila filluan thirrjet.
- "më pas" për çdo drejtëz: një drejtim dhe një distancë, ose një kurbë me rrezen, gjatësinë e harkut, këndin qendror, dhe drejtimin dhe distancën e kordës.
- "Që përmban" sipërfaqen e saj në këmbë katrore dhe akra (metra katrorë dhe hektarë në një projekt në metra).

**Kopjo** e vendos në kujtesën e kopjimit; **Shkarko si tekst** e ruan si skedar `.txt`.

:::warning
Përshkrimi ligjor është një draft nga vizatimi, jo një matje gjeodezike. Një gjeodet i licencuar duhet ta kontrollojë kundrejt regjistrit dhe ta nënshkruajë përpara se dikush t'i besojë.
:::

Klikoni brenda një parcele në plan për ta përzgjedhur; {{key:Delete}} e heq. Parcelat ruhen në skedarin e projektit.
