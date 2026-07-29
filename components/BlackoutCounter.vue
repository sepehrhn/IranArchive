<script setup lang="ts">
type DurationParts = {
    days: number
    hours: number
    minutes: number
    seconds: number
}

type TimelineItem = {
    date: string
    title: string
    text: string
}

const { locale } = useI18n()
const { pn } = usePersianNumbers()

const blackoutPeriods = [
    {
        startedAt: Date.parse('2026-01-08T16:30:00Z'),
        endedAt: Date.parse('2026-01-27T12:00:00Z'),
    },
    {
        startedAt: Date.parse('2026-01-27T12:00:00Z'),
        endedAt: Date.parse('2026-02-28T07:00:00Z'),
    },
    {
        startedAt: Date.parse('2026-02-28T07:00:00Z'),
        endedAt: Date.parse('2026-05-26T12:00:00Z'),
    },
] as const

const toDurationParts = (milliseconds: number): DurationParts => {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))

    return {
        days: Math.floor(totalSeconds / 86_400),
        hours: Math.floor((totalSeconds % 86_400) / 3_600),
        minutes: Math.floor((totalSeconds % 3_600) / 60),
        seconds: totalSeconds % 60,
    }
}

const periodDurations = blackoutPeriods.map(period =>
    toDurationParts(period.endedAt - period.startedAt),
)

const totalBlackoutDuration = toDurationParts(
    blackoutPeriods.reduce(
        (total, period) => total + (period.endedAt - period.startedAt),
        0,
    ),
)

