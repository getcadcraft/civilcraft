---
title: Point clouds mula sa drone o scanner
summary: Gamit ang Point clouds add-on, magbukas ng LAS o LAZ file na may milyon-milyong point, tingnan ang lahat ng ito, linisin, ayusin sa ground, vegetation at mga gusali, at buuin mula rito ang ground, contours at volume.
keywords: point cloud, las, laz, drone, photogrammetry, recap, lidar, scan, ground, i-classify, noise, stockpile, volume, cut and fill, contours, breakline, eye-dome, orthomosaic, ortho, drape, layer ng map, i-export las, i-export laz, i-compress
from: e4a4901f
---

Karamihan ng tao ay hindi ito kailangan, kaya ito ay add-on. I-on ang {{ui:Point clouds}} sa Mga setting › Add-ons; lalabas ang tab na {{ui:Point clouds}} sa panel sa kanan. Binabasa ang file sa browser mo at hinahati sa mga tile na itinatago sa sarili mong storage ng browser (o sa folder na pipiliin mo). **Walangina-upload.**

:::warning
Ang anumang ipinapakita ng tab na ito ay numero mula sa iyong data, hindi certificate. Nasubukan ito sa gawa-gawang site, hindi pa sa totoong drone survey: basahin nang maingat ang mga unang resulta at sabihin sa amin ang nakita mo. Ang registered professional ang nagpapasya kung ano ang halaga ng ground, contours at volume.
:::

## Magbukas ng cloud

Sa ilalim ng {{ui:Open a cloud}}, pumili ng LAS o LAZ file. Sinasabi ng tab kung ilang point ang laman nito, ang coordinate system at units nito, at kung gaano karaming espasyo ang kailangan ng build; pindutin ang {{ui:Build the cloud}}. Maaaring itigil ang build at ituloy ito gamit ang {{ui:Resume}} (piliin ulit ang parehong file). Hindi kailanman binabago ang file. Ang file na may 100 milyong point ay nabubuo sa loob ng ilang minuto sa workstation at halos kasing laki ng file ang espasyong kailangan.

Sa ilalim ng {{ui:Clouds on this computer}}, mabubuksan o maaalis ang isang cloud. Ang {{ui:Keep clouds in a folder…}} (Chrome, Edge at ang Studio app) ay nagtatago ng mga tile sa folder na pipiliin mo, halimbawa isang CadCraft clouds folder sa Documents, para hindi kailangang kasya ang 10 GB na cloud sa storage ng browser; mananatili kung saan ginawa ang mga cloud na nabuo na dati. Muling hihingi ng pahintulot ang browser pagkatapos mag-restart: pindutin ang {{ui:Use the folder … again}}.

## Tingnan ito

{{ui:Look at it in 3D}} ay iginuguhit ang cloud mula sa magaspang na tile at pinipino habang lumalapit ka, at hindi lalampas sa {{ui:Most points drawn}} nang sabay-sabay (2.5 milyon; 500 libo sa phone). Kulayan ayon sa sariling kulay ng file, taas, class, intensity o residual. Ang {{ui:Eye-dome lighting}} ay nagpapaanino ng gilid ayon sa lalim para mabasa ang hugis kahit walang normals (naka-off sa phone); ang {{ui:Points shrink with distance}} ay nagpapaliit sa malalayong point at nagpapalaki sa malalapit; itinatakda ng {{ui:Point size}} ang laki. Ipinapakita ng plan ang cloud bilang raster sa ilalim ng drawing mo at **pinipino kapag nag-zoom in** sa isang bahagi nito.

## Linisin ito

Sa ilalim ng {{ui:Clean}}, mag-draw ng lasso, box o polygon sa plan (o sa 3D mula sa top view: sa 3D, dinadala ang outline nang diretso pababa, kaya tumpak lamang ito mula sa itaas). Ipinapakita ng tab kung ilang point ang nasa loob **bago** mo ilapat: {{ui:Delete these points}}, {{ui:Change their class}}, {{ui:Restore deleted points}} o {{ui:Crop to this boundary}}. Dinadaanan ng {{ui:Undo}} at {{ui:Redo}} ang edit log; hindi kailanman binabago ang mismong file. Minamarkahan ng {{ui:Noise filter…}} ang mga ligaw na point bilang mababang point (class 7) o high noise (class 18).

## Ayusin ito

Ginagawa ng {{ui:Find the ground}} ang trabaho tile por tile at minamarkahan ang ground (class 2) at mga mababang point; ang tolerance ay 0.15 m, o 0.08 m kapag naka-on ang survey-grade switch. Iniuulat nito ang mga tahi ng tile na hindi nagkakasundo. Pagkatapos, minamarkahan ng {{ui:Classify vegetation and buildings}} ang mababa, katamtaman at mataas na vegetation at mga gusali batay sa taas sa ibabaw ng ground at kung gaano kapatag ang paligid. Walang machine learning, kaya maaaring mali ang isang patag na bubong ng shed sa ilalim ng mga puno: tingnan ito.

## Ground, contours, breaklines

