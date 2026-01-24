<template>
  <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
    
    <!-- Basic Information -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Event Information</h3>
     
      <div>
        <label class="block text-sm font-medium mb-2">Title <span class="text-red-500">*</span></label>
        <InputText
          v-model="form.title"
          placeholder="Event title"
          class="w-full"
          :invalid="submitted && !form.title"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Summary <span class="text-red-500">*</span></label>
        <Textarea
          v-model="form.summary"
          rows="2"
          placeholder="Short one-sentence summary (under 150 chars)"
          class="w-full"
          :invalid="submitted && !form.summary"
          maxlength="150"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Description <span class="text-red-500">*</span></label>
        <Textarea
          v-model="form.description"
          rows="6"
          placeholder="Full description (Markdown supported)"
          class="w-full"
          :invalid="submitted && !form.description"
          required
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Format *</label>
          <Select
            v-model="form.format"
            :options="formatOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select format"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Type *</label>
          <Select
            v-model="form.type"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select type"
            class="w-full"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Start Date *</label>
          <Calendar
            v-model="form.startDate"
            dateFormat="yy/mm/dd"
            showIcon
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Start Time</label>
          <InputText
            v-model="form.startTime"
            placeholder="HH:MM"
            class="w-full"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Country</label>
          <InputText
            v-model="form.country"
            placeholder="e.g., DE"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">City</label>
          <InputText
            v-model="form.city"
            placeholder="e.g., Berlin"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Address (optional)</label>
          <InputText
            v-model="form.address"
            placeholder="Specific location"
            class="w-full"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Organizer Name *</label>
        <InputText
          v-model="form.organizerName"
          placeholder="Organization or person name"
          class="w-full"
          :invalid="submitted && !form.organizerName"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Contact Info</label>
        <InputText
          v-model="form.organizerContact"
          placeholder="Email or website"
          class="w-full"
        />
      </div>
    </div>

    <!-- Turnstile -->
    <div>
      <div id="turnstile-event" ref="turnstileContainer"></div>
    </div>

    <!-- Submit -->
    <div class="flex gap-3">
      <Button
        type="submit"
        label="Submit Event"
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

const formatOptions = [
  { label: 'In Person', value: 'in_person' },
  { label: 'Online', value: 'online' },
  { label: 'Hybrid', value: 'hybrid' }
];

const typeOptions = [
  { label: 'Rally', value: 'rally' },
  { label: 'March', value: 'march' },
  { label: 'Vigil', value: 'vigil' },
  { label: 'Webinar', value: 'webinar' },
  { label: 'Panel', value: 'panel' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Other', value: 'other' }
];

const form = ref({
  title: '',
  summary: '',
  description: '',
  format: 'in_person',
  type: 'rally',
  startDate: null as Date | null,
  startTime: '',
  country: '',
  city: '',
  address: '',
  organizerName: '',
  organizerContact: ''
});

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

function handleSubmit() {
  submitted.value = true;

  if (!form.value.title || !form.value.summary || !form.value.description || !form.value.organizerName) {
    return;
  }

  const data = {
    title: form.value.title,
    summary: form.value.summary,
    description: form.value.description,
    format: form.value.format,
    type: form.value.type,
    date: {
      start: formatDate(form.value.startDate),
      start_time: form.value.startTime,
      precision: 'Exact'
    },
    location: form.value.country ? {
      country: form.value.country,
      city: form.value.city,
      address: form.value.address
    } : undefined,
    organizer: {
      name: form.value.organizerName,
      contact: form.value.organizerContact
    }
  };

  emit('submit', {
    kind: 'event',
    data,
    files: [],
    turnstileToken: turnstileToken.value
  });
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String (date.getDate()).padStart(2, '0')}`;
}

function resetForm() {
  form.value = {
    title: '',
    summary: '',
    description: '',
    format: 'in_person',
    type: 'rally',
    startDate: null,
    startTime: '',
    country: '',
    city: '',
    address: '',
    organizerName: '',
    organizerContact: ''
  };
  submitted.value = false;
}
</script>
