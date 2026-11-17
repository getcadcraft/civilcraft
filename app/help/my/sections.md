---
title: Sample lines နှင့် cross sections
summary: Alignment နှင့် ထောင့်ဖြတ် sections များကို ဖြတ်ပြီး station တိုင်းတွင် မြေပြင်၊ ဒီဇိုင်းနှင့် cut နှင့် fill ကို ကြည့်ပြီး average end areas ဖြင့် volumes ရယူပါ။
keywords: mass haul, mass diagram, balance point, shrink, swell, haul distance, borrow, waste, section sheets, cross section sheets, sections pdf, sections, cross sections, sample lines, section view, cut, fill, areas, average end area, end area volumes, earthwork, station, offset, csv, sample line, အပိုင်း, ပမာဏ, cut, fill
from: 5060173c
---

Cross section သည် လမ်းကို တည်ဆောက်မည့်ပုံအတိုင်း ပြသည်: station တစ်ခုတွင် alignment ကို ထောင့်ဖြတ်၍၊ ရှိပြီးသား မြေပြင်၊ ဒီဇိုင်း (corridor သို့မဟုတ် pad ကို ဂရိတ်ပေးထားသည်) နှင့် ၎င်းတို့ကြား cut နှင့် fill။

## Sample lines ထည့်ရန်

1. Alignment တစ်ခုကို ရွေးပါ။ **Properties** တွင်၊ **Sample lines** အောက်၌ {{ui:Add sample lines}} ကို နှိပ်ပါ။
2. **Every** (အကွာအဝေး: စတင်ရန် 50 ft သို့မဟုတ် 20 m)၊ **Left width** နှင့် **Right width** (section တစ်ခုစီ centerline မှ ဘယ်လောက်ဝေးအောင် ရောက်သလဲ) ကို သတ်မှတ်ပါ။
3. Station တစ်ခုတွင် section ဖြတ်ရန်၊ **Add a station** တွင် ရိုက်ထည့်ပါ (ဥပမာ `2+35`) နှင့် {{key:Enter}} ကို နှိပ်ပါ။

Sections များကို အကွာအဝေး၏ ပြည့်ဝသော မြှောက်ဆတိုင်း၊ alignment ၏ နှစ်ဖက်စလုံးတွင်၊ ကွေ့တိုင်း၏ အစနှင့် အဆုံး (PC နှင့် PT)၊ နှင့် သင်ထည့်သော stations များတွင် ဖြတ်သည်။ Sample lines များသည် plan ပေါ် alignment ကို ဖြတ်သော မီးခိုးရောင်လိုင်းများအဖြစ် ပြသည်; ၎င်းတို့သည် DXF၊ DWG နှင့် PDF တွင် C-ROAD-SCTN layer ပေါ်တွင်လည်း ထွက်သွားသည်။ ပြောင်းလဲမှု တစ်ခုစီသည် အဆင့်တစ်ခု ဖြစ်သည်: {{key:Mod+Z}} ဖြင့် ပြန်ဖျက်နိုင်သည်။

## Section view

{{ui:Section view}} ကို alignment ၏ **Properties** တွင်၊ {{ui:Sections}} ကို **Surface** › {{ui:More}} အောက်တွင်၊ သို့မဟုတ် {{key:X}} ဖြင့် ဖွင့်ပါ။ ၎င်းသည် plan အောက်ရှိ profile view ၏ နေရာကို ယူသည်။

- ၎င်း၏ bar ရှိ မြှားများ၊ station list၊ သို့မဟုတ် section view ကို အာရုံစိုက်ထားစဉ် {{key:Left}} နှင့် {{key:Right}} ဖြင့် sections များကို ကြည့်ပါ ({{key:Home}} နှင့် {{key:End}} သည် ပထမနှင့် နောက်ဆုံး)။
- မီးခိုးရောင်လိုင်းသည် ရှိပြီးသား မြေပြင်၊ အနီလိုင်းသည် ဒီဇိုင်း။ Cut ကို လိမ္မော်ရောင်၊ fill ကို အစိမ်းရောင်ဖြင့် အရိပ်ထားသည်။ Corridor အမှတ်များကို အမှတ်အသားပြုထားသည်: CL (centerline)၊ EOP (pavement ၏ ဘေး)၊ SH (shoulder) နှင့် DL (daylight)။
- ခေါင်းစီးတွင် station၊ ဤ section ၏ cut နှင့် fill ဧရိယာများ နှင့် ဒေါင်လိုက် exaggeration ပါသည်။ **Fit** သည် panel ကို ဖြည့်သည်; 1× ကို ရွေးပါက section ကို အမှန်စကေးဖြင့် ကြည့်နိုင်သည်။
- Plan ပေါ်ရှိ အထူလိုင်းသည် ဖန်သားပြင်ပေါ် ဘယ် section ရှိနေသည်ကို ပြသည်။

## Section sheets

**Sample lines** အောက်ရှိ {{ui:Section sheets (PDF)}} သည် section အားလုံးကို PDF စာမျက်နှာများပေါ် ထားသည်၊ ဘယ်မှ ညာသို့ နှင့် အပေါ်မှ အောက်သို့ station အစဉ်အတိုင်း အတန်းများအလိုက်။ **Paper**၊ **Plan scale** (sections များ၏ ဒေါင်လိုက်စကေး) နှင့် **Profile exaggeration** (1×၊ 2×၊ 5× သို့မဟုတ် 10×) ကို ရွေးပါ; dialog က စာမျက်နှာတစ်ခုတွင် sections မည်မျှ ထိုင်နိုင်သလဲ နှင့် စာမျက်နှာ မည်မျှ ထွက်လာမည်လဲ ပြသည်။

