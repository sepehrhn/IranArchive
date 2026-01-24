<template>
  <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
    
    <!-- Basic Information -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Victim Information</h3>
      
      <div>
        <label class="block text-sm font-medium mb-2">Full Name *</label>
        <InputText
          v-model="form.name"
          placeholder="Full name"
          class="w-full"
          :invalid="submitted && !form.name"
          required
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Age (optional)</label>
          <InputNumber
            v-model="form.age"
            placeholder="Age"
            class="w-full"
            :min="1"
            :max="120"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Date of Death</label>
          <Calendar
            v-model="form.dateOfDeath"
            dateFormat="yy/mm/dd"
            showIcon
            class="w-full"
            placeholder="YYYY/MM/DD"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Country</label>
          <InputText
            v-model="form.country"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Province</label>
          <InputText
            v-model="form.province"
            placeholder="e.g., Tehran"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">City</label>
          <InputText
            v-model="form.city"
            placeholder="e.g., Tehran"
            class="w-full"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Notes</label>
        <Textarea
          v-model="form.notes"
          rows="4"
          placeholder="Additional information, circumstances, biographical details..."
          class="w-full"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Sources</label>
        <Textarea
          v-model="sourcesText"
          rows="3"
          placeholder="One URL per line"
          class="w-full"
        />
        <small class="text-surface-500">Enter URLs to news articles, social media posts, etc. One per line.</small>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Photo</label>
        <FileUpload
          mode="basic"
          accept="image/jpeg,image/png,image/webp"
          :maxFileSize="10000000"
          @select="onFileSelect"
          chooseLabel="Choose Photo"
          class="w-full"
        />
        <small class="text-surface-500">JPEG, PNG, or WebP. Max 10MB.</small>
      </div>
    </div>

    <!-- Turnstile -->
    <div>
      <div id="turnstile-victim" ref="turnstileContainer"></div>
    </div>

    <!-- Submit -->
    <div class="flex gap-3">
      <Button
        type="submit"
        label="Submit Victim Report"
        icon="pi pi-send"
        :loading="submitting"
        :disabled="!turnstileToken"
      />
      <Button
        type="button"
        label="Reset"
        severity="secondary"
        outlined
        @click="resetForm"
      />
    </div>

  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  submitting: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: any];
}>();

const config = useRuntimeConfig();
const turnstileContainer = ref<HTMLElement>();
const turnstileToken = ref('');
const submitted = ref(false);
const selectedFile = ref<File | null>(null);

const form = ref({
  name: '',
  age: null as number | null,
  dateOfDeath: null as Date | null,
  country: 'Iran',
  province: '',
  city: '',
  notes: ''
});

const sourcesText = ref('');

onMounted(() => {
  if (!document.getElementById('turnstile-script')) {
    const script = document.createElement('script');
    script.id = 'turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => renderTurnstile();
    document.head.appendChild(script);
  } else {
    renderTurnstile();
  }
});

function renderTurnstile() {
  if (!(window as any).turnstile || !turnstileContainer.value) return;
  
  (window as any).turnstile.render(turnstileContainer.value, {
    sitekey: config.public.turnstileSiteKey,
    callback: (token: string) => {
      turnstileToken.value = token;
    }
  });
}

function onFileSelect(event: any) {
  selectedFile.value = event.files[0];
}

function handleSubmit() {
  submitted.value = true;

  if (!form.value.name) {
    return;
  }

  const sources = sourcesText.value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const data = {
    name: form.value.name,
    age: form.value.age,
    country: form.value.country,
    province: form.value.province,
    city: form.value.city,
    date_of_death: formatDate(form.value.dateOfDeath),
    notes: form.value.notes,
    sources,
    status: 'not_verified'
  };

  const files = selectedFile.value ? [selectedFile.value] : [];

  emit('submit', {
    kind: 'victim',
    data,
    files,
    turnstileToken: turnstileToken.value
  });
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

function resetForm() {
  form.value = {
    name: '',
    age: null,
    dateOfDeath: null,
    country: 'Iran',
    province: '',
    city: '',
    notes: ''
  };
  sourcesText.value = '';
  selectedFile.value = null;
  submitted.value = false;
}
</script>
