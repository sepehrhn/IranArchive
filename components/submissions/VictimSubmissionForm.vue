<template>
  <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
    
    <!-- Basic Information -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Victim Information</h3>
      
      <div>
        <label class="block text-sm font-medium mb-2">Photo</label>
        <FileUpload
          mode="basic"
          accept=".jpg,.jpeg,.jfif,.pjpeg,.pjp,.png,image/jpeg,image/png"
          :maxFileSize="10000000"
          @select="onFileSelect"
          chooseLabel="Choose Photo"
          class="w-full"
        />
        <small class="text-surface-500">JPG, JPEG, JFIF, PJPEG, PJP, or PNG. Max 10MB.</small>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Full Name <span class="text-red-500">*</span></label>
        <InputText
          v-model="form.name"
          placeholder="Full name of the victim"
          class="w-full"
          :invalid="submitted && !form.name"
          required
        />
      </div>

      <!-- Personal Information Section -->
      <div class="pt-4 border-t border-surface-200 dark:border-surface-700">
        <h4 class="text-md font-semibold text-surface-900 dark:text-surface-0 mb-3">Personal Information</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-2">Birth Date</label>
            <Calendar
              v-model="form.birthDate"
              dateFormat="yy/mm/dd"
              showIcon
              class="w-full"
              placeholder="YYYY/MM/DD"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Age</label>
            <InputNumber
              v-model="form.age"
              placeholder="Age"
              class="w-full"
              :min="0"
              :max="150"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-2">Birth Province</label>
            <Select
              v-model="form.birthProvince"
              :options="provinces"
              optionLabel="name"
              optionValue="name"
              placeholder="Select province"
              class="w-full"
              filter
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Birth City</label>
            <InputText
              v-model="form.birthCity"
              placeholder="e.g., Tehran"
              class="w-full"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Gender</label>
            <Select
              v-model="form.gender"
              :options="genderOptions"
              placeholder="Select gender"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Occupation</label>
            <InputText
              v-model="form.occupation"
              placeholder="e.g., Teacher"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Death Information Section -->
      <div class="pt-4 border-t border-surface-200 dark:border-surface-700">
        <h4 class="text-md font-semibold text-surface-900 dark:text-surface-0 mb-3">Death Information</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
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
          <div class="flex items-end pb-1">
            <div class="flex items-center">
              <Checkbox v-model="form.deathDateApproximate" inputId="approximate" binary />
              <label for="approximate" class="ml-2 text-sm">Approximate Date</label>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Cause of Death</label>
          <Select
            v-model="form.causeOfDeath"
            :options="causeOfDeathOptions"
            placeholder="Select cause"
            class="w-full"
          />
        </div>
      </div>

      <!-- Incident Location Section -->
      <div class="pt-4 border-t border-surface-200 dark:border-surface-700">
        <h4 class="text-md font-semibold text-surface-900 dark:text-surface-0 mb-3">Incident Location</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Province</label>
            <Select
              v-model="form.incident_province"
              :options="provinces"
              optionLabel="name"
              optionValue="name"
              placeholder="Select province"
              class="w-full"
              filter
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">City</label>
            <InputText
              v-model="form.incident_city"
              placeholder="e.g., Tehran"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Incident Description</label>
        <Textarea
          v-model="form.description"
          rows="4"
          placeholder="Detailed description of the incident..."
          class="w-full"
        />
      </div>

      <!-- Source Information Section -->
      <div class="pt-4 border-t border-surface-200 dark:border-surface-700">
        <h4 class="text-md font-semibold text-surface-900 dark:text-surface-0 mb-3">Source Information</h4>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Source Type <span class="text-red-500">*</span></label>
          <Select
            v-model="form.sourceType"
            :options="sourceTypeOptions"
            placeholder="Select source type"
            class="w-full"
            :invalid="submitted && !form.sourceType"
          />
        </div>

        <div v-if="form.sourceType === 'Social Media'" class="mb-4">
          <label class="block text-sm font-medium mb-2">Social Media Link <span class="text-red-500">*</span></label>
          <InputText
            v-model="form.socialMediaLink"
            placeholder="https://..."
            class="w-full"
            :invalid="submitted && form.sourceType === 'Social Media' && !form.socialMediaLink"
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
import provincesData from '~/data/provinces.json';

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

// Load provinces
const provinces = provincesData.map(p => ({ name: p }));

// Dropdown options
const genderOptions = ['Male', 'Female'];

const causeOfDeathOptions = [
  'Gunshot',
  'Beating',
  'Torture',
  'Execution',
  'Unknown',
  'Other'
];

const sourceTypeOptions = [
  'Family or Close Friend',
  'Eyewitness',
  'Hospital/Forensic',
  'Local Report',
  'Social Media'
];

const form = ref({
  name: '',
  // Personal info
  birthDate: null as Date | null,
  birthProvince: '',
  birthCity: '',
  gender: '',
  age: null as number | null,
  occupation: '',
  // Death info
  dateOfDeath: null as Date | null,
  deathDateApproximate: false,
  causeOfDeath: '',
  // Incident location
  incident_province: '',
  incident_city: '',
  // Description
  description: '',
  // Source info
  sourceType: '',
  socialMediaLink: ''
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

  if (!form.value.name || !form.value.sourceType) {
    return;
  }

  // Validate social media link if source type is Social Media
  if (form.value.sourceType === 'Social Media' && !form.value.socialMediaLink) {
    return;
  }

  const sources = sourcesText.value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const data = {
    name: form.value.name,
    // Personal info
    birth_date: formatDate(form.value.birthDate),
    birth_province: form.value.birthProvince,
    birth_city: form.value.birthCity,
    gender: form.value.gender,
    age: form.value.age,
    occupation: form.value.occupation,
    // Location
    country: 'Iran',
    incident_province: form.value.incident_province,
    incident_city: form.value.incident_city,
    // Death info
    date_of_death: formatDate(form.value.dateOfDeath),
    date_of_death_precision: form.value.dateOfDeath ? (form.value.deathDateApproximate ? 'Approximate' : 'Exact') : '',
    cause_of_death: form.value.causeOfDeath,
    // Content
    description: form.value.description,
    // Sources
    source_type: form.value.sourceType,
    source_social_media_link: form.value.socialMediaLink,
    sources,
    // Status
    status: 'verified'
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
    // Personal info
    birthDate: null,
    birthProvince: '',
    birthCity: '',
    gender: '',
    age: null,
    occupation: '',
    // Death info
    dateOfDeath: null,
    deathDateApproximate: false,
    causeOfDeath: '',
    // Incident location
    incident_province: '',
    incident_city: '',
    // Description
    description: '',
    // Source info
    sourceType: '',
    socialMediaLink: ''
  };
  sourcesText.value = '';
  selectedFile.value = null;
  submitted.value = false;
}
</script>
