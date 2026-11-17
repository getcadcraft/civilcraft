---
title: Zemesgabalu zīmēšana un to juridiskie apraksti
summary: Zīmējiet zemesgabalu pēc tā stūriem vai ievadiet mērījumus no īpašuma dokumenta vai kadastra plāna, pārbaudiet, cik labi mērījumi noslēdzas, norādiet virzienus un attālumus plānā, pārveidojiet jebkuru posmu par līkni un kopējiet juridiskā apraksta melnrakstu.
keywords: zemesgabali, zemes gabali, īpašuma robežas, robeža, īpašuma dokuments, kadastra plāns, mērījumi, virziens, attālums, slēgums, slēguma kļūda, precizitāte, juridiskais apraksts, sākumpunkts, līkne, rādiuss, laukums, akri
from: 6793d6ce
---

Zemesgabali atrodas plānā ar virzienu un attālumu gar katru taisno posmu (līkne rāda rādiusu, garumu un centrālo leņķi), un to nosaukums un laukums ir vidū. Tie tiek iekļauti PDF drukā un DWG un DXF eksportos, slāņos `V-PROP` (līnijas) un `V-PROP-TEXT` (uzraksti). Viss atrodas sadaļā **Zemesgabali** labajā panelī, kad nekas nav atlasīts.

## Zemesgabala zīmēšana

1. Noklikšķiniet uz **Zīmēt zemesgabalu**.
2. Noklikšķiniet uz stūriem, sākot ar sākumpunktu. Klikšķis tuvu uzmērījuma punktam ņem šā punkta precīzo vietu.
3. Lai pabeigtu, vēlreiz noklikšķiniet uz pirmā stūra vai nospiediet {{key:Enter}}. {{key:Backspace}} atsauc pēdējo stūri; {{key:Esc}} noņem līdz šim zīmētos stūrus; nospiediet to vēlreiz, lai izietu no rīka.

## Mērījumu ievadīšana no īpašuma dokumenta

1. Noklikšķiniet uz **Ievadīt dokumenta mērījumus**.
2. Norādiet, no kurienes sākas mērījumi: uzmērījuma punkta numuru vai ziemeļu un austrumu koordinātas.
3. Ierakstiet vai ievietojiet mērījumus, pa vienam katrā rindā:
   - līnija: virziens un attālums, piemēram, `N 45°30'15" E 125.50`. Darbojas arī `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` un azimuti (`AZ 45°30'15"`), un "thence", komati un "feet" tiek ignorēti.
   - līkne: `C R 300 L 52.36 right` (rādiuss un loka garums) vai `C R 300 D 10°00'00" left` (rādiuss un centrālais leņķis). Līkne seko posmam pirms tās; ja nē, pievienojiet tās hordas virzienu: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` sāk komentāra rindu.
4. Kamēr rakstāt, dialoglodziņā redzams mērījumu kopgarums, **slēguma kļūda** (cik tālu no sākuma tie beidzas un kādā virzienā), **precizitāte** (garums, dalīts ar slēguma kļūdu, 1 : 10,000 utt.) un laukums. Rindas, ko tas nevar nolasīt, uzskaitītas ar to rindu numuriem.
5. **Pievienot zemesgabalu**. Ja mērījumi nenoslēdzas, zemesgabals noslēdzas ar taisnu posmu pāri spraugai: pārbaudiet mērījumus pēc īpašuma dokumenta. Lai sadalītu lauka poligona kļūdu pa tā posmiem, vispirms to koriģējiet.

## Līknes

Zemesgabala **Rekvizītos** katram posmam ir **Rādiuss**. Ierakstiet to, lai šis posms kļūtu par līkni starp tiem pašiem diviem stūriem (rādiuss, kas ir mazāks par pusi no attāluma starp stūriem, nevar sasniegt, tāpēc tas tiek noraidīts), un izvēlieties **Pa labi** vai **Pa kreisi** sadaļā **Līknes**: līkne pa labi ir ar centru pa labi no kustības virziena, kā īpašuma dokumentā. Notīriet rādiusu, lai tas atkal kļūtu taisns. Katra izmaiņa ir viens solis: {{key:Mod+Z}} to atsauc.

## Juridiskais apraksts

Zemesgabala Rekvizītus noslēdz tā juridiskais apraksts, kas rakstīts no rasējuma:

- “Sākot no” **sākumpunkta**, ko ierakstāt (piemēram, “zemesgabala 4 ziemeļaustrumu stūris”), citādi pirmā stūra ziemeļu un austrumu koordinātas vai uzmērījuma punkts, no kura sākās mērījumi.
- “tālāk” katrs posms: virziens un attālums vai līkne ar rādiusu, loka garumu, centrālo leņķi un hordas virzienu un attālumu.
- “Ietver” tā laukumu kvadrātpēdās un akros (kvadrātmetros un hektāros metru projektā).

**Kopēt** ievieto to starpliktuvē; **Lejupielādēt kā tekstu** saglabā to kā `.txt` failu.

:::warning
Juridiskais apraksts ir melnraksts no rasējuma, nevis uzmērījums. Licencētam mērniekam pirms paļaušanās jebkuram tas jāpārbauda pret ierakstiem un jāparaksta.
:::

Noklikšķiniet plānā zemesgabala iekšpusē, lai to atlasītu; {{key:Delete}} to noņem. Zemesgabali tiek saglabāti projekta failā.
