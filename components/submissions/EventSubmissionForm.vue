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
          <label class="block text-sm font-medium mb-2">Event Type <span class="text-red-500">*</span></label>
          <Select
            v-model="form.type"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select type"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Poster URL (optional)</label>
          <InputText
            v-model="form.poster"
            placeholder="https://example.com/poster.jpg"
            class="w-full"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Start Date <span class="text-red-500">*</span></label>
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
        <label class="block text-sm font-medium mb-2">Organizer Name <span class="text-red-500">*</span></label>
        <InputText
          v-model="form.organizerName"
          placeholder="Organization or person name"
          class="w-full"
          :invalid="submitted && !form.organizerName"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Organizer Website/Contact</label>
        <InputText
          v-model="form.organizerContact"
          placeholder="Website URL or contact email"
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
        :label="initialData ? 'Update Event' : 'Submit Event'"
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
  initialData?: ParsedEvent | null;
}>();

const emit = defineEmits<{
  submit: [payload: any];
}>();

const config = useRuntimeConfig();
const turnstileContainer = ref<HTMLElement>();
const turnstileToken = ref('');
const submitted = ref(false);

const typeOptions = [
  { label: 'In Person', value: 'in_person' },
  { label: 'Online', value: 'online' },
  { label: 'Hybrid', value: 'hybrid' }
];

const form = ref({
  title: props.initialData?.title || '',
  description: props.initialData?.description || '',
  type: props.initialData?.type || 'in_person',
  poster: props.initialData?.poster || '',
  startDate: props.initialData?.date.start ? new Date(props.initialData.date.start.replace(/\//g, '-')) : null as Date | null,
  startTime: props.initialData?.date.start_time || '',
  country: props.initialData?.location?.country || '',
  city: props.initialData?.location?.city || '',
  address: props.initialData?.location?.address || '',
  organizerName: props.initialData?.organizer.name || '',
  organizerContact: props.initialData?.organizer.website || props.initialData?.organizer.contact_email || ''
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

  if (!form.value.title || !form.value.description || !form.value.organizerName) {
    return;
  }

  const data = {
    title: form.value.title,
    description: form.value.description,
    type: form.value.type,
    poster: form.value.poster || undefined,
    date: {
      start: formatDate(form.value.startDate),
      start_time: form.value.startTime
    },
    location: (form.value.type === 'in_person' || form.value.type === 'hybrid') ? {
      country: form.value.country,
      city: form.value.city,
      address: form.value.address
    } : undefined,
    online: (form.value.type === 'online' || form.value.type === 'hybrid') ? {
      platform: 'Online',
      join_url: form.value.organizerContact.startsWith('http') ? form.value.organizerContact : undefined
    } : undefined,
    organizer: {
      name: form.value.organizerName,
      website: form.value.organizerContact.startsWith('http') ? form.value.organizerContact : undefined,
      contact_email: form.value.organizerContact.includes('@') ? form.value.organizerContact : undefined
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
    description: '',
    type: 'in_person',
    poster: '',
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
