---
title: Anna tekoälyavustajan työskennellä kohteesi kanssa
summary: Kytke avustajat päälle Asetuksissa, jotta tietokoneesi avustaja voi lukea avoimen kohteen (pisteet, pinnat, tilavuudet, profiilit, tontit), lisätä mittauspisteitä sekä tallentaa ja viedä LandXML- tai DWG-tiedoston CadCraft Studion kautta. Pois päältä, kunnes kytket sen päälle.
keywords: tekoäly, avustaja, mcp, skripti, automaatio, studio, pisteet, korkeus, paalu, siirtymä, linjaus, tilavuus, leikkaus, täyttö, profiili, tontti, landxml, dwg, usd, kansiot, oikeudet, katkaise yhteys, toiminta
from: d0356582
---

## Mitä opit

Miten annat tekoälyavustajalle (jokaiselle avustajalle, joka puhuu MCP:tä) pääsyn avoimeen kohteeseesi, mitä se voi ja ei voi tehdä, ja miten pysäytät sen.

## Mitä avustaja voi tehdä CivilCraftissa

| Se pyytää | Mitä se saa | Tarvitsee |
|---|---|---|
| Kohteen | Nimi, yksiköt, koordinaatistojärjestelmä, pisteryhmät, linjaukset, maastomallit, alustat, tontit ja putket | Lukeminen |
| Mittauspisteet | Numero, itä, pohjoinen, korkeus ja kuvaus, ryhmittäin, kuvauksen mukaan tai laatikon sisältä | Lukeminen |
| Pinnan korkeudet | Nykyinen maanpinta (tai tasattu pinta) missä tahansa pisteissä, jotka se nimeää | Lukeminen |
| Paalut ja siirtymät | Pisteiden paalu ja siirtymä linjauksen varrella, tai paalujen koordinaatit ja maanpinnan korkeus | Lukeminen |
| Profiili | Maanpinta, suunnitelman profiili ja tasattu pinta linjauksen varrella, joka tietyin välein jalkoina tai metreinä | Lukeminen |
| Leikkaus ja täyttö | Tilavuudet nykyisen maanpinnan ja tasatun pinnan välillä (myös jokainen alusta ja käytävä) tai maanpinnan ja tason välillä | Lukeminen |
| Tontit | Kulmat, pinta-ala (eekkereinä tai hehtaareina), piiri ja oikeudellinen kuvaus | Lukeminen |
| Valinta | Nimetyt pisteet valitaan suunnitelmalla, aivan kuin olisit valinnut ne itse | Muokkaus |
| Uudet mittauspisteet | Pisteet lisätään antamillaan numeroilla tai seuraavilla vapailla. Jokainen kutsu on yksi kumottava askel | Muokkaus |
| Tallennus | CivilCraftin oma {{ui:Save}} | Tallennus |
| LandXML tai DWG | Samat tiedostot kuin {{ui:LandXML}}- ja {{ui:DWG}}-painikkeilla | Vienti |
| Kohde 3D:nä | OpenUSD (.usdz, .usda tai .usdc) maanpinnasta, tasatusta pinnasta, alustoista ja putkista, sellaisena kuin 3D-näkymä sen vie | Vienti |
| Kasvit ja kasviluettelo | Kasvit kasvilistasta miltä tahansa nimeltä ja kasviluettelon lukumäärät | Lukeminen |
| Istutus ja tasaus | Kasveja, penkki tai pensasaita sijoitettuna, tai alusta, maavalli, painanne tai tasausalue lisättynä, jokainen yhtenä kumottavana askeleena, leikkauksineen ja täytöineen | Muokkaus |
| Kasteluntarkistus | Jokaisen vyöhykkeen virtaus, venttiilillä ja syötössä tarvittava paine, pahimman tapauksen painekorkeus, käyttöajat, ongelmat ja osaluettelo laskentaapuna, jonka kastelusuunnittelija tarkistaa | Lukeminen |

Se toimii avoimen kohteen kanssa. Studiossa se voi myös tallentaa ja viedä kansioihin, jotka valitset (alla); ilman kansiota sen tiedostot ladataan samoin kuin painikkeiden.

## Kytke päälle

Avustajat tavoittavat CivilCraftin CadCraft Studion kautta tietokoneellasi; tavallisella selaimella ei ole tähän pääsyä.

1. Avaa {{ui:Settings}} (Asetukset) ja valitse **CivilCraft**-välilehti.
2. Kohdassa **Avustajat** rastita **Anna tekoälyavustajien ja skriptien käyttää CivilCraftia**.
3. **Lukeminen** on valmiiksi rastitettu. Rastita **Muokkaus**, **Tallennus** tai **Vienti** vain, jos avustaja tarvitsee niitä.
4. Jos haluat antaa sen tallentaa ja viedä kansioon, valitse **Kansiot, joita se saa käyttää** -kohdasta {{ui:Add a folder…}} ja valitse kansio Studion valintaikkunasta. {{ui:Remove}} (Poista) ottaa sen takaisin heti; muut polut hylätään.
5. Yhdistä avustaja Studiossa (Studio näyttää osoitteen ja asetukset, jotka liität siihen).

## Kun avustaja on yhdistettynä

Oikean paneelin yläreunassa oleva huomautus kertoo, mikä avustaja on yhdistetty ja mitä se voi tehdä. Napsauta {{ui:Disconnect}} (Katkaise yhteys) lopettaaksesi istunnon heti; avustajan täytyy yhdistää uudelleen jatkaakseen.

**Toiminta**, Asetuksissa **Avustajat**-kohdan alla, listaa jokaisen avustajan kutsun uusin ensin ja kertoo, onnistuiko se.

:::tip
Kysy tavallisin sanoin, esimerkiksi ”mikä on maanpinnan korkeus 50 ft:n välein pitkin Main Streetiä?”, ”kuinka paljon leikkausta ja täyttöä alustat tarvitsevat?” tai ”lisää ohjauspiste näihin koordinaatteihin”. Avustaja lukee kohteen ja vastaa tai tekee muutoksen yhtenä kumottavana askeleena.
:::

## Ilman CivilCraftin avaamista

CadCraftin tiedostopalvelin avustajille (`npx @getcadcraft/mcp`) ja `cadcraft`-komentorivi avaavat tallennetut CivilCraft-projektit (`.civilcraft.json`) ja pistetiedostot CivilCraftin omalla koodilla ilman ikkunaa: samat lukutyökalut, pisteiden lisäys, projektin tallennus, LandXML ja kohde 3D:nä OpenUSD:nä. `cadcraft convert site.civilcraft.json site.xml` kirjoittaa LandXML:n komentoriviltä. LandXML:n avaaminen, DWG-vienti ja Maisema-työtilan työkalut vaativat yhä CivilCraft-ikkunan.

## Kytke pois

Poista rasti kohdasta **Anna tekoälyavustajien ja skriptien käyttää CivilCraftia**. Jokainen avustaja katkaistaan heti, ja asetus säilyy seuraavaa kertaa varten.

## Katso myös

- [Reseptit tekoälyavustajille](common:assistants-recipes): toimivia esimerkkejä, kukin työkaluineen.
- [Laadi vaakasuuntainen linjaus](topic:alignment)
- [Rakenna ja tarkenna maastomalli](topic:build-surface)
- [Valitse, kopioi ja liitä mittauspisteitä](topic:copy-paste-points)
- [CivilCraftin asetukset](topic:settings)
