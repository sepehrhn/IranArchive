<template>
  <div class="p-datepicker p-component p-connected-overlay-enter-done" style="width: 100%; border: none; box-shadow: none;" @click.stop>
    <!-- Header -->
    <div class="p-datepicker-header">
      <button 
        v-if="view !== 'month'"
        type="button" 
        class="p-datepicker-prev p-link w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer" 
        @click="prevPage"
        aria-label="Previous"
      >
        <span class="p-datepicker-prev-icon pi pi-chevron-right"></span>
      </button>
      <div v-else class="p-datepicker-prev p-link" style="visibility: hidden"></div>
      
      <div class="p-datepicker-title">
        <template v-if="view === 'date'">
            <span class="p-datepicker-month cursor-pointer" @click="toggleView('month')">{{ currentMonthName }}</span>
            <span class="p-datepicker-year cursor-pointer" @click="toggleView('year')">{{ toPersianDigits(currentShahanshahiYear) }}</span>
        </template>
        <template v-else-if="view === 'month'">
            <span class="p-datepicker-year cursor-pointer" @click="toggleView('year')">{{ toPersianDigits(currentShahanshahiYear) }}</span>
        </template>
        <template v-else-if="view === 'year'">
            <span>{{ toPersianDigits(yearRangeStart + 1180) }} - {{ toPersianDigits(yearRangeStart + 1180 + 9) }}</span>
        </template>
      </div>

      <button 
        v-if="view !== 'month'"
        type="button" 
        class="p-datepicker-next p-link w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer" 
        @click="nextPage"
        aria-label="Next"
      >
        <span class="p-datepicker-next-icon pi pi-chevron-left"></span>
      </button>
      <div v-else class="p-datepicker-next p-link" style="visibility: hidden"></div>
    </div>

    <!-- Date View -->
    <div class="p-datepicker-calendar-container" v-if="view === 'date'">
      <table class="p-datepicker-calendar">
        <thead>
          <tr>
            <th v-for="day in weekDays" :key="day" scope="col">
              <span>{{ day }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, wIndex) in calendar" :key="wIndex">
            <td 
              v-for="(date, dIndex) in week" 
              :key="dIndex"
              :class="{'p-datepicker-other-month': date.otherMonth, 'p-datepicker-today': date.today}"
            >
              <span 
                v-if="date.day"
                class="p-datepicker-day-content w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors hover:bg-surface-100 dark:hover:bg-surface-800 mx-auto"
                :class="{
                    'p-highlight bg-primary-500 text-white': isSelected(date),
                }"
                @click="selectDate(date)"
              >
                {{ toPersianDigits(date.day) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

     <!-- Month View -->
     <div class="p-monthpicker" v-if="view === 'month'">
        <div 
            v-for="(m, i) in persianMonths" 
            :key="i"
            class="p-monthpicker-month hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            :class="{'p-highlight': i === currentMonth - 1}"
            @click="setMonth(i + 1)"
        >
            {{ m }}
        </div>
     </div>

     <!-- Year View -->
      <div class="p-yearpicker" v-if="view === 'year'">
          <div 
            v-for="y in yearsList" 
            :key="y" 
            class="p-yearpicker-year hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              :class="{'p-highlight': y === currentJYear}"
              @click="setYear(y)"
          >
            {{ toPersianDigits(y + 1180) }}
          </div>
      </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import jalaali from 'jalaali-js';

const props = defineProps<{
  modelValue?: Date | null;
}>();

const emit = defineEmits(['update:modelValue']);

// Constants
const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];
const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

// State
const view = ref<'date' | 'month' | 'year'>('date');
// Current view date (Jalaali)
const currentJYear = ref(1404);
const currentMonth = ref(1); // 1-12
const yearRangeStart = ref(1390); // Year Navigation State initialized early

// Helper: Convert to Persian Digits
const toPersianDigits = (num: number | string) => {
    const persianMap = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (d) => persianMap[parseInt(d)]);
};

// Initialize from prop
const initFromValue = () => {
    if (props.modelValue) {
        const j = jalaali.toJalaali(props.modelValue);
        currentJYear.value = j.jy;
        currentMonth.value = j.jm;
        yearRangeStart.value = Math.floor(j.jy / 10) * 10; // Initialize range
    } else {
        const now = new Date();
        const j = jalaali.toJalaali(now);
        currentJYear.value = j.jy;
        currentMonth.value = j.jm;
        yearRangeStart.value = Math.floor(j.jy / 10) * 10;
    }
};

