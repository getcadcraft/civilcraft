---
title: Otevřít DWG nebo DXF jako čáry
summary: Otevřete čáry výkresu na plánu, vrstvu po vrstvě, použijte jeho vrstevnice, 3D mnohočáry a uzavřené obrysy pro povrch a jeho bodové bloky převeďte na zaměřené body.
keywords: kontrola zaměření, výšky textem, dwg, dxf, cad, výkres, čáry, vrstevnice, lomové hrany, hranice, mnohočára, 3D mnohočára, vrstvy, podkladová mapa, topo, zaměřovací výkres, bloky, odkazy na bloky, zaměřené body z bloků, atributy, bodové bloky, vkládací bod
from: da0f4c58
---

Topografické zaměření často přichází jako výkres: vrstevnice jako mnohočáry ve své výšce, lomové hrany jako 3D mnohočáry, obrys lokality jako uzavřená mnohočára. CivilCraft otevře **prostor modelu** výkresu jako vrstvy na plánu a dokáže z těchto čar přímo udělat povrch.

## Otevřete výkres

1. Klikněte na {{ui:Čáry}} ve skupině **Povrch** (nebo {{ui:Otevřít}}, nebo přetáhněte soubor na plán) a vyberte soubor `.dwg` nebo `.dxf`. Výkres se čte na tomto počítači; nic se nenahrává. Čtou se DWG z let 2000 až 2018 a ASCII DXF.
2. Dialog **Čáry** vypisuje vrstvy výkresu, které obsahují čáry, uzavřené tvary nebo body, a zda mají **výšky**. Vrstvy vypnuté ve výkresu začínají odškrtnuté. Text, šrafy, kóty a ostatní objekty, které nejsou čárami, se započítají a vynechají (dialog říká, které).
3. Zkontrolujte **Jednotky výkresu**. Pokud výkres své jednotky uvádí, CivilCraft je převede do jednotek projektu (milimetry na metry, metry na stopy, palce na stopy). Výkres ve stopách se čte jako americké průzkumné stopy bez přepočtu: rozdíl je 2 díly na milion, a přepočet souřadnic State Plane o tuto hodnotu by je posunul o stopy. Pokud výkres své jednotky neuvádí, jeho čísla se čtou v jednotkách projektu; zvolte správné jednotky v seznamu, pokud nejsou.
4. V **{{ui:Použít pro povrch}}** zvolte, co každá vrstva dá povrchu (nebo ponechte **Jen zobrazit**). Vrstvy pojmenované jako vrstevnice (TOPO, CONT, CNTR), které mají výšky, začínají jako lomové hrany.
5. Klikněte na {{ui:Přidat}}. Vrstvy se objeví pod **Vrstvy GIS** v levém panelu; každé použití se vloží do povrchu. Každá část je samostatný krok: {{key:Mod+Z}} je vrací zpět po jednom.

## Co může který druh vrstvy dát

| Vrstva obsahuje | Použít pro povrch |
|---|---|
| Vrstevnice (mnohočáry ve výšce) | Lomové hrany ve výšce vlastní čáry, nebo podle pole ELEV |
| 3D mnohočáry | Lomové hrany ve svých vlastních výškách |
| Uzavřený obrys | Hranice povrchu (největší uzavřený tvar, nebo ten, který jste vybrali) |
| Body s výškou | Zaměřené body, popsané názvem vrstvy |
| Čáry ve výšce 0 (kresba plánu) | Nic: zůstává na plánu jako podkladová kresba |

Výkres, který zapsal CivilCraft, drží své hranové čáry jako 3D mnohočáry, které si pamatují své oblouky. Dialog pak ukazuje **Hranové čáry**: ponechte zaškrtnuté, aby se vrátily jako hranové čáry s oblouky a použitím (jeden krok zpět), nebo jej odškrtněte, aby se četly jako čáry jako každá jiná vrstva.

Později použijte {{ui:Použít pro povrch}} v nabídce vrstvy pod **Vrstvy GIS**, abyste totéž udělali pro vrstvu, kterou jste jen zobrazili.

## Zaměřené body z bloků

Zaměřovací výkresy často nesou své body jako bloky: malý symbol u každého měření, s atributy pro číslo bodu, popis a výšku. Pokud výkres obsahuje odkazy na bloky, dialog má oddíl **Zaměřené body z bloků**:

1. Zaškrtněte bloky, které chcete převzít (tabulka uvádí, kolik odkazů každý má, na kterých vrstvách a s jakými atributy), nebo zaškrtněte vrstvy, abyste převzali každý odkaz na blok na nich.
2. Zvolte, odkud přijde **číslo**, **popis** a **výška** každého bodu: atribut, název bloku nebo vrstvy, následující volná čísla, nebo Z vkládacího bodu. CivilCraft začíná u pravděpodobných atributů (PT, DESC, ELEV a podobně) a vezme výšku z atributu jen tehdy, když bloky leží na nule.
3. Odškrtněte vrstvy čar, pokud chcete jen body, a klikněte na {{ui:Přidat}}.

Každý odkaz se stane jedním zaměřeným bodem ve svém vkládacím bodě. Počítají se jen odkazy umístěné v prostoru modelu; bloky vnořené do jiných bloků se nepočítají. Čísla, která už jsou v projektu, nebo jsou ve výkresu použita dvakrát, dostanou nová čísla za nejvyšším; atribut výšky, který není číslo, nechá daný bod bez výšky; stavový řádek obojí spočítá. Výkres se nikdy nemění a každý bod si pamatuje svůj blok: jeho Vlastnosti ukazují **Z bloku** s blokem, vrstvou a identifikátorem (handle). Přidání bodů je jeden krok, takže {{key:Mod+Z}} je všechny odstraní.

## Výšky psané textem a kontrola

Výšky bodů psané jako text (nebo v atributu bloku, který není blokem zaměřeného bodu) nejsou čáry. Oddíl **Výšky zaměření a kontrola** je může převzít jako zaměřené body a vypíše, co na výkresu vypadá špatně: jednotky, souřadnicový systém, vzdálenost od nuly, ploché vrstevnice, podivné výšky, zdvojené body. Viz [Kontrola zaměřovacího výkresu při importu](topic:survey-check).

## Jak se výkres čte

- Oblouky, kružnice, elipsy, vypouklé úseky mnohočar a splajny se změní na krátké přímé úseky (nejvýše každých 5°).
- Odkazy na bloky se kreslí tam, kde jsou umístěny, i vnořené bloky; co blok nese na vrstvě 0, převezme vrstvu odkazu.
- Objekty nakreslené v jiné rovině (jiný směr vytažení) se umístí do světových souřadnic.
- Každý objekt dostane tři pole: LAYER, TYPE (typ objektu) a ELEV (jeho výšku, pokud všechny jeho body sdílejí stejnou).
- Souřadnice se berou tak, jak jsou: výkres musí používat stejné souřadnice jako projekt (například stejnou zónu State Plane). Propojené výkresy (xref) se neotevírají: otevřete je samostatně.

:::tip
Výkres vrstevnic dá nejlepší povrch s několika kótami výšek na vrcholcích a v prohlubních, kde vrstevnice samotné nechávají ploché trojúhelníky. Přidejte je jako zaměřené body, nebo z vrstvy bodů ve výkresu.
:::