Ginagawa ng {{ui:Build ground}} ang umiiral na ground mula sa ground points at idinadagdag ito sa project sa parehong paraan ng LAS import (isang undo step). Pagkatapos, inihahambing nito ang mga point dito: ang mean, RMS, 95th percentile, ang bahagi na nasa loob ng tolerance, at ang sampung lugar na pinakamalaki ang pagkakaiba, bawat isa may {{ui:Go there}}. Ang pagkukulay ayon sa {{ui:Residual}} ay nagpapakita kung saan hindi nagkakasundo ang ground at ang cloud.

Ang **breakline** (kerb, ditch o top of bank) ay pinipili sa cloud: ang {{ui:Pick a breakline on the cloud}} sa 3D view ay kumukuha ng pinakamalapit na iginuhit na point sa bawat click, at ang {{ui:Pick a breakline in the plan}} ay kumukuha ng pinakamalapit na cloud point (ground muna) sa ilalim ng bawat click; i-double-click o pindutin ang Enter para tapusin ang linya. Gagamitin ito ng susunod na {{ui:Build ground}}. Ang {{ui:Show contours}} ay nagguguhit ng contours sa ibabaw ng cloud sa maliit na larawan at itinatakda ang interval ng project.

## Volume

Kinukuwenta ng {{ui:Stockpile volume…}} ang volume ng ibabaw sa itaas ng base sa loob ng boundary na iginuhit mo. Iguhit ang boundary sa patag na lupa sa paligid ng tambak at piliin ang base: ang pinakamababang boundary point, isang plane, isang makinis na curved base, isang surface sa pamamagitan ng boundary, o isang level na i-type mo. Sa lupang nakahilig o kurba, gamitin ang plane o ang curved base; masyadong mataas ang basa ng pinakamababang point. Ang mga boundary point na nakatayo sa itaas ng iba (puno sa linya) ay hindi isinasama sa base. Nagbibigay ang {{ui:Flight to flight}} ng cut at fill sa pagitan ng dalawang cloud. Parehong maaaring i-save bilang CSV.

## Orthomosaic

Sa ilalim ng {{ui:Orthomosaic (picture from above)}}, piliin ang orthomosaic ng drone kasama ang world file nito at `.prj` kapag mayroon: isang GeoTIFF, o PNG o JPEG. Nagiging **map layer** ito ng project, kaya ipinapakita ito ng plan sa ilalim ng drawing mo, at pinipinta ito ng 3D view (kulay {{ui:Map}}) sa ground na nabuo mo, kaya {{ui:Build ground}} muna. Sinasabi ng tab kung gaano karaming bahagi ng cloud ang saklaw ng larawan, at nagbababala kapag wala itong saklaw: karaniwang dahilan ang ibang coordinate system, kaya ibigay ang `.prj` file kasama nito. Kapag walang `.prj`, itatanong ng programa kung nasaan ang mga coordinate. Nananatili ang larawan sa loob ng project file; tinatanggihan ang GeoTIFF na lampas 200 MB, at ang napakalaking mosaic ay binabawasan sa 16 megapixels, kaya para sa malaking survey, i-cut muna ang mosaic sa site.

## I-export

Isinusulat ng {{ui:Export}} ang nilinis at na-classify na cloud bilang bagong file (lahat ng point, ang mga piniling class, o ang ground lamang). Sa ilalim ng {{ui:File type}}, piliin ang:

- **LAS 1.4 (not compressed)**: point format 6, o 7 na may kulay.
- **LAZ (compressed)**: parehong point na naka-compress nang walang pagkawala, kaya bumabalik nang eksakto ang bawat point. Isinusulat ito bilang point format 0, o 2 na may kulay, sa LAS 1.4 file. Sa gawa-gawang 300 m na site, ang LAZ ay humigit-kumulang ikalimang bahagi ng laki ng LAS 1.4 file. Ang LAZ formats 0 at 2 ay naglalaman lamang ng class 0 hanggang 31: tinatanggihan ang point na may mas mataas na class na may mensahe, kaya i-export ang cloud na iyon bilang LAS 1.4.

Isinusulat ang LAZ ng sariling compressor ng CadCraft, na ginawa mula sa inilathalang LAZ specification. Sinuri namin na nababasa ng sarili naming reader at ng dalawang independent na LAZ reader (laz-perf, na ginagamit ng app para magbukas ng LAZ files, at laspy kasama ang lazrs) ang bawat point nang eksakto, at na ang mga LAZ file na ginawa ng laspy ay magkapareho hanggang sa byte kapag isinulat muli ang mga point nito. Hindi pa nasusubukan ang ibang programa, kaya kung may hindi magbukas ng file, sabihin sa amin kung alin.

Kapag kayang isulat ng browser ang file habang nagpapatuloy, pipiliin mo muna ang file at isusulat ang napakalaking cloud dito tile por tile sa halip na ipunin sa memory; kung hindi, ipinupunin ang file at dina-download, na ayos hanggang ilang daang megabytes.

## Ang hindi nito ginagawa

Binabasa lamang nito ang LAS at LAZ (hindi pa naikakabit sa tab na ito ang E57, PLY at PCD, at hindi pinagsasama ang maraming file ng iisang flight), hindi nito inililipat sa ibang projection ang cloud (ipinapalagay ang coordinate system at metro ng project), hindi nito binabasa ang RCP o RCS files ng Autodesk, hindi ito gumagawa ng surface mula sa mga larawan, at hindi nito natutukoy nang mag-isa ang mga poste, kerb o tubo.
