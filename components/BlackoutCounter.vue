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
        phase: 'Two nationwide shutdown phases since January 2026',
        summary: 'Combined near-total blackout time, excluding the interim access gap',
        days: 'Days',
        hours: 'Hours',
        minutes: 'Minutes',
        seconds: 'Seconds',
        dayShort: 'd',
        hourShort: 'h',
        minuteShort: 'm',
        totalDuration: 'Cumulative blackout duration',
        phaseOne: 'Phase 1 — protest shutdown',
        phaseOneDates: 'Jan 8, 16:30 UTC → Jan 27, ~12:00 UTC',
        phaseTwo: 'Phase 2 — wartime shutdown',
        phaseTwoDates: 'Feb 28, 07:00 UTC → May 26, 12:00 UTC',
        accessGap: 'Interim access gap — excluded',
        accessGapDates: 'Jan 27 → Feb 28',
        accessGapText: 'International access returned unevenly and remained heavily filtered.',
        timelineTitle: 'Measurement timeline',
        methodologyTitle: 'How the total is calculated',
        methodologyText: 'The counter adds 451 hours 30 minutes from phase 1 to NetBlocks’ exact 2,093-hour phase 2 measurement: 2,544 hours 30 minutes in total. Jan 27 through Feb 28 is not counted. Phase 1’s Jan 27 endpoint is approximate because measurement sources identify the day broader recovery began, not an exact minute.',
        currentStatusTitle: 'Current status',
        currentStatusText: 'Global connectivity began returning on May 26 and rose afterward, but access remained uneven, slow, and heavily filtered.',
        sourcesTitle: 'Measurement sources',
        cloudflareSource: 'Cloudflare Radar: both shutdown phases and restoration windows',
        netblocksSource: 'NetBlocks: phase 2 ended after exactly 2,093 hours',
        timeline: [
            {
                date: 'Jan 8 · 16:30 UTC',
                title: 'First nationwide blackout begins',
                text: 'Traffic collapsed to near zero during the nationwide protest crackdown.',
            },
            {
                date: 'Jan 21–26',
                title: 'Brief, limited restoration windows',
                text: 'Small amounts of traffic returned twice, but neither window became sustained nationwide access.',
            },
            {
                date: 'Jan 27 · ~12:00 UTC',
                title: 'Broader filtered access returns',
                text: 'The cumulative clock pauses. The following interval is excluded from the blackout total.',
            },
            {
                date: 'Feb 28 · 07:00 UTC',
                title: 'Second nationwide blackout begins',
                text: 'Connectivity again fell to near zero as the war began.',
            },
            {
                date: 'May 26 · 12:00 UTC',
                title: 'Partial restoration after 2,093 hours',
                text: 'International connectivity began a sustained rise, ending the second counted phase.',
            },
        ] satisfies TimelineItem[],
    }

    const persian = {
        title: 'خاموشی دیجیتال ایران',
        phase: 'دو دوره قطعی سراسری از ژانویه ۲۰۲۶',
        summary: 'مجموع زمان قطعی نزدیک به کامل، بدون احتساب فاصله دسترسی میان دو دوره',
        days: 'روز',
        hours: 'ساعت',
        minutes: 'دقیقه',
        seconds: 'ثانیه',
        dayShort: 'روز',
        hourShort: 'ساعت',
        minuteShort: 'دقیقه',
        totalDuration: 'مجموع زمان خاموشی دیجیتال',
        phaseOne: 'دوره اول — قطعی هم‌زمان با اعتراضات',
        phaseOneDates: '۸ ژانویه، ۱۶:۳۰ UTC ← ۲۷ ژانویه، حدود ۱۲:۰۰ UTC',
        phaseTwo: 'دوره دوم — قطعی دوران جنگ',
        phaseTwoDates: '۲۸ فوریه، ۰۷:۰۰ UTC ← ۲۶ مه، ۱۲:۰۰ UTC',
        accessGap: 'فاصله دسترسی میان دو دوره — محاسبه نشده',
        accessGapDates: '۲۷ ژانویه ← ۲۸ فوریه',
        accessGapText: 'دسترسی بین‌المللی به‌صورت نابرابر بازگشت و همچنان به‌شدت فیلتر بود.',
        timelineTitle: 'خط زمانی اندازه‌گیری‌ها',
        methodologyTitle: 'روش محاسبه مجموع',
        methodologyText: 'این شمارنده ۴۵۱ ساعت و ۳۰ دقیقه دوره اول را با اندازه‌گیری دقیق ۲۰۹۳ ساعته نت‌بلاکس برای دوره دوم جمع می‌کند: در مجموع ۲۵۴۴ ساعت و ۳۰ دقیقه. فاصله ۲۷ ژانویه تا ۲۸ فوریه محاسبه نشده است. زمان پایان دوره اول در ۲۷ ژانویه تقریبی است، زیرا منابع اندازه‌گیری روز آغاز بازگشت گسترده‌تر را مشخص کرده‌اند، نه دقیقه دقیق آن را.',
        currentStatusTitle: 'وضعیت کنونی',
        currentStatusText: 'اتصال به اینترنت جهانی از ۲۶ مه به‌تدریج بازگشت، اما دسترسی همچنان نابرابر، کند و به‌شدت فیلترشده باقی ماند.',
        sourcesTitle: 'منابع اندازه‌گیری',
        cloudflareSource: 'کلادفلر رادار: دو دوره قطعی و پنجره‌های بازگشت اتصال',
        netblocksSource: 'نت‌بلاکس: پایان دوره دوم پس از دقیقاً ۲۰۹۳ ساعت',
        timeline: [
            {
                date: '۸ ژانویه · ۱۶:۳۰ UTC',
                title: 'آغاز نخستین قطعی سراسری',
                text: 'هم‌زمان با سرکوب اعتراضات سراسری، ترافیک اینترنت به نزدیک صفر سقوط کرد.',
            },
            {
                date: '۲۱ تا ۲۶ ژانویه',
                title: 'پنجره‌های کوتاه و محدود اتصال',
                text: 'دو بار مقدار کمی ترافیک بازگشت، اما هیچ‌کدام به دسترسی سراسری و پایدار تبدیل نشد.',
            },
            {
                date: '۲۷ ژانویه · حدود ۱۲:۰۰ UTC',
                title: 'بازگشت گسترده‌تر اما فیلترشده',
                text: 'شمارنده تجمعی در این نقطه متوقف می‌شود و فاصله بعدی در مجموع محاسبه نشده است.',
            },
            {
                date: '۲۸ فوریه · ۰۷:۰۰ UTC',
                title: 'آغاز دومین قطعی سراسری',
                text: 'با آغاز جنگ، اتصال کشور دوباره به نزدیک صفر سقوط کرد.',
            },
            {
                date: '۲۶ مه · ۱۲:۰۰ UTC',
                title: 'بازگشت نسبی پس از ۲۰۹۳ ساعت',
                text: 'اتصال بین‌المللی وارد روند افزایشی پایدار شد و دومین دوره محاسبه‌شده پایان یافت.',
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
                    <i class="pi pi-pause-circle text-amber-600 dark:text-amber-500"></i>
                    <h3 class="text-sm font-bold text-amber-900 dark:text-amber-200">{{ copy.accessGap }}</h3>
                </div>
                <p class="text-xs text-amber-700 dark:text-amber-400" dir="ltr">{{ copy.accessGapDates }}</p>
                <p class="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">{{ copy.accessGapText }}</p>
            </article>

            <article class="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 space-y-2">
                <div class="flex items-center gap-2">
                    <i class="pi pi-circle-fill text-red-500 text-[8px]"></i>
                    <h3 class="text-sm font-bold">{{ copy.phaseTwo }}</h3>
                </div>
                <p class="text-xs text-surface-500 dark:text-surface-400" dir="ltr">{{ copy.phaseTwoDates }}</p>
                <p class="text-lg font-bold" dir="ltr">
                    {{ pn(periodDurations[1].days) }}{{ copy.dayShort }} {{ formatTwoDigits(periodDurations[1].hours) }}{{ copy.hourShort }} {{ formatTwoDigits(periodDurations[1].minutes) }}{{ copy.minuteShort }}
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
                    {{ copy.cloudflareSource }}
                </a>
                <a href="https://t.me/netblocks/1503" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                    <i class="pi pi-external-link text-[10px]"></i>
                    {{ copy.netblocksSource }}
                </a>
            </div>
        </footer>
    </section>
</template>
