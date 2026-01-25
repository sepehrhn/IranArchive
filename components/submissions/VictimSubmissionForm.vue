<template>
  <div class="space-y-6">
    <!-- Stepper Header -->
    <div class="flex items-center justify-between mb-6">
      <div 
        v-for="(step, index) in steps" 
        :key="step.id"
        class="flex items-center flex-1"
      >
        <div class="flex items-center gap-3">
          <div 
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all',
              currentStep === index 
                ? 'bg-primary-500 text-white shadow-lg scale-110' 
                : currentStep > index 
                  ? 'bg-green-500 text-white' 
                  : 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400'
            ]"
          >
            <i v-if="currentStep > index" class="pi pi-check"></i>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="hidden sm:block">
            <p 
              :class="[
                'text-sm font-medium',
                currentStep === index 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-surface-600 dark:text-surface-400'
              ]"
            >
              {{ step.label }}
            </p>
          </div>
        </div>
        <div 
          v-if="index < steps.length - 1" 
          :class="[
            'flex-1 h-1 mx-4 rounded',
            currentStep > index 
              ? 'bg-green-500' 
              : 'bg-surface-200 dark:bg-surface-700'
          ]"
        ></div>
      </div>
    </div>

    <!-- Step Content -->
    <form @submit.prevent="handleNext">
      
      <!-- Step 1: Type -->
      <div v-if="currentStep === 0" class="space-y-6">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-2">What happened?</h2>
          <p class="text-surface-500">Select the status of the victim you are reporting</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <button
            type="button"
            @click="form.status = 'Killed'"
            :class="[
              'p-8 rounded-xl border-2 transition-all text-left',
              form.status === 'Killed'
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-lg'
                : 'border-surface-200 dark:border-surface-700 hover:border-red-300 hover:bg-surface-50 dark:hover:bg-surface-800'
            ]"
          >
            <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-4">
              <i class="pi pi-heart-fill text-3xl text-red-500"></i>
            </div>
            <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-2">Killed</h3>
            <p class="text-surface-500 text-sm">The person was killed during the protests or by regime forces.</p>
          </button>

          <button
            type="button"
            @click="form.status = 'Missing'"
            :class="[
              'p-8 rounded-xl border-2 transition-all text-left',
              form.status === 'Missing'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
                : 'border-surface-200 dark:border-surface-700 hover:border-orange-300 hover:bg-surface-50 dark:hover:bg-surface-800'
            ]"
          >
            <div class="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center mb-4">
              <i class="pi pi-question-circle text-3xl text-orange-500"></i>
            </div>
            <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-2">Missing</h3>
            <p class="text-surface-500 text-sm">The person is missing and their whereabouts are unknown.</p>
          </button>
        </div>

        <p v-if="stepErrors.status" class="text-red-500 text-center text-sm mt-4">
          Please select a status to continue
        </p>
      </div>

      <!-- Step 2: Personal Info -->
      <div v-if="currentStep === 1" class="space-y-6">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-2">Personal Information</h2>
          <p class="text-surface-500">Tell us about the victim</p>
        </div>

        <div class="max-w-2xl mx-auto space-y-5">
          <!-- Photo Upload -->
          <div>
            <label class="block text-sm font-medium mb-2 text-surface-700 dark:text-surface-300">Photo</label>
            <label 
              class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all"
              :class="[
                selectedFile 
                  ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-surface-300 dark:border-surface-600 hover:border-primary-400 dark:hover:border-primary-500 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700'
              ]"
            >
              <!-- Preview if file selected -->
              <div v-if="selectedFile && previewUrl" class="flex items-center gap-4 px-4">
                <img :src="previewUrl" alt="Preview" class="w-16 h-16 rounded-lg object-cover shadow-sm" />
                <div class="text-left">
                  <p class="text-sm font-medium text-surface-900 dark:text-surface-0 truncate max-w-[200px]">{{ selectedFile.name }}</p>
                  <p class="text-xs text-surface-500">{{ formatFileSize(selectedFile.size) }}</p>
                  <button 
                    type="button"
                    @click.prevent="clearFile"
                    class="text-xs text-red-500 hover:text-red-600 mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <!-- Default upload prompt -->
              <div v-else class="flex flex-col items-center justify-center py-4">
                <div class="w-12 h-12 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center mb-2">
                  <i class="pi pi-image text-xl text-surface-400 dark:text-surface-500"></i>
                </div>
                <p class="text-sm text-surface-600 dark:text-surface-400">Click to upload photo</p>
                <p class="text-xs text-surface-400 dark:text-surface-500 mt-1">JPG, PNG. Max 10MB</p>
              </div>
              <input 
                type="file" 
                class="hidden" 
                accept=".jpg,.jpeg,.jfif,.pjpeg,.pjp,.png,image/jpeg,image/png"
                @change="onFileInputChange"
              />
            </label>
          </div>

          <!-- Name -->
          <div>
            <label class="block text-sm font-medium mb-2">Full Name <span class="text-red-500">*</span></label>
            <InputText
              v-model="form.name"
              placeholder="Full name of the victim"
              class="w-full"
              :invalid="stepErrors.name"
            />
            <small v-if="stepErrors.name" class="text-red-500">Name is required</small>
          </div>

          <!-- Age & Gender -->
          <div class="grid grid-cols-2 gap-4">
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
            <div>
              <label class="block text-sm font-medium mb-2">Gender</label>
              <Select
                v-model="form.gender"
                :options="genderOptions"
                placeholder="Select"
                class="w-full"
              />
            </div>
          </div>

          <!-- Occupation -->
          <div>
            <label class="block text-sm font-medium mb-2">Occupation</label>
            <InputText
              v-model="form.occupation"
              placeholder="e.g., Teacher, Student, Engineer"
              class="w-full"
            />
          </div>

          <!-- Birth Information -->
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
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Birth Province</label>
              <Select
                v-model="form.birthProvince"
                :options="provinces"
                optionLabel="name"
                optionValue="name"
                placeholder="Province"
                class="w-full"
                filter
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Birth City</label>
              <InputText
                v-model="form.birthCity"
                placeholder="City"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Incident Details -->
      <div v-if="currentStep === 2" class="space-y-6">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-2">Incident Details</h2>
          <p class="text-surface-500">Provide information about the incident</p>
        </div>

        <div class="max-w-2xl mx-auto space-y-5">
          <!-- Location -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">
                {{ form.status === 'Missing' ? 'Last Seen Location - Province' : 'Incident Location - Province' }}
              </label>
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
              <label class="block text-sm font-medium mb-2">
                {{ form.status === 'Missing' ? 'Last Seen Location - City' : 'Incident Location - City' }}
              </label>
              <InputText
                v-model="form.incident_city"
                placeholder="e.g., Tehran"
                class="w-full"
              />
            </div>
          </div>

          <!-- Date -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">
                {{ form.status === 'Missing' ? 'Last Seen Date' : 'Date of Death' }}
              </label>
              <Calendar
                v-model="form.dateOfDeath"
                dateFormat="yy/mm/dd"
                showIcon
                class="w-full"
                placeholder="YYYY/MM/DD"
              />
            </div>
            <div class="flex items-end pb-2">
              <div class="flex items-center">
                <Checkbox v-model="form.deathDateApproximate" inputId="approximate" binary />
                <label for="approximate" class="ml-2 text-sm">Approximate Date</label>
              </div>
            </div>
          </div>

          <!-- Cause of Death (only for Killed) -->
          <div v-if="form.status === 'Killed'">
            <label class="block text-sm font-medium mb-2">Cause of Death</label>
            <Select
              v-model="form.causeOfDeath"
              :options="causeOfDeathOptions"
              placeholder="Select cause"
              class="w-full"
            />
          </div>

          <!-- Disappearance Circumstances (only for Missing) -->
          <div v-if="form.status === 'Missing'">
            <label class="block text-sm font-medium mb-2">Disappearance Circumstances</label>
            <Select
              v-model="form.disappearanceCircumstances"
              :options="disappearanceCircumstancesOptions"
              placeholder="Select circumstances"
              class="w-full"
            />
          </div>

          <!-- Suspected Actor (only for Missing) -->
          <div v-if="form.status === 'Missing'">
            <label class="block text-sm font-medium mb-2">Suspected Actor</label>
            <Select
              v-model="form.suspectedActor"
              :options="suspectedActorOptions"
              placeholder="Select suspected actor"
              class="w-full"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium mb-2">
              {{ form.status === 'Missing' ? 'Additional Details' : 'Incident Description' }}
            </label>
            <Textarea
              v-model="form.description"
              rows="4"
              :placeholder="form.status === 'Missing' ? 'Any additional details about the disappearance...' : 'Describe what happened, any details about the incident...'"
              class="w-full"
            />
          </div>

          <!-- Source Information -->
          <div class="border-t border-surface-200 dark:border-surface-700 pt-5">
            <h3 class="font-semibold mb-4">Source Information</h3>
            
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">Source Type <span class="text-red-500">*</span></label>
              <Select
                v-model="form.sourceType"
                :options="sourceTypeOptions"
                placeholder="How do you know about this?"
                class="w-full"
                :invalid="stepErrors.sourceType"
              />
               <small v-if="stepErrors.sourceType" class="text-red-500">Source type is required</small>
            </div>

            <div v-if="form.sourceType === 'Social Media'">
              <label class="block text-sm font-medium mb-2">Social Media Link <span class="text-red-500">*</span></label>
              <InputText
                v-model="form.socialMediaLink"
                placeholder="https://twitter.com/... or https://instagram.com/..."
                class="w-full"
                :invalid="stepErrors.socialMediaLink"
              />
              <small v-if="stepErrors.socialMediaLink" class="text-red-500">Link is required for social media sources</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: Review -->
      <div v-if="currentStep === 3" class="space-y-6">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-2">Review Your Submission</h2>
          <p class="text-surface-500">Please verify all information before submitting</p>
        </div>

        <div class="max-w-2xl mx-auto space-y-4">
          <!-- Status Badge -->
          <div class="text-center mb-6">
            <span 
              :class="[
                'inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg',
                form.status === 'Killed' 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
              ]"
            >
              <i :class="form.status === 'Killed' ? 'pi pi-heart-fill' : 'pi pi-question-circle'"></i>
              {{ form.status }}
            </span>
          </div>

          <!-- Personal Info Card -->
          <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-5">
            <h3 class="font-bold text-surface-900 dark:text-surface-0 mb-3 flex items-center gap-2">
              <i class="pi pi-user text-primary-500"></i>
              Personal Information
            </h3>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-surface-500">Name:</span>
                <span class="ml-2 font-medium text-surface-900 dark:text-surface-0">{{ form.name || '-' }}</span>
              </div>
              <div>
                <span class="text-surface-500">Age:</span>
                <span class="ml-2 font-medium text-surface-900 dark:text-surface-0">{{ form.age || '-' }}</span>
              </div>
              <div>
                <span class="text-surface-500">Gender:</span>
                <span class="ml-2 font-medium text-surface-900 dark:text-surface-0">{{ form.gender || '-' }}</span>
              </div>
              <div>
                <span class="text-surface-500">Occupation:</span>
                <span class="ml-2 font-medium text-surface-900 dark:text-surface-0">{{ form.occupation || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- Incident Details Card -->
          <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-5">
            <h3 class="font-bold text-surface-900 dark:text-surface-0 mb-3 flex items-center gap-2">
              <i class="pi pi-map-marker text-red-500"></i>
              {{ form.status === 'Missing' ? 'Disappearance Details' : 'Incident Details' }}
            </h3>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-surface-500">{{ form.status === 'Missing' ? 'Last Seen:' : 'Location:' }}</span>
                <span class="ml-2 font-medium text-surface-900 dark:text-surface-0">
                  {{ form.incident_city || '-' }}{{ form.incident_province ? `, ${form.incident_province}` : '' }}
                </span>
              </div>
              <div>
                <span class="text-surface-500">{{ form.status === 'Missing' ? 'Last Seen Date:' : 'Date:' }}</span>
                <span class="ml-2 font-medium text-surface-900 dark:text-surface-0">
                  {{ form.dateOfDeath ? formatDateDisplay(form.dateOfDeath) : '-' }}
                  {{ form.deathDateApproximate ? '(Approx.)' : '' }}
                </span>
              </div>
              <div v-if="form.status === 'Killed'">
                <span class="text-surface-500">Cause:</span>
                <span class="ml-2 font-medium text-surface-900 dark:text-surface-0">{{ form.causeOfDeath || '-' }}</span>
              </div>
              <div v-if="form.status === 'Missing'">
                <span class="text-surface-500">Circumstances:</span>
                <span class="ml-2 font-medium text-surface-900 dark:text-surface-0">{{ form.disappearanceCircumstances || '-' }}</span>
              </div>
              <div v-if="form.status === 'Missing'">
                <span class="text-surface-500">Suspected Actor:</span>
                <span class="ml-2 font-medium text-surface-900 dark:text-surface-0">{{ form.suspectedActor || '-' }}</span>
              </div>
              <div>
                <span class="text-surface-500">Source:</span>
                <span class="ml-2 font-medium text-surface-900 dark:text-surface-0">{{ form.sourceType || '-' }}</span>
              </div>
            </div>
            <div v-if="form.description" class="mt-3 pt-3 border-t border-surface-200 dark:border-surface-700">
              <p class="text-surface-500 text-xs mb-1">{{ form.status === 'Missing' ? 'Additional Details:' : 'Description:' }}</p>
              <p class="text-sm text-surface-700 dark:text-surface-300">{{ form.description }}</p>
            </div>
          </div>

          <!-- Turnstile -->
          <div class="flex justify-center pt-4">
            <div id="turnstile-victim" ref="turnstileContainer"></div>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between mt-8 pt-6 border-t border-surface-200 dark:border-surface-700">
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
          />
          <Button
            v-else
            type="button"
            label="Submit Report"
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
const selectedFile = ref<File | null>(null);

// Steps
const steps = [
  { id: 'type', label: 'Type' },
  { id: 'personal', label: 'Personal Info' },
  { id: 'incident', label: 'Incident Details' },
  { id: 'review', label: 'Review' }
];
const currentStep = ref(0);
const stepErrors = ref<Record<string, boolean>>({});

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

const disappearanceCircumstancesOptions = [
  'Disappeared during protests',
  'Arrested and transferred to unknown location',
  'Abducted from home',
  'Disappeared after detention',
  'Unknown'
];

const suspectedActorOptions = [
  'Security Forces',
  'Plainclothes Agents',
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
  status: '' as 'Killed' | 'Missing' | '',
  name: '',
  // Personal info
  birthDate: null as Date | null,
  birthProvince: '',
  birthCity: '',
  gender: '',
  age: null as number | null,
  occupation: '',
  // Death/Disappearance info
  dateOfDeath: null as Date | null,
  deathDateApproximate: false,
  causeOfDeath: '',
  // Missing-specific fields
  disappearanceCircumstances: '',
  suspectedActor: '',
  // Incident location
  incident_province: '',
  incident_city: '',
  // Description
  description: '',
  // Source info
  sourceType: '',
  socialMediaLink: ''
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

// File handling
const previewUrl = ref<string | null>(null);

function onFileInputChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    // Check file size (10MB max)
    if (file.size > 10000000) {
      alert('File size must be under 10MB');
      return;
    }
    selectedFile.value = file;
    // Create preview URL
    previewUrl.value = URL.createObjectURL(file);
  }
}

function clearFile() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  selectedFile.value = null;
  previewUrl.value = null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function onFileSelect(event: any) {
  selectedFile.value = event.files[0];
}

function validateStep(): boolean {
  stepErrors.value = {};

  if (currentStep.value === 0) {
    if (!form.value.status) {
      stepErrors.value.status = true;
      return false;
    }
  }

  if (currentStep.value === 1) {
    if (!form.value.name.trim()) {
      stepErrors.value.name = true;
      return false;
    }
  }

  if (currentStep.value === 2) {
    if (!form.value.sourceType) {
      stepErrors.value.sourceType = true;
      return false;
    }
    if (form.value.sourceType === 'Social Media' && !form.value.socialMediaLink) {
      stepErrors.value.socialMediaLink = true;
      return false;
    }
  }

  return true;
}

function handleNext() {
  if (validateStep()) {
    currentStep.value++;
    // Render turnstile when reaching review step
    if (currentStep.value === 3) {
      setTimeout(() => renderTurnstile(), 100);
    }
  }
}

function handleSubmit() {
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
    // Death/Disappearance info
    date_of_death: formatDate(form.value.dateOfDeath),
    date_of_death_precision: form.value.dateOfDeath ? (form.value.deathDateApproximate ? 'Approximate' : 'Exact') : '',
    cause_of_death: form.value.status === 'Killed' ? form.value.causeOfDeath : '',
    // Missing-specific fields
    disappearance_circumstances: form.value.status === 'Missing' ? form.value.disappearanceCircumstances : '',
    suspected_actor: form.value.status === 'Missing' ? form.value.suspectedActor : '',
    // Content
    description: form.value.description,
    // Sources
    source_type: form.value.sourceType,
    source_social_media_link: form.value.socialMediaLink,
    // Status
    status: form.value.status
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

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
</script>
