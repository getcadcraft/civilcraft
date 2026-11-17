---
title: Šablóny koridorov a šablóny terénu
summary: Vytvorte malé opakovane použiteľné šablóny (obrubník a žľab, chodník, múr, priekop), zostavte z nich koridor podľa staničenia s oddelenou ľavou a pravou stranou, rozdeľte os trasy na viac koridorov a rozložte vrstvy materiálov na terén.
keywords: šablóna, šablóny, knižnica šablón, tvorba šablón, priečny profil, zostava, subzostava, komponenty, kódy bodov, koncová podmienka, napojenie na terén, priekop, oporný múr, obrubník, žľab, chodník, oblasti, rozsah staničenia, viac koridorov, ľavá a pravá strana, šablóna terénu, ornica, vozovka, podklad, rozprestrieť, materiály, množstvá
from: ce70e58b
---

**Šablóna** je malý priečny rez, ktorý nakreslíte raz a opakovane používate: body s odsadeniami, sklonmi a kódmi bodov a komponenty s materiálmi. Koridor sa dá zostaviť zo šablón podľa staničenia, pričom každá strana má vlastné šablóny vozovky a vlastnú koncovú podmienku, a tie isté šablóny sa dajú rozprestrieť na terén.

:::warning
Príkladové šablóny sú zástupné hodnoty, z ktorých môžete začať. Ich čísla nie sú prevzaté z nijakej normy ani úradu. Pred použitím v návrhu musí každú šablónu a každú hodnotu, ktorú jej zadáte, skontrolovať inžinier.
:::

## Otvorenie šablón

Otvorte {{ui:Povrch}} › {{ui:Viac}} › {{ui:Šablóny koridorov…}} (alebo zadajte {{cmd:TEMPLATES}}). Okno má tri zoznamy:

- **V tomto projekte**: šablóny, ktoré používajú koridory a šablóny terénu tohto projektu. Ukladajú sa do súboru projektu.
- **Moja knižnica**: šablóny uložené v tomto prehliadači, ktoré sa ponúkajú v každom projekte. Ak chcete šablónu projektu uchovať, použite {{ui:Uložiť do Mojej knižnice}}.
- **Príklady**: dva jazdné pruhy s vrstvami, obrubník a žľab, chodník, napojenie na terén, priekop, oporný múr, ornica pod terénom a vozovka na teréne. Každá je označená "Na kontrolu inžinierom".

{{ui:Použiť v tomto projekte}} skopíruje šablónu z knižnice alebo príkladov do projektu. {{ui:Exportovať šablóny tohto projektu}} ich uloží ako súbor `.cctemplates.json` a {{ui:Importovať súbor}} načíta jeden súbor do projektu a do Mojej knižnice. Súbor použite na zdieľanie šablón alebo na ich presun do iného počítača.

## Tvorba šablóny

{{ui:Nová šablóna}} (alebo {{ui:Úpravy}} pri šablóne projektu) otvorí editor šablón. Nakreslite pravú stranu smerom von od bodu 0,0 šablóny; ľavá strana používa tú istú šablónu smerom von doľava.

1. Zadajte názov a druh: **Vozovka** (ďalšia šablóna sa pripojí na jej koniec), **Koncová podmienka** (napája sa na terén) alebo **Šablóna terénu**.
2. Pridajte **hodnoty**: pomenované čísla, napríklad šírku `w` alebo sklon `s`. Políčko s číslom kdekoľvek v šablóne prijme číslo alebo názov hodnoty; `-t` je hodnota `t` so zápornou hodnotou. Koridor môže každému použitiu šablóny dať vlastné hodnoty, takže jedna šablóna obrubníka slúži pre každú výšku obrubníka.
3. Pridajte **body** v poradí. Každý sa umiestni od skoršieho bodu (alebo bodu 0,0) podľa svojho obmedzenia:

| Obmedzenie | Umiestni bod |
|---|---|
| Odsadenie na sklone | Odsadenie smerom von a sklon (stúpanie na vodorovnú dĺžku; −0.02 znamená pokles 2 %) |
| Odsadenie a výška | Odsadenie a výška |
| Priamo nahor alebo nadol | Iba výška |
| Bočný sklon k terénu | Od svojho bodu k terénu, so sklonom zárezu tam, kde je terén nad ním, a so sklonom násypu tam, kde je pod ním |
| Až k terénu | Odsadenie, potom priamo nahor alebo nadol k terénu |
| Oporný múr | Múr zadanej hrúbky: v zárezu jeho horná hrana naráža na terén pri líci vozovky, v násype vedie vozovka cez neho a jeho vonkajšia plocha klesá k terénu |

   Zaškrtnite **Horný** pri bodoch, ktorými prechádza hotový povrch. Posledný horný bod je miesto, kde na tejto strane začína ďalšia šablóna. **Cieľ** umožňuje koridoru presunúť bod: jeho odsadenie alebo výška sa berú z čiary.
4. Pridajte **komponenty**: uzavreté tvary cez kódy bodov (`0` je bod 0,0), každý s názvom, materiálom a druhom. Ich plochy určujú objemy.