watch(() => props.modelValue, initFromValue, { immediate: true });

// Computed
const currentMonthName = computed(() => persianMonths[currentMonth.value - 1]);
const currentShahanshahiYear = computed(() => currentJYear.value + 1180);

const yearsList = computed(() => {
    // Show 10 years per page (2 columns x 5 rows)
    const res = [];
    for(let i=0; i<10; i++) res.push(yearRangeStart.value + i);
    return res;
});

const calendar = computed(() => {
    const daysInMonth = jalaali.jalaaliMonthLength(currentJYear.value, currentMonth.value);
    
    // Find first day of the week (Jalaali 1st)
    // Jalaali: Sat=0, Sun=1... Fri=6
    const gDateOfFirst = jalaali.toGregorian(currentJYear.value, currentMonth.value, 1);
    const gFirst = new Date(gDateOfFirst.gy, gDateOfFirst.gm - 1, gDateOfFirst.gd);
    // Convert Gregorian Day (Sun=0) to Jalaali index (Sat=0)
    // (Sun(0)+1)%7 = 1
    // (Sat(6)+1)%7 = 0
    const startDayOfWeek = (gFirst.getDay() + 1) % 7; 

    const weeks = [];
    let week = [];
    
    // Fill previous month empty slots
    for (let i = 0; i < startDayOfWeek; i++) {
        week.push({ day: '', otherMonth: true });
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const today = new Date();
        const jToday = jalaali.toJalaali(today);
        const isToday = jToday.jy === currentJYear.value && jToday.jm === currentMonth.value && jToday.jd === d;

        week.push({
            day: d,
            otherMonth: false,
            today: isToday,
            jDate: { jy: currentJYear.value, jm: currentMonth.value, jd: d }
        });

        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    }

    // Fill remaining
    if (week.length > 0) {
        while (week.length < 7) {
            week.push({ day: '', otherMonth: true });
        }
        weeks.push(week);
    }

    return weeks;
});

// Methods
const prevPage = () => {
    if (view.value === 'date') {
        // Prev Month
        if (currentMonth.value === 1) {
            currentMonth.value = 12;
            currentJYear.value--;
        } else {
            currentMonth.value--;
        }
    } else if (view.value === 'year') {
        // Prev Decade (10 years)
        yearRangeStart.value -= 10;
    }
};

const nextPage = () => {
    if (view.value === 'date') {
        // Next Month
        if (currentMonth.value === 12) {
            currentMonth.value = 1;
            currentJYear.value++;
        } else {
            currentMonth.value++;
        }
    } else if (view.value === 'year') {
        // Next Decade (10 years)
        yearRangeStart.value += 10;
    }
};

const toggleView = (v: 'month' | 'year') => {
    if (v === 'year') {
        // Center range on current year
        yearRangeStart.value = Math.floor(currentJYear.value / 10) * 10;
    }
    view.value = view.value === v ? 'date' : v;
};

const setMonth = (m: number) => {
    currentMonth.value = m;
    view.value = 'date';
};

const setYear = (y: number) => {
    currentJYear.value = y;
    view.value = 'month';
};

const isSelected = (date: any) => {
    if (!props.modelValue || date.otherMonth) return false;
    const j = jalaali.toJalaali(props.modelValue);
    return j.jy === currentJYear.value && j.jm === currentMonth.value && j.jd === date.day;
};

const selectDate = (date: any) => {
    if (date.otherMonth) return;
    const g = jalaali.toGregorian(currentJYear.value, currentMonth.value, date.day);
    const d = new Date(g.gy, g.gm - 1, g.gd);
    emit('update:modelValue', d);
};
</script>

<style scoped>
/* Only keep essential overrides that standard classes miss */
.p-datepicker {
    direction: rtl; /* Persian needs RTL content */
    display: block;
}
.p-datepicker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
}
.p-datepicker-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    flex-grow: 1;
    margin: 0;
    line-height: 1;
}
.p-datepicker table th,
.p-datepicker table td {
    text-align: center;
}
.p-monthpicker, .p-yearpicker {
    display: flex;
    flex-wrap: wrap;
    padding: 0.5rem;
}
.p-monthpicker-month {
    width: 33.3%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 6px;
}
.p-yearpicker-year {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 6px;
}
</style>