Section တိုင်းတွင် offsets နှင့် elevations ပါသော grid၊ မြေပြင် (အစက်စာလုံး)၊ ဒီဇိုင်း၊ cut နှင့် fill အရိပ်ထားချက် (လိမ္မော်နှင့် အစိမ်း)၊ corridor အမှတ်များ၊ နှင့် အောက်တွင် ၎င်း၏ station နှင့် cut နှင့် fill ဧရိယာများ ပြသည်။ စာရွက်များပေါ်ရှိ section အားလုံးကို အကြီးဆုံးအတွက် မြင့်လောက်အောင် အရွယ်တူ ဆွဲသည်; သင့် exaggeration ဖြင့် စာမျက်နှာသို့ မဝင်နိုင်သောအခါ CivilCraft က ဝင်နိုင်သော အကြီးဆုံးကို သုံးပြီး ထိုသို့ ပြောသည်။ ခေါင်းစဉ် strip တွင် alignment အမည်၊ ထိုစာမျက်နှာ၏ stations၊ စကေးများနှင့် "Sheet 1 of 3" ပါသည်။

## Average end areas ဖြင့် ပမာဏများ

အနီးရှိ sections နှစ်ခုကြား ပမာဏသည် ၎င်းတို့ ဧရိယာနှစ်ခု၏ ပျမ်းမျှကို stations ကြား အကွာအဝေးဖြင့် မြှောက်ထားသည်။ ဘားတွင် alignment အတွက် စုစုပေါင်းများကို ပြသည်၊ နှင့် {{ui:CSV}} သည် running totals ပါသော section တိုင်း၏ ဧရိယာများနှင့် ပမာဏများကို ဒေါင်းလုဒ်လုပ်သည် (feet project အတွက် cubic yards၊ metric အတွက် cubic meters)။

**Properties** သည် [Earthwork volumes](topic:volumes) မှ grid-method ပမာဏများ၏ ဘေးတွင် တူညီသော စုစုပေါင်းများကို ပြသည်။ နှစ်ခုသည် မတူညီသော ခန့်မှန်းချက်များဖြစ်သည်: sections နီးလေ နီးလေ ပိုနီးလာသည်၊ ပြီးလျှင် ပြောင်းဖြောင့်သော လမ်းတွင် မြေပြန့်ပေါ်တွင် ၎င်းတို့သည် တူညီသည်။

:::note
Cut နှင့် fill ကို ဂရိတ်ပေးထားသော ဧရိယာများ (corridor သို့မဟုတ် pad ၏ daylight လိုင်းများ) အတွင်းမှာသာ ရေတွက်သည်၊ grid method ကဲ့သို့ပင်။ Corridor သို့မဟုတ် pad မရှိပါက ဒီဇိုင်းသည် မြေပြင်ဖြစ်သဖြင့် section သည် cut သို့မဟုတ် fill ကို မပြပါ။
:::

## Mass haul

**Sample lines** အောက်ရှိ **Mass haul** သည် တူညီသော end-area ပမာဏများမှ mass-haul diagram ကို ဆွဲသည်: stations တလျှောက် cut နှုတ် fill ၏ running total။

- **Shrink (−) or swell (+) of the cut** သည် cut ကုဗ ယာတစ်ခုသည် fill အဖြစ် ချထားပြီးနောက် ဘာဖြစ်သလဲ ပြောသည်: −10 % (စတင်တန်ဖိုး၊ placeholder) သည် 0.9 သို့ ကျဆင်းသည်ဟု ဆိုလိုသည်; ဖောင်းသော ကျောက်ဆိုလျှင် +5 % ဖြစ်နိုင်သည်။ သင့် geotechnical report ၏ ကိန်းဂဏန်းကို သုံးပါ။
- မျဉ်းတက်သော နေရာတွင် လမ်းသည် cut ထဲတွင်; ကျသော နေရာတွင် fill ထဲတွင်။ သုညထက်အထက် (လိမ္မော်ရောင် အရိပ်ထား) တွင် မြေသည် station အထက်သို့ ရွေ့သည်; အောက် (အစိမ်း) တွင် station အောက်သို့။
- **Balance points** သည် မျဉ်းသည် သုညကို ဖြတ်သော နေရာများ ဖြစ်သည်: ၎င်းတို့နှစ်ခုကြား cut နှင့် fill မျှသည်။ ဇယားသည် မျှသော အပိုင်းတစ်ခုစီကို စာရင်းပြုသည်၊ ရွှေ့ခဲ့သော ပမာဏ (ထိပ်ဆုံး သို့မဟုတ် အနိမ့်ဆုံးအမှတ်) နှင့် ပျမ်းမျှ haul အကွာအဝေး (အရိပ်ထားသော ဧရိယာကို ထိုပမာဏဖြင့် စား)။
- မျဉ်းသည် သုညမှ ကင်းပြီး ဆုံးသောအခါ ကျန်ရှိသည်မှာ **waste** (အပေါ်) သို့မဟုတ် **borrow** (အောက်) ဖြစ်သည်။ ထိုနောက်ဆုံး အပိုင်းတွင် ရွှေ့သော မြေကို ၎င်း ဆုံးသော အဆင့်ထက် အပြင်ဘက်ရှိသော မြေသာ ရေတွက်သည်။

**CSV** သည် section တိုင်းရှိ mass ordinate၊ အပိုင်းများနှင့် factor ကို သိမ်းသည်။
