---
title: AI assistant တစ်ခုဖြင့် သင့်ဆိုက်ပေါ်တွင် အလုပ်လုပ်ခြင်း
summary: Settings တွင် assistant များကို ဖွင့်ပါ၊ သင့်ကွန်ပျူတာရှိ assistant သည် ဖွင့်ထားသော ဆိုက် (points၊ surface များ၊ volume များ၊ profile များ၊ parcel များ) ကို ဖတ်နိုင်, survey point များ ထည့်နိုင်, LandXML သို့မဟုတ် DWG သိမ်း/export လုပ်နိုင်သည်၊ CadCraft Studio မှတဆင့်။ သင်ဖွင့်မချင်း ပိတ်ထားသည်။
keywords: ai, assistant, mcp, script, automation, studio, points, elevation, station, offset, alignment, volume, cut, fill, profile, parcel, landxml, dwg, usd, folders, permissions, disconnect, activity
from: d0356582
---

## သင် သိရမည့်အရာများ

MCP ကို နားလည်သော assistant မည်သည့်အရာမဆို သင်ဖွင့်ထားသော ဆိုက်နှင့် မည်သို့ အလုပ်လုပ်စေမည်ဆိုသည်၊ ဘာလုပ်နိုင်ပြီး ဘာမလုပ်နိုင်သည်၊ နှင့် ရပ်တန့်ပုံကို ဖော်ပြသည်။

## CivilCraft တွင် assistant ဘာလုပ်နိုင်သလဲ

| ၎င်းတောင်းဆိုသည် | ၎င်းရရှိသည် | လိုအပ်ချက် |
|---|---|---|
| ဆိုက် | အမည်၊ ယူနစ်များ၊ coordinate system၊ point group များ၊ alignment များ၊ surface များ၊ pad များ၊ parcel များနှင့် pipe များ | Read |
| Survey point များ | နံပါတ်၊ easting၊ northing၊ elevation နှင့် ဖော်ပြချက်၊ group အလိုက်၊ ဖော်ပြချက်အလိုက် သို့မဟုတ် ကွက်တစ်ခုအတွင်း | Read |
| Surface elevation များ | ၎င်းသတ်မှတ်သော အမှတ်များ၌ ရှိပြီးသား မြေပြင် (သို့မဟုတ် ပြင်ဆင်ပြီး မျက်နှာပြင်) | Read |
| Station နှင့် offset များ | alignment တစ်လျှောက် အမှတ်များ၏ station နှင့် offset၊ သို့မဟုတ် station များ၏ coordinate နှင့် မြေပြင် elevation | Read |
| Profile | alignment တစ်လျှောက် မြေပြင်၊ ဒီဇိုင်း profile နှင့် ပြင်ဆင်ပြီး မျက်နှာပြင် elevation များ၊ ပေ သို့မဟုတ် မီတာ အကွာအဝေးတိုင်း | Read |
| Cut နှင့် fill | မြေပြင်ရှိပြီး ပြင်ဆင်ပြီး မျက်နှာပြင်ကြား ပမာဏများ (pad နှင့် corridor တိုင်းပါ)၊ သို့မဟုတ် မြေပြင်နှင့် အဆင့်တစ်ခုကြား | Read |
| Parcel များ | ထောင့်များ၊ ဧရိယာ (acre သို့မဟုတ် hectare ဖြင့်)၊ ပတ်လည်အကျယ်နှင့် ဥပဒေဆိုင်ရာ ဖော်ပြချက် | Read |
| ရွေးချယ်မှု | ၎င်းနာမည်ပေးသော survey point များကို plan ပေါ်တွင် သင်ရွေးထားသကဲ့သို့ ရွေးထားသည် | Edit |
| Survey point အသစ်များ | ၎င်းပေးသော နံပါတ်များ သို့မဟုတ် နောက်ဆုံးလွတ်နေသော နံပါတ်များဖြင့် ထည့်ထားသော point များ။ ခေါ်ဆိုမှုတစ်ခုစီသည် undo လုပ်နိုင်သော အဆင့်တစ်ခု | Edit |
| Save | CivilCraft ၏ကိုယ်ပိုင် {{ui:Save}} | Save |
| LandXML သို့မဟုတ် DWG | {{ui:LandXML}} နှင့် {{ui:DWG}} ခလုတ်များနှင့် တူညီသော ဖိုင်များ | Export |
| 3D ဆိုက် | 3D view က export လုပ်သည့်အတိုင်း မြေပြင်၊ ပြင်ဆင်ပြီး မျက်နှာပြင်၊ pad များနှင့် pipe များ၏ OpenUSD (.usdz, .usda သို့မဟုတ် .usdc) | Export |
| အပင်များနှင့် အပင်စာရင်း | အပင်စာရင်းတွင် အမည်မည်သည့်ဖြင့်မဆို တွေ့သော အပင်များနှင့် အပင်ဇယား၏ အရေအတွက်များ | Read |
| အပင်စိုက်ခြင်းနှင့် မြေညီညာလုပ်ခြင်း | အပင်များ၊ ခင်း သို့မဟုတ် ခြံစည်းရိုးတစ်ခု နေရာချထားခြင်း၊ သို့မဟုတ် ကန်ထောက်၊ ဘောင်၊ ရေစီးကြောင်း သို့မဟုတ် မြေညီညာသော ဧရိယာ ထည့်ခြင်း၊ တစ်ခုစီသည် undo လုပ်နိုင်သော အဆင့်တစ်ခုဖြစ်ပြီး cut နှင့် fill ပါဝင်သည် | Edit |
| ရေလောင်းစနစ် စစ်ဆေးမှု | ဇုန်တစ်ခုစီ၏ စီးဆင်းမှု၊ valve နှင့် supply တွင် လိုအပ်သော ဖိအား၊ အဆိုးဆုံး head၊ အလုပ်လည်ချိန်များ၊ ပြဿနာများနှင့် ပစ္စည်းစာရင်း၊ ရေလောင်းစနစ် ဒီဇိုင်နာ စစ်ဆေးမည့် တွက်ချက်ကူညီမှုအဖြစ် | Read |

