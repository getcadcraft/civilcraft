---
title: LandXML-vaihto
summary: Avaa muun siviilitekniikan ohjelmiston LandXML uutena projektina, vie pisteet, pinnat, linjaukset, profiilit ja putkiverkko LandXML 1.2 -muodossa, ja tiedä, mikä ei pääse mukaan.
keywords: landxml, xml, tuonti, vienti, vaihto, tin, pinta, linjaus, profiili, putkiverkko, yhteentoimivuus, tiedonvaihto
from: 870d5ece
---

LandXML on avoin vaihtomuoto, jonka useimmat siviilitekniikan ohjelmat lukevat ja kirjoittavat. CivilCraft lukee ja kirjoittaa LandXML 1.2 -muotoa. Jos olet käyttänyt Civil 3D:tä, sen LandXML-tuonti- ja vientivalintaikkunat ovat lähimmät vastineet. Täällä valintoja ei ole tehtävänä, ja huomautukset kertovat, mitä jätettiin pois.

## Avaa LandXML-tiedosto

1. Napsauta {{ui:Avaa}} (tai paina {{key:Mod+O}}) ja valitse `.xml`- tai `.landxml`-tiedosto, tai pudota se suunnitelmalle.
2. Jos nykyisessä projektissa on tallentamattomia muutoksia, CivilCraft kysyy ensin. Valitse {{ui:Tallenna kopio}}, {{ui:Älä tallenna}} tai {{ui:Peruuta}}.
3. Tehdään **uusi projekti**. Tilarivi kertoo, mitä luettiin, esimerkiksi ”Opened site.xml: 412 points, 2 surfaces, 3 alignments.”
4. Katso **Pinta**-tietojen alla olevaa laatikkoa. Se luettelee kaiken, mikä ohitettiin tai muutettiin, esimerkiksi:
   - ”Only the first surface (”EG”) was opened; the file has 1 more.”
   - ”Alignment ”Ramp A” has elements CivilCraft cannot draw yet (not lines, arcs or clothoid spirals); it was skipped.”
   - ”Pipe network rules were not in the file; the placeholders are in use — set yours under Project.”

Mikä muuttuu mihin:

| Tiedostossa | CivilCraftissa |
|---|---|
| Yksiköt (Imperial tai Metric) | Projektin **Yksiköt** (jalat tai metrit) |
| Projektin nimi | Projektin **Nimi** |
| CgPoints | Projektin pisteet; kuvaus (tai koodi) antaa ryhmän |
| Ensimmäinen TIN-pinta | Nykyinen maanpinta sellaisenaan (”Surface (from LandXML)”) |
| Jokainen linjaus, jossa on suoria, kaaria ja klotoidispiraaleja | Linjaus, jonka PI:t, säteet ja spiraalien pituudet on rakennettu kaarista uudelleen |
| Jokaisen linjauksen ensimmäinen suunniteltu profiili | Sen suunniteltu profiili paraabelisilla pystykaarilla |
| Ensimmäinen putkiverkko | Putkiverkko reunoineen, kaivoineen ja pohjineen |
| Suunnitelman ominaisuudet, joina on suoria ja kaaria | Ominaisuusviivat, kaaret säilyvät; muualta tulevat alkavat tilasta **Vain piirretty** |

Kaikki elementit ja attribuutit ovat kohdassa [LandXML: mitä luetaan ja kirjoitetaan](topic:landxml-reference).

:::note
LandXML:stä luettua pintaa ei rakenneta uudelleen, kun muutat pistejoukkoja tai piirrät murtoviivoja. Napsauta **Pinta**-osiossa {{ui:Rakenna maastomalli uudelleen pisteistä}}, jolloin pinta rakennetaan pisteistä. ({{key:Mod+Z}} palauttaa LandXML-pinnan.)
:::

## Vie LandXML

1. Napsauta {{ui:LandXML}} **Vienti**-ryhmässä.
2. Selain lataa tiedoston `<name>.xml`. Tilarivi kertoo, mitä siihen meni, esimerkiksi ”Exported LandXML 1.2: 276 points, 2 surfaces, 1 alignment, the pipe network. Pads are not part of LandXML here; the graded surface is.”

Tiedosto sisältää:

- **Units**: US-mittausjalat tai metrit.
- **CgPoints**: jokainen piste numeroineen nimenä, kuvauksineen ja ryhmineen koodina.
- **Surfaces**: nykyinen maanpinta TIN-pintana, sen murtoviivat ja ulkoraja lähdetietoina; ja kun alustat tai käytävät tasataan, toinen TIN-pinta nimeltään ”Proposed”.
- **Alignments**: suorat, kaaret ja klotoidispiraalit paalunumeroineen, kunkin mukana profiili, jossa on sitä pitkin otettu nykyinen maanpinta, ja suunniteltu profiili (PVI:t ja paraabeliset kaaret), kun siinä on vähintään kaksi PVI:tä.
- **PipeNetworks**: rakenteet reunoineen, pohjineen ja putkikohtaisine pohjineen sekä putket halkaisijoineen, pituuksineen ja kaltevuuksineen.
- **PlanFeatures**: jokainen ominaisuusviiva suorina ja kaarina, joiden päissä on korkeus, ja tieto siitä, mihin sitä käytetään.

## Mikä ei pääse mukaan

- Alustat ja käytävät kohteina. Niiden tulos on ”Proposed”-pinnassa.
- Virheelliset linjaukset (esimerkiksi päällekkäiset kaaret): jätetään pois ja lasketaan tilaviestissä.
- Putket ilman molempia pohjia ja verkot, joissa on alle kaksi rakennetta.
- Maanpinnalta otettu reuna kirjoitetaan kiinteänä reunana. Kun tiedosto avataan uudelleen, rakenne säilyttää tämän luvun, vaikka pinta muuttuu.
- Verkkosäännöt (pienin kaltevuus, peitesyvyys, pudotus): LandXML:ssä ei ole niille paikkaa.
- Näyttöasetukset ja pistejoukkojen pintavalinnat: tallenna CivilCraft-projekti niitä varten.

Avattaessa CivilCraft ei lue muita spiraaleja kuin klotoidi, ruudukkopintoja, pisteitä, jotka viittaavat vain muihin pisteisiin, tontteja, spiraaleja ominaisuusviivoissa, tieosuuksia tai mittaustietoja. Jokainen niistä mainitaan huomautuksissa, eikä sitä arvata.

## Kierrokset

Kun annat työn toisen siviilitekniikan ohjelman käyttäjälle ja haluat sen takaisin, vie LandXML, anna hänen muokata sitä ja avaa hänen LandXML-tiedostonsa uutena projektina. Säilytä myös oma `.civilcraft.json`-tiedostosi: se on ainoa tiedosto, joka säilyttää kaiken, minkä CivilCraft tietää.
