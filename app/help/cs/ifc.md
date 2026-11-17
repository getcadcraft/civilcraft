---
title: Export a import IFC
summary: Uložte celý projekt jako jeden soubor IFC ve verzi IFC 4.3, IFC4 nebo IFC2x3 (osy, silnice, zemní práce, povrchy, zdi, potrubí) a otevřete soubory IFC pro jejich osy a povrchy.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, osa trasy, ifcalignment, silnice, ifcroad, zemní práce, tin, dodávka, export ifc, import ifc
from: 6b998bcf
---

IFC je otevřený výměnný formát, který mnoho veřejných zadavatelů požaduje jako výstup. CivilCraft zapisuje celý projekt do jednoho souboru IFC a osy a povrchy z souborů IFC čte zpět.

## Export

1. Klikněte na {{ui:IFC}} ve skupině **Export** (ve stylech pásu: {{ui:Výstup}} › {{ui:Export}} › {{ui:IFC}}).
2. Vyberte schéma. **IFC 4.3 ADD2** je první a výchozí: je to vydání s osami, silnicemi a zemními pracemi. Zvolte IFC4 nebo IFC2x3, jen pokud software příjemce nedokáže číst 4.3.
3. Dialog říká, co soubor obsahuje a co zvolené schéma vynechává. Klikněte na {{ui:Export IFC}}.
   Soubor se stáhne jako "*název projektu*-ifc4x3.ifc", "-ifc4.ifc" nebo "-ifc2x3.ifc". CivilCraft si pamatuje schéma, které jste zvolili naposledy.

## Co které schéma obsahuje

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Osy | IfcAlignment s jeho vodorovným (přímky, kruhové oblouky, klotoidní spirály) a svislým (sklony, parabolické oblouky) průběhem, jeho křivkami (IfcCompositeCurve, IfcGradientCurve), počátečním staničením a událostmi převýšení | 3D lomená čára na civilním prvku | 3D lomená čára na proxy |
| Koridory | IfcRoad s částmi silnice; pruhy, krajnice, žlaby a chodníky jako IfcPavement, obrubníky jako IfcKerb, pásy výsadby; každá vrstva vozovky jako IfcCourse s tloušťkou, materiálem a objemem; svahy jako IfcEarthworksCut a IfcEarthworksFill s objemy výkopu a násypu; návrhová rychlost a třída | Civilní prvky pojmenované podle toho, čím jsou, seskupené podle silnice | Proxy seskupené podle silnice |
| Povrchy | IfcGeographicElement TERRAIN s triangulovanou nepravidelnou sítí | Množiny trojúhelníkových ploch | Povrchové modely založené na plochách (větší soubory) |
| Plošiny a zdi | Horní plocha plošiny, její svahy jako zemní práce, opěrné zdi jako IfcWall RETAININGWALL | Totéž, zeď jako uživatelsky definovaný typ zdi | Totéž, typ zdi v ObjectType |
| Potrubní sítě | IfcPipeSegment a IfcDistributionChamberElement v IfcDistributionSystem | Totéž | IfcFlowSegment a šachty v IfcSystem |
| Georeferencování | IfcProjectedCRS a IfcMapConversion | Totéž | ePSet_ProjectedCRS a ePSet_MapConversion na pozemku |

**Železnice** (osa s zapnutou volbou Railway) jde do IFC 4.3 jako IfcRailway: její přechodnice jako vlastní typy (klotoida, kubická parabola, Bloss, Helmert, sinusová půlvlna jako kosinová křivka, sinus), její převýšení jako IfcAlignmentCant a její kolej jako kolejnice, pražce a štěrkové lože, s podkladní vrstvou pod ním. IFC4 a IFC2x3 dostanou stejné části jako civilní prvky nebo proxy. Otevření železničního IFC 4.3 vrátí její přechodnice a převýšení zpět.

Každý soubor také nese parcely (půdorysy), rostliny a zpevněné plochy pracovního prostoru Krajina a hmoty budov (každá jako IfcBuilding se svými podlažími), vše na jednom pozemku. Sady vlastností nesou to, co jste navrhli: staničení, sestavu, sklony výkopu a násypu, šířku a počet pruhů, kóty dna, kóty hran a výšky zdí; množství (délky, plochy, objemy) jsou sady IfcElementQuantity.

## Jednotky a souřadnice

Soubor je v délkové jednotce projektu (metry, nebo americké stopy); plochy a objemy jsou v metrech čtverečních a krychlových. S souřadnicovým systémem (GIS › Souřadnice) je soubor umístěn na mapě: souřadnice Y a X jeho počátku a rotace a měřítko místního systému jsou v převodu na mapu. Bez něj soubor zapíše svůj místní počátek do sady vlastností a na mapu se neumístí.

## Import

Otevřete soubor .ifc tlačítkem {{ui:Otevřít}} nebo ho přetáhněte na půdorys. Dialog importu říká, co soubor obsahuje:

- **Osy** z IFC 4.3 (vodorovný a svislý průběh) a křivky os z IFC 4x1 se stanou osami CivilCraftu s jejich PI, poloměry, délkami spirál a PVI. Osa, kterou model PI CivilCraftu nemůže uchovat (složené oblouky, spirály mezi dvěma oblouky, osa začínající nebo končící v oblouku), se neimportuje a dialog uvede proč.
- **Povrchy**: vyberte ten, který se stane stávajícím terénem, nebo ponechte povrch projektu.
- **Vše ostatní** (a ostatní povrchy) lze zobrazit ve 3D jako podklad. Referenční prvky zůstávají, dokud je projekt otevřený; do souboru projektu se neukládají.

Soubor, který CivilCraft zapsal ve formátu IFC4 nebo IFC2x3, vrátí své osy přesně ze svých sad vlastností.

## Ještě není hotovo

- Převýšení silnice se zapisuje jako události převýšení a v povrchech silnic (převýšení v oblouku, cant, je pro železnice).
- Ukládání referenčních prvků do souboru projektu a import potrubních sítí nebo plošin z IFC jako upravitelných objektů.