ဖွင့်ထားသော ဆိုက်နှင့် အလုပ်လုပ်သည်။ Studio တွင် သင်ရွေးသော ဖိုင်တွဲများထဲသို့ သိမ်းနိုင်ပြီး export လုပ်နိုင်သည် (အောက်တွင်); ဖိုင်တွဲမရှိပါက ၎င်း၏ဖိုင်များသည် ခလုတ်များကဲ့သို့ download ဖြစ်သည်။

## ဖွင့်ခြင်း

Assistant များသည် သင့်ကွန်ပျူတာရှိ CadCraft Studio မှတဆင့် CivilCraft သို့ ဝင်သည်; ရိုးရိုး browser တွင် ဝင်ရန် နည်းလမ်းမရှိပါ။

1. {{ui:Settings}} ကို ဖွင့်ပြီး **CivilCraft** tab ကို ရွေးပါ။
2. **Assistants** အောက်တွင် **Let AI assistants and scripts use CivilCraft** ကို အမှန်ခြစ်ပါ။
3. **Read** ကို သင့်အတွက် အမှန်ခြစ်ထားပြီးသား။ assistant ကို လိုအပ်မှသာ **Edit**၊ **Save** သို့မဟုတ် **Export** ကို အမှန်ခြစ်ပါ။
4. Assistant ကို ဖိုင်တွဲတစ်ခုထဲ သိမ်းခွင့်နှင့် export ခွင့် ပေးလိုပါက **Folders it may use** အောက်ရှိ {{ui:Add a folder…}} ကို ရွေးပြီး Studio ၏ dialog တွင် ဖိုင်တွဲကို ရွေးပါ။ {{ui:Remove}} ဖြင့် ချက်ချင်း ပြန်ယူနိုင်သည်; အခြား path မည်သည့်အရာမဆို ငြင်းပယ်သည်။
5. Studio တွင် assistant ကို ချိတ်ဆက်ပါ (Studio က လိပ်စာနှင့် ကူးထည့်ရမည့် ဆက်တင်များကို ပြသည်)။

