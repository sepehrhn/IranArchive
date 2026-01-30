<template>
  <div class="space-y-6">
    <!-- Stepper Header -->
    <div class="relative mb-12 sm:mb-16 pt-2 sm:pt-4 px-4 sm:px-6 md:px-12">
      <!-- Progress Bar Background -->
      <div class="absolute top-[1.75rem] sm:top-[2.25rem] left-6 right-6 sm:left-10 sm:right-10 md:left-24 md:right-24 h-1 bg-surface-100 dark:bg-surface-800 rounded-full">
        <!-- Active Progress Line -->
        <div 
          class="h-full bg-primary-500 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(var(--primary-500-rgb),0.5)]"
          :style="{ width: `${(currentStep / (steps.length - 1)) * 100}%` }"
        ></div>
      </div>
      
      <!-- Stepper Content -->
      <div class="relative flex justify-between items-start">
        <div 
          v-for="(step, index) in steps" 
          :key="step.id"
          class="flex flex-col items-center group relative z-10"
        >
          <!-- Step Indicator -->
          <div 
            :class="[
              'w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 relative',
              currentStep === index 
                ? 'bg-primary-500 text-white shadow-[0_0_20px_rgba(var(--primary-500-rgb),0.4)] scale-110 rotate-3' 
                : currentStep > index 
                  ? 'bg-green-500 text-white scale-90' 
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-600 border border-surface-200 dark:border-surface-700'
            ]"
          >
            <i v-if="currentStep > index" class="pi pi-check text-xs"></i>
            <i v-else-if="step.icon" :class="[step.icon, 'text-base sm:text-lg', currentStep === index ? 'text-white' : 'text-surface-400 dark:text-surface-600']"></i>
            <span v-else>{{ index + 1 }}</span>
            
            <!-- Active Pulse Effect -->
            <div v-if="currentStep === index" class="absolute inset-0 rounded-xl bg-primary-500 animate-ping opacity-20"></div>
          </div>

          <!-- Step Label -->
          <div 
            class="mt-2 sm:mt-4 text-center transition-all duration-300 w-20 sm:w-32"
            :class="[
              currentStep === index 
                ? 'text-primary-600 dark:text-primary-400 font-bold translate-y-0 opacity-100' 
                : 'text-surface-500 dark:text-surface-400 font-medium translate-y-1 opacity-70 group-hover:opacity-100'
            ]"
          >
            <p class="text-[10px] sm:text-xs uppercase tracking-wider leading-tight">{{ step.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Step Content -->
    <form @submit.prevent="handleNext">
      
      <!-- Step 1: Campaign Info -->
      <div v-if="currentStep === 0" class="space-y-6 max-w-2xl mx-auto">
        <div class="space-y-4">
          <h3 class="text-xs font-black uppercase tracking-widest text-surface-400 mb-2">Campaign Details</h3>
          
          <div>
            <label class="block text-sm font-medium mb-2">Campaign URL <span class="text-red-500">*</span></label>
            <InputText
              v-model="form.url"
              placeholder="https://www.change.org/p/..."
              class="w-full"
              :invalid="submittedStep && !form.url"
              required
            />
            <small class="text-surface-500">Link to the Change.org petition</small>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Campaign Title <span class="text-red-500">*</span></label>
            <InputText
              v-model="form.title"
              placeholder="Title of the campaign"
              class="w-full"
              :invalid="submittedStep && !form.title"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Author</label>
            <InputText
              v-model="form.author"
              placeholder="Campaign author/creator"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Step 2: Review -->
      <div v-if="currentStep === 1" class="space-y-6 max-w-2xl mx-auto">
        
        <div class="bg-surface-0 dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-xl overflow-hidden">
          <div class="p-6 sm:p-8 space-y-6">
            <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0 mb-4">Review Campaign</h3>
            
            <div class="space-y-4">
              <div>
                <p class="text-xs font-bold uppercase tracking-widest text-surface-400 mb-1">Title</p>
                <p class="font-medium text-surface-900 dark:text-surface-0">{{ form.title }}</p>
              </div>
              
              <div>
                <p class="text-xs font-bold uppercase tracking-widest text-surface-400 mb-1">URL</p>
                <a :href="form.url" target="_blank" class="text-primary-500 hover:underline break-all">{{ form.url }}</a>
              </div>
              
              <div v-if="form.author">
                <p class="text-xs font-bold uppercase tracking-widest text-surface-400 mb-1">Author</p>
                <p class="font-medium text-surface-900 dark:text-surface-0">{{ form.author }}</p>
              </div>
            </div>

            <!-- Info Notice -->
            <div class="p-4 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 text-xs font-medium flex items-start gap-3 rounded-xl border border-amber-100 dark:border-amber-900/20">
              <i class="pi pi-info-circle text-lg mt-0.5"></i>
              <p>Please double-check the URL and details before submitting. Verification will occur after submission.</p>
            </div>
          </div>
          
          <!-- Turnstile -->
          <div class="bg-surface-50 dark:bg-surface-950/50 p-6 border-t border-surface-100 dark:border-surface-800 flex flex-col items-center gap-4">
             <p class="text-xs font-bold text-surface-500 uppercase tracking-widest">Security Verification</p>
             <div id="turnstile-campaign" ref="turnstileContainer"></div>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between mt-8 pt-6 border-t border-surface-200 dark:border-surface-700 max-w-3xl mx-auto">
        <Button
          v-if="currentStep > 0"
          type="button"
          label="Back"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          @click="currentStep--"
        />
        <div v-else></div>

        <div class="flex gap-3">
          <Button
            v-if="currentStep < steps.length - 1"
            type="submit"
            label="Next"
            icon="pi pi-arrow-right"
            iconPos="right"
            :disabled="!canGoToNext"
          />
          <Button
            v-else
            type="button"
            label="Submit Campaign"
            icon="pi pi-send"
            :loading="submitting"
            :disabled="!turnstileToken"
            @click="handleSubmit"
          />
        </div>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue';

const props = defineProps<{
  submitting: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: any];
}>();

const config = useRuntimeConfig();
const turnstileContainer = ref<HTMLElement>();
const turnstileToken = ref('');
const submitted = ref(false); // Final submission state
const submittedStep = ref(false); // Step validation state

// Steps Configuration
const steps = [
  { id: 'info', label: 'Info', icon: 'pi pi-info-circle' },
  { id: 'review', label: 'Review', icon: 'pi pi-check' }
];
const currentStep = ref(0);

const form = ref({
  url: '',
  title: '',
  author: ''
});

// Render Turnstile when reaching the review step
watch(currentStep, async (newStep) => {
  if (newStep === 1) { // Review step
    await nextTick();
    renderTurnstile();
  }
});

onMounted(() => {
  if (!document.getElementById('turnstile-script')) {
    const script = document.createElement('script');
    script.id = 'turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    // We don't render immediately here because turnstile is on step 2
    document.head.appendChild(script);
  }
});

function renderTurnstile() {
  if (!(window as any).turnstile || !turnstileContainer.value) return;
  
  // Clear previous if any to avoid duplicates or errors (though simple check is usually enough)
  turnstileContainer.value.innerHTML = '';

  (window as any).turnstile.render(turnstileContainer.value, {
    sitekey: config.public.turnstileSiteKey,
    callback: (token: string) => {
      turnstileToken.value = token;
    }
  });
}

const canGoToNext = computed(() => {
  if (currentStep.value === 0) {
    return form.value.url.trim() !== '' && form.value.title.trim() !== '';
  }
  return true;
});

function handleNext() {
  submittedStep.value = true;
  if (canGoToNext.value) {
    submittedStep.value = false;
    currentStep.value++;
  }
}

function handleSubmit() {
  submitted.value = true;

  const data = {
    url: form.value.url,
    title: form.value.title,
    author: form.value.author
  };

  emit('submit', {
    kind: 'campaign',
    data,
    files: [],
    turnstileToken: turnstileToken.value
  });
}

function resetForm() {
  form.value = {
    url: '',
    title: '',
    author: ''
  };
  currentStep.value = 0;
  submitted.value = false;
  submittedStep.value = false;
}
</script>