const copy = computed(() => {
    const english = {
        title: 'Digital Blackout in Iran',
        phase: 'Continuous public digital blackout since January 8, 2026',
        summary: 'Total time unrestricted global internet was not generally available to the Iranian public',
        days: 'Days',
        hours: 'Hours',
        minutes: 'Minutes',
        seconds: 'Seconds',
        dayShort: 'd',
        hourShort: 'h',
        minuteShort: 'm',
        totalDuration: 'Total public blackout duration',
        phaseOne: 'Phase 1 — near-total protest shutdown',
        phaseOneDates: 'Jan 8, 16:30 UTC → Jan 27, ~12:00 UTC',
        interimPhase: 'Phase 2 — whitelisted access',
        interimPhaseDates: 'Jan 27, ~12:00 UTC → Feb 28, 07:00 UTC',
        interimPhaseText: 'Traffic partially recovered, but meaningful global access remained unavailable to the general public and was largely reserved for government-linked or whitelisted users, including “white SIM” holders.',
        phaseThree: 'Phase 3 — near-total wartime shutdown',
        phaseThreeDates: 'Feb 28, 07:00 UTC → May 26, 12:00 UTC',
        timelineTitle: 'Digital blackout timeline',
        methodologyTitle: 'How the total is calculated',
        methodologyText: 'The counter treats January 8 through May 26 as one continuous public digital blackout with three access regimes: near-total shutdown, discriminatory whitelisted access, and renewed near-total shutdown. The middle period is included because ordinary people still lacked meaningful, unrestricted global internet access. Total: 3,307 hours 30 minutes, or 137 days 19 hours 30 minutes.',
        currentStatusTitle: 'Current status',
        currentStatusText: 'Global connectivity began returning on May 26 and rose afterward, but access remained uneven, slow, and heavily filtered.',
        sourcesTitle: 'Measurement and access sources',
        cloudflareTimelineSource: 'Cloudflare Radar: shutdown and restoration timeline',
        cloudflareWhitelistSource: 'Cloudflare: whitelists and white SIM cards restricted access to selected users',
        wiredSource: 'WIRED: access returned for state-approved users, not the general public',
        netblocksSource: 'NetBlocks: wartime phase ended after exactly 2,093 hours',
        timeline: [
            {
                date: 'Jan 8 · 16:30 UTC',
                title: 'Nationwide blackout begins',
                text: 'Traffic collapsed to near zero during the nationwide protest crackdown.',
            },
            {
                date: 'Jan 21–26',
                title: 'Brief controlled connectivity windows',
                text: 'Small amounts of traffic returned twice, but neither window became sustained, generally available public access.',
            },
            {
                date: 'Jan 27 · ~12:00 UTC',
                title: 'Whitelisted access phase begins',
                text: 'Traffic partially recovered, but the public digital blackout continued through aggressive filtering and privileged access for selected users and white SIM cards.',
            },
            {
                date: 'Feb 28 · 07:00 UTC',
                title: 'Near-total wartime shutdown begins',
                text: 'Connectivity again fell to near zero as the war began.',
            },
            {
                date: 'May 26 · 12:00 UTC',
                title: 'Sustained public restoration begins',
                text: 'International connectivity began a sustained rise after 2,093 hours of the wartime phase, ending the counted blackout period.',
            },
        ] satisfies TimelineItem[],
    }

    const persian = {
        title: 'خاموشی دیجیتال ایران',
        phase: 'خاموشی دیجیتال پیوسته عمومی از ۸ ژانویه ۲۰۲۶',
        summary: 'کل مدتی که اینترنت جهانی آزاد و بدون محدودیت به‌طور عمومی در دسترس مردم ایران نبود',
        days: 'روز',
        hours: 'ساعت',
        minutes: 'دقیقه',
        seconds: 'ثانیه',
        dayShort: 'روز',
        hourShort: 'ساعت',
        minuteShort: 'دقیقه',
        totalDuration: 'کل مدت خاموشی دیجیتال عمومی',
        phaseOne: 'فاز ۱ — قطعی تقریباً کامل اعتراضات',
        phaseOneDates: '۸ ژانویه، ۱۶:۳۰ UTC ← ۲۷ ژانویه، حدود ۱۲:۰۰ UTC',
        interimPhase: 'فاز ۲ — دسترسی مبتنی بر فهرست سفید',
        interimPhaseDates: '۲۷ ژانویه، حدود ۱۲:۰۰ UTC ← ۲۸ فوریه، ۰۷:۰۰ UTC',
        interimPhaseText: 'بخشی از ترافیک بازگشت، اما دسترسی واقعی به اینترنت جهانی همچنان برای عموم مردم ممکن نبود و عمدتاً به کاربران مورد تأیید یا وابسته به حکومت، از جمله دارندگان «سیم‌کارت سفید»، محدود می‌شد.',
        phaseThree: 'فاز ۳ — قطعی تقریباً کامل دوران جنگ',
        phaseThreeDates: '۲۸ فوریه، ۰۷:۰۰ UTC ← ۲۶ مه، ۱۲:۰۰ UTC',
        timelineTitle: 'خط زمانی خاموشی دیجیتال',
        methodologyTitle: 'روش محاسبه مجموع',
        methodologyText: 'این شمارنده فاصله ۸ ژانویه تا ۲۶ مه را یک خاموشی دیجیتال پیوسته عمومی با سه وضعیت دسترسی در نظر می‌گیرد: قطعی تقریباً کامل، دسترسی تبعیض‌آمیز مبتنی بر فهرست سفید و قطعی تقریباً کامل دوباره. دوره میانی نیز محاسبه می‌شود، زیرا مردم عادی همچنان به اینترنت جهانی آزاد و معنادار دسترسی نداشتند. مجموع: ۳۳۰۷ ساعت و ۳۰ دقیقه، معادل ۱۳۷ روز و ۱۹ ساعت و ۳۰ دقیقه.',
        currentStatusTitle: 'وضعیت کنونی',
        currentStatusText: 'اتصال به اینترنت جهانی از ۲۶ مه به‌تدریج بازگشت، اما دسترسی همچنان نابرابر، کند و به‌شدت فیلترشده باقی ماند.',
        sourcesTitle: 'منابع اندازه‌گیری و دسترسی',
        cloudflareTimelineSource: 'کلادفلر رادار: خط زمانی قطعی و بازگشت اتصال',
        cloudflareWhitelistSource: 'کلادفلر: محدود شدن دسترسی به کاربران منتخب از طریق فهرست سفید و سیم‌کارت سفید',
        wiredSource: 'وایرد: بازگشت اینترنت برای کاربران مورد تأیید حکومت، نه عموم مردم',
        netblocksSource: 'نت‌بلاکس: پایان فاز جنگ پس از دقیقاً ۲۰۹۳ ساعت',
        timeline: [
            {
                date: '۸ ژانویه · ۱۶:۳۰ UTC',
                title: 'آغاز قطعی سراسری',
                text: 'هم‌زمان با سرکوب اعتراضات سراسری، ترافیک اینترنت به نزدیک صفر سقوط کرد.',
            },
            {
                date: '۲۱ تا ۲۶ ژانویه',
                title: 'پنجره‌های کوتاه و کنترل‌شده اتصال',
                text: 'دو بار مقدار کمی ترافیک بازگشت، اما هیچ‌کدام به دسترسی عمومی، پایدار و سراسری تبدیل نشد.',
            },
            {
                date: '۲۷ ژانویه · حدود ۱۲:۰۰ UTC',
                title: 'آغاز فاز دسترسی فهرست سفید',
                text: 'بخشی از ترافیک بازگشت، اما خاموشی دیجیتال عمومی با فیلترینگ تهاجمی و دسترسی ویژه برای کاربران منتخب و سیم‌کارت‌های سفید ادامه یافت.',
            },
            {
                date: '۲۸ فوریه · ۰۷:۰۰ UTC',
                title: 'آغاز قطعی تقریباً کامل دوران جنگ',
                text: 'با آغاز جنگ، اتصال کشور دوباره به نزدیک صفر سقوط کرد.',
            },
            {
                date: '۲۶ مه · ۱۲:۰۰ UTC',
                title: 'آغاز بازگشت پایدار دسترسی عمومی',
                text: 'پس از ۲۰۹۳ ساعت از فاز جنگ، اتصال بین‌المللی وارد روند افزایشی پایدار شد و دوره محاسبه‌شده خاموشی پایان یافت.',
            },
        ] satisfies TimelineItem[],
    }

    return locale.value.startsWith('fa') ? persian : english
})