Výkres sleduje každú zmenu v skutočnej mierke a zoznam pod ním uvádza, čo nie je v poriadku (bod, ktorý narazí na terén skôr než na koniec, hodnota, ktorú šablóna nemá, komponent bez plochy). {{ui:Pridať do tohto projektu}} alebo {{ui:Uložiť}} ju uchová ako jeden krok späť.

## Zostavenie koridoru zo šablón

Vyberte os trasy s koridorom a vo **Vlastnostiach** zapnite {{ui:Stavať zo šablón podľa staničenia}}. Koridor sa začne s príkladmi dvoch jazdných pruhov a napojenia na terén na oboch stranách.

- **Oblasti.** Každá oblasť začína na stanici a končí pri začiatku ďalšej oblasti. {{ui:Pridať oblasť}} pridá jednu; jej začiatočnú stanicu zmeníte v jej políčku.
- **Ľavá a pravá strana oddelene.** Každá strana každej oblasti má vlastný zoznam **Vozovka** od osi trasy smerom von a vlastnú **Koncovú podmienku**: napojenie na terén, priekop, múr alebo ľubovoľnú šablónu, ktorá sa napája na terén. Bez koncovej podmienky sa strana napája na terén pri sklonoch zárezu a násypu koridoru. {{ui:Kopírovať z ľavej na pravú}} skopíruje stranu.
- **Hodnoty a ciele.** Pod každou šablónou na strane je políčko pre každú hodnotu (prázdne = vlastná hodnota šablóny) a pre bod, ktorý má cieľ, charakteristická čiara alebo čiara iného koridoru, ktorá ho posúva.
- **Od** a **Do** obmedzia koridor na časť osi trasy.

Rezy, čiary v pôdoryse pre každý kód bodu, navrhovaný povrch, vytyčovanie a zemné práce sa všetky riadia podľa koridoru. **Vlastnosti** uvádzajú objem každého komponentu pre stranu a oblasť (priemerné plochy koncových rezov pozdĺž osi trasy). Prevýšenie v oblúku a cieľové hrany koridoru sa nepoužívajú, kým sa koridor zostavuje zo šablón.

## Viac koridorov na jednej osi trasy

Pod **Koridory na tejto osi trasy** pridá {{ui:Pridať koridor}} koridor na zvyšok osi trasy: prvý koridor dostane koncovú stanicu v strede (alebo si ponechá svoju) a nový sa tam začne s poslednou oblasťou šablón prvého. Každý koridor má vlastný názov, rozsah staničenia, šablóny a zemné práce. Jeden vypnete políčkom {{ui:Zapnuté}}. Tam, kde sa dva rozsahy prekrývajú, koridor pridaný neskôr upravuje terén nad skorším.

## Šablóny terénu

Šablóna terénu rozprestiera vrstvy šablóny na teréne od svojho bodu 0,0: vrstva pod bodom 0,0 ide do zeme (ornica na odstránenie), vrstva nad ním leží na teréne (podklad a vozovka na parkovisku). Šírky a sklony nie sú dôležité, ide len o hĺbku každého komponentu nad alebo pod bodom 0,0.

Otvorte {{ui:Povrch}} › {{ui:Viac}} › {{ui:Šablóny terénu…}} (alebo zadajte {{cmd:TERRAINTEMPLATES}}); blok je tiež vo **Vlastnostiach** projektu. {{ui:Pridať šablónu terénu}} pridá jednu s príkladom ornice. Pre každú vyberte:

- **šablónu** (jej hodnoty sa dajú pre túto zmeniť),
- **terén**: jestvujúci terén alebo navrhovaný povrch,
- **tvar**, ktorým sa orezáva: celý terén, parcela, plošina alebo uzavretá charakteristická čiara. Viac šablón terénu môže na tom istom teréne používať rôzne tvary.

Každá vrstva uvádza svoju hrúbku, plochu v pôdoryse a objem. Objem je plocha v pôdoryse násobená hrúbkou, pričom hrúbka sa meria priamo nadol; plocha sa meria na mriežke a uvádza sa aj rozprestretá (sklonená) plocha. Tvary sú kreslené v pôdoryse na hladine C-TOPO-TMPL. Šablóny terénu nemenia navrhovaný povrch.

## Materiály a množstvá

Blok Zemné práce projektu uvádza **Materiály zo šablón**: každý komponent koridoru a každú vrstvu šablóny terénu s jej objemom. {{ui:Poslať do TakeoffCraft}} ich zapíše do súboru množstiev po výkope a násype, každú ako jednu položku, v kubických yardoch (projekty v stopách) alebo v kubických metroch.

## Súbory

Šablóny, oblasti, dodatočné koridory a šablóny terénu sa ukladajú do súboru projektu. Projekt, ktorý ich nepoužíva, sa uloží presne ako predtým a staršie verzie CivilCraft otvoria projekt, ktorý ich používa (ignorujú šablóny a zostavia vlastný priečny profil koridoru).