## Assistant ချိတ်ဆက်ထားစဉ်

ညာဘက် panel ၏ထိပ်ရှိ မှတ်စုက ဘယ် assistant ချိတ်ဆက်ထားသလဲနှင့် ဘာလုပ်နိုင်သလဲ ဆိုသည်ကို ပြသည်။ {{ui:Disconnect}} ကို click ပါက session ကို ချက်ချင်းအဆုံးသတ်သည်; ဆက်လုပ်ရန် ပြန်ချိတ်ဆက်ရမည်။

**Activity** (Settings ၏ **Assistants** အောက်) သည် assistant ခေါ်ဆိုသည့် ခေါ်ဆိုမှုတိုင်းကို အသစ်ဆုံးက ထိပ်ဆုံးဖြင့် စာရင်းပြုစုပြီး အလုပ်ဖြစ်/မဖြစ်ကို ပြသည်။

:::tip
ရိုးရိုးစကားဖြင့် မေးပါ၊ ဥပမာ "what is the ground elevation every 50 feet along Main Street?"၊ "how much cut and fill do the pads need?" သို့မဟုတ် "add a control point at these coordinates"။ Assistant က ဆိုက်ကိုဖတ်ပြီး ဖြေသည်၊ သို့မဟုတ် ပြောင်းလဲမှုကို undo လုပ်နိုင်သော အဆင့်တစ်ခုအဖြစ် လုပ်ပေးသည်။
:::

## CivilCraft မဖွင့်ဘဲ

Assistant များအတွက် CadCraft ဖိုင်ဆာဗာ (`npx @getcadcraft/mcp`) နှင့် `cadcraft` command line တို့သည် သိမ်းထားသော CivilCraft ပရောဂျက်များ (`.civilcraft.json`) နှင့် points ဖိုင်များကို CivilCraft ကိုယ်ပိုင်ကုဒ်ဖြင့် window မပါဘဲ ဖွင့်သည်: ဖတ်ခြင်းကိရိယာများ၊ point ထည့်ခြင်း၊ ပရောဂျက်သိမ်းခြင်း၊ LandXML နှင့် 3D ဆိုက်ကို OpenUSD အဖြစ် ထိုအတိုင်းပင်။ `cadcraft convert site.civilcraft.json site.xml` သည် command line မှ LandXML ရေးသည်။ LandXML ဖွင့်ခြင်း၊ DWG export နှင့် Landscape workspace ၏ ကိရိယာများသည် CivilCraft window လိုအပ်ဆဲ ဖြစ်သည်။

## ပိတ်ခြင်း

**Let AI assistants and scripts use CivilCraft** ကို အမှန်ဖြုတ်ပါ။ Assistant အားလုံးကို ချက်ချင်း ချိတ်ဆက်မှုဖြတ်သည်၊ ဆက်တင်ကိုတော့ နောက်တစ်ကြိမ်အတွက် သိမ်းထားသည်။

## ဆက်ကြည့်ရန်

- [AI assistant များအတွက် ချက်များ](common:assistants-recipes): ဥပမာများ၊ တစ်ခုစီတွင် ခေါ်သော ကိရိယာများနှင့်အတူ။
- [ဘေးတိုက်လမ်းကြောင်း (horizontal alignment) ဖွဲ့စည်းခြင်း](topic:alignment)
- [Surface ဖန်တီးပြီး ပြင်ဆင်ခြင်း](topic:build-surface)
- [Survey point များကို ရွေး၊ ကူးနှင့် ထည့်ခြင်း](topic:copy-paste-points)
- [CivilCraft ဆက်တင်များ](topic:settings)