const formatTwoDigits = (value: number) => pn(String(value).padStart(2, '0'))
</script>

<template>
    <section class="flex flex-col items-center justify-center p-6 md:p-8 bg-surface-0 dark:bg-surface-900 text-surface-900 dark:text-surface-0 rounded-xl shadow-lg border border-surface-200 dark:border-surface-800 space-y-6 max-w-3xl mx-auto">
        <header class="flex flex-col items-center space-y-2 text-center">
            <h2 class="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-500 uppercase tracking-widest">
                {{ copy.title }}
            </h2>
            <div class="px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                <span class="text-[10px] md:text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">
                    {{ copy.phase }}
                </span>
            </div>
            <p class="text-surface-600 dark:text-surface-400 text-sm font-medium">
                {{ copy.summary }}
            </p>
        </header>

        <ClientOnly>
            <div class="grid grid-cols-4 gap-3 md:gap-8 w-full">
                <div class="flex flex-col items-center">
                    <span class="text-4xl md:text-6xl font-bold">{{ pn(totalBlackoutDuration.days) }}</span>
                    <span class="text-xs md:text-sm uppercase text-surface-500 dark:text-surface-400 mt-2 font-semibold">{{ copy.days }}</span>
                </div>
                <div class="flex flex-col items-center">
                    <span class="text-4xl md:text-6xl font-bold">{{ formatTwoDigits(totalBlackoutDuration.hours) }}</span>
                    <span class="text-xs md:text-sm uppercase text-surface-500 dark:text-surface-400 mt-2 font-semibold">{{ copy.hours }}</span>
                </div>
                <div class="flex flex-col items-center">
                    <span class="text-4xl md:text-6xl font-bold">{{ formatTwoDigits(totalBlackoutDuration.minutes) }}</span>
                    <span class="text-xs md:text-sm uppercase text-surface-500 dark:text-surface-400 mt-2 font-semibold">{{ copy.minutes }}</span>
                </div>
                <div class="flex flex-col items-center">
                    <span class="text-4xl md:text-6xl font-bold text-red-600 dark:text-red-500">{{ formatTwoDigits(totalBlackoutDuration.seconds) }}</span>
                    <span class="text-xs md:text-sm uppercase text-surface-500 dark:text-surface-400 mt-2 font-semibold">{{ copy.seconds }}</span>
                </div>
            </div>
            <template #fallback>
                <div class="grid grid-cols-4 gap-3 md:gap-8 w-full animate-pulse">
                    <div v-for="i in 4" :key="i" class="flex flex-col items-center">
                        <div class="h-12 w-16 bg-surface-200 dark:bg-surface-700 rounded mb-2"></div>
                        <div class="h-4 w-12 bg-surface-200 dark:bg-surface-700 rounded"></div>
                    </div>
                </div>
            </template>
        </ClientOnly>

        <div class="w-full py-3 px-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-surface-200 dark:border-surface-700 flex flex-col md:flex-row items-center justify-between gap-2">
            <div class="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                <i class="pi pi-calculator text-xs"></i>
                <span class="text-xs font-bold uppercase tracking-tight">{{ copy.totalDuration }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-sm" dir="ltr">
                <span class="font-bold">{{ pn(totalBlackoutDuration.days) }}{{ copy.dayShort }}</span>
                <span class="text-surface-400">:</span>
                <span class="font-bold">{{ formatTwoDigits(totalBlackoutDuration.hours) }}{{ copy.hourShort }}</span>
                <span class="text-surface-400">:</span>
                <span class="font-bold">{{ formatTwoDigits(totalBlackoutDuration.minutes) }}{{ copy.minuteShort }}</span>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <article class="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 space-y-2">
                <div class="flex items-center gap-2">
                    <i class="pi pi-circle-fill text-red-500 text-[8px]"></i>
                    <h3 class="text-sm font-bold">{{ copy.phaseOne }}</h3>
                </div>
                <p class="text-xs text-surface-500 dark:text-surface-400" dir="ltr">{{ copy.phaseOneDates }}</p>
                <p class="text-lg font-bold" dir="ltr">
                    {{ pn(periodDurations[0].days) }}{{ copy.dayShort }} {{ formatTwoDigits(periodDurations[0].hours) }}{{ copy.hourShort }} {{ formatTwoDigits(periodDurations[0].minutes) }}{{ copy.minuteShort }}
                </p>
            </article>

            <article class="p-4 bg-amber-50/70 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-2">
                <div class="flex items-center gap-2">
                    <i class="pi pi-lock text-amber-600 dark:text-amber-500"></i>
                    <h3 class="text-sm font-bold text-amber-900 dark:text-amber-200">{{ copy.interimPhase }}</h3>
                </div>
                <p class="text-xs text-amber-700 dark:text-amber-400" dir="ltr">{{ copy.interimPhaseDates }}</p>
                <p class="text-lg font-bold" dir="ltr">
                    {{ pn(periodDurations[1].days) }}{{ copy.dayShort }} {{ formatTwoDigits(periodDurations[1].hours) }}{{ copy.hourShort }} {{ formatTwoDigits(periodDurations[1].minutes) }}{{ copy.minuteShort }}
                </p>
                <p class="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">{{ copy.interimPhaseText }}</p>
            </article>

            <article class="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 space-y-2">
                <div class="flex items-center gap-2">
                    <i class="pi pi-circle-fill text-red-500 text-[8px]"></i>
                    <h3 class="text-sm font-bold">{{ copy.phaseThree }}</h3>
                </div>
                <p class="text-xs text-surface-500 dark:text-surface-400" dir="ltr">{{ copy.phaseThreeDates }}</p>
                <p class="text-lg font-bold" dir="ltr">
                    {{ pn(periodDurations[2].days) }}{{ copy.dayShort }} {{ formatTwoDigits(periodDurations[2].hours) }}{{ copy.hourShort }} {{ formatTwoDigits(periodDurations[2].minutes) }}{{ copy.minuteShort }}
                </p>
            </article>
        </div>

        <div class="w-full border-t border-surface-200 dark:border-surface-800 pt-6">
            <h3 class="font-bold text-lg mb-5 text-start">{{ copy.timelineTitle }}</h3>
            <ol class="relative border-s border-surface-300 dark:border-surface-700 ms-2 space-y-6">
                <li v-for="item in copy.timeline" :key="item.date" class="ms-6">
                    <span class="absolute flex items-center justify-center w-3 h-3 bg-red-500 rounded-full -start-[6.5px] ring-4 ring-surface-0 dark:ring-surface-900"></span>
                    <time class="block mb-1 text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400" dir="ltr">{{ item.date }}</time>
                    <h4 class="text-sm font-bold mb-1">{{ item.title }}</h4>
                    <p class="text-xs md:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{{ item.text }}</p>
                </li>
            </ol>
        </div>

        <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 space-y-2">
                <h3 class="font-bold text-sm flex items-center gap-2">
                    <i class="pi pi-info-circle text-blue-500"></i>
                    {{ copy.methodologyTitle }}
                </h3>
                <p class="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">{{ copy.methodologyText }}</p>
            </div>
            <div class="p-4 rounded-xl border border-green-200 dark:border-green-900/60 bg-green-50/70 dark:bg-green-950/20 space-y-2">
                <h3 class="font-bold text-sm flex items-center gap-2 text-green-800 dark:text-green-300">
                    <i class="pi pi-wifi"></i>
                    {{ copy.currentStatusTitle }}
                </h3>
                <p class="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">{{ copy.currentStatusText }}</p>
            </div>
        </div>

        <footer class="w-full pt-2 text-xs text-surface-600 dark:text-surface-400">
            <div class="font-bold text-surface-700 dark:text-surface-300 mb-2">{{ copy.sourcesTitle }}</div>
            <div class="flex flex-col items-start gap-2">
                <a href="https://blog.cloudflare.com/iran-internet-partially-restored-may-2026/" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                    <i class="pi pi-external-link text-[10px]"></i>
                    {{ copy.cloudflareTimelineSource }}
                </a>
                <a href="https://blog.cloudflare.com/q1-2026-internet-disruption-summary/" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                    <i class="pi pi-external-link text-[10px]"></i>
                    {{ copy.cloudflareWhitelistSource }}
                </a>
                <a href="https://www.wired.me/story/irans-internet-came-back-but-not-for-everyone" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                    <i class="pi pi-external-link text-[10px]"></i>
                    {{ copy.wiredSource }}
                </a>
                <a href="https://t.me/netblocks/1503" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                    <i class="pi pi-external-link text-[10px]"></i>
                    {{ copy.netblocksSource }}
                </a>
            </div>
        </footer>
    </section>
</template>
