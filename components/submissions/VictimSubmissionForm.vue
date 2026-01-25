<template>
  <div class="space-y-6">
    <!-- Stepper Header Redesign -->
    <div class="relative mb-16 pt-4 px-6 md:px-12">
      <!-- Progress Bar Background (Behind) -->
      <div class="absolute top-[2.25rem] left-10 right-10 md:left-24 md:right-24 h-1 bg-surface-100 dark:bg-surface-800 rounded-full">
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
              'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 relative',
              currentStep === index 
                ? 'bg-primary-500 text-white shadow-[0_0_20px_rgba(var(--primary-500-rgb),0.4)] scale-110 rotate-3' 
                : currentStep > index 
                  ? 'bg-green-500 text-white scale-90' 
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-600 border border-surface-200 dark:border-surface-700'
            ]"
          >
            <i v-if="currentStep > index" class="pi pi-check text-xs"></i>
            <span v-else>{{ index + 1 }}</span>
            
            <!-- Active Pulse Effect -->
            <div v-if="currentStep === index" class="absolute inset-0 rounded-xl bg-primary-500 animate-ping opacity-20"></div>
          </div>

          <!-- Step Label -->
          <div 
            class="mt-4 text-center transition-all duration-300 w-20 sm:w-32"
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
      
      <!-- Step 1: Type -->
      <div v-if="currentStep === 0" class="space-y-6">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-2">What happened?</h2>
          <p class="text-surface-500">Select the status of the victim you are reporting</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <button
            type="button"
            @click="form.status = 'Killed'"
            :class="[
              'group p-8 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden',
              form.status === 'Killed'
                ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10 shadow-xl scale-[1.02]'
                : 'border-surface-200 dark:border-surface-800 hover:border-red-300 hover:bg-red-50/20 dark:hover:bg-red-900/5'
            ]"
          >
            <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-48 h-48 text-red-500">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09l.4-.5C13.1 3.3 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.5 11.5L12 21.35zm0-16.3c-1.5 0-2.8.8-3.6 2.1l3.6 4.4L10 14l2 4-1.5 2.5 1.5.8 2-3L12 14l2-2.5-3.5-4.4c.7-1.3 2.1-2.1 3.5-2.1c2.2 0 4 1.8 4 4c0 2.8-2.5 5.3-7.5 9.8l1 1c5-4.5 7.5-7.5 7.5-10.8 0-3.3-2.7-6-6-6z" />
              </svg>
            </div>
            
            <div 
              :class="[
                'w-24 h-24 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500',
                form.status === 'Killed' ? 'bg-red-500 shadow-lg shadow-red-500/40 rotate-6' : 'bg-red-100 dark:bg-red-900/40 group-hover:rotate-3'
              ]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" :class="['w-14 h-14 transition-colors duration-500', form.status === 'Killed' ? 'text-white' : 'text-red-500']">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09l.4-.5C13.1 3.3 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.5 11.5L12 21.35zm0-16.3c-1.5 0-2.8.8-3.6 2.1l3.6 4.4L10 14l2 4-1.5 2.5 1.5.8 2-3L12 14l2-2.5-3.5-4.4c.7-1.3 2.1-2.1 3.5-2.1c2.2 0 4 1.8 4 4c0 2.8-2.5 5.3-7.5 9.8l1 1c5-4.5 7.5-7.5 7.5-10.8 0-3.3-2.7-6-6-6z" />
              </svg>
            </div>
            
            <h3 class="text-2xl font-black text-surface-900 dark:text-surface-0 mb-2">Killed</h3>
            <p class="text-surface-500 dark:text-surface-400 text-sm leading-relaxed">Report a martyr who was killed by the regime forces.</p>
          </button>

          <button
            type="button"
            @click="form.status = 'Missing'"
            :class="[
              'group p-8 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden',
              form.status === 'Missing'
                ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-900/10 shadow-xl scale-[1.02]'
                : 'border-surface-200 dark:border-surface-800 hover:border-orange-300 hover:bg-orange-50/20 dark:hover:bg-orange-900/5'
            ]"
          >
            <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <i class="pi pi-search text-9xl text-orange-500"></i>
            </div>

            <div 
              :class="[
                'w-24 h-24 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500',
                form.status === 'Missing' ? 'bg-orange-500 shadow-lg shadow-orange-500/40 -rotate-6' : 'bg-orange-100 dark:bg-orange-900/40 group-hover:-rotate-3'
              ]"
            >
              <i :class="['pi pi-search text-5xl transition-colors duration-500', form.status === 'Missing' ? 'text-white' : 'text-orange-500']"></i>
            </div>
            
            <h3 class="text-2xl font-black text-surface-900 dark:text-surface-0 mb-2">Missing</h3>
            <p class="text-surface-500 dark:text-surface-400 text-sm leading-relaxed">Report someone who has been abducted or is missing.</p>
          </button>
        </div>

        <p v-if="stepErrors.status" class="text-red-500 text-center text-sm mt-4">
          Please select a status to continue
        </p>
      </div>

      <!-- Step 2: Personal Info -->
      <div v-if="currentStep === 1" class="space-y-8">
        <div class="text-center mb-10">
          <div class="inline-block p-3 rounded-2xl bg-primary-50 dark:bg-primary-900/20 mb-4">
            <i class="pi pi-user text-3xl text-primary-500"></i>
          </div>
          <h2 class="text-3xl font-black text-surface-900 dark:text-surface-0 mb-2">Personal Information</h2>
          <p class="text-surface-500 text-lg">Tell us about the identity of the victim</p>
        </div>

        <div class="max-w-2xl mx-auto space-y-6">
          <!-- Photo Upload Redesign -->
          <div class="relative group">
            <label class="block text-sm font-bold mb-3 text-surface-700 dark:text-surface-300 ml-1">Victim Photo</label>
            <div 
              class="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden"
              :class="[
                selectedFile 
                  ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-900/10' 
                  : 'border-surface-300 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-500 bg-surface-100 dark:bg-surface-900 hover:bg-surface-200 dark:hover:bg-surface-800'
              ]"
            >
              <input 
                type="file" 
                class="absolute inset-0 opacity-0 cursor-pointer z-20" 
                accept=".jpg,.jpeg,.jfif,.pjpeg,.pjp,.png,image/jpeg,image/png"
                @change="onFileInputChange"
              />
              
              <!-- Preview if file selected -->
              <div v-if="selectedFile && previewUrl" class="absolute inset-0 flex items-center gap-6 px-6 z-10 bg-surface-0/90 dark:bg-surface-900/90 backdrop-blur-sm">
                <div class="relative group/img">
                  <img :src="previewUrl" alt="Preview" class="w-24 h-24 rounded-2xl object-cover shadow-2xl ring-4 ring-surface-100 dark:ring-surface-800 dark:brightness-[0.85]" />
                  <div class="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <i class="pi pi-eye text-white text-xl"></i>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-base font-bold text-surface-900 dark:text-surface-0 truncate">{{ selectedFile.name }}</p>
                  <p class="text-sm text-surface-500 font-medium">{{ formatFileSize(selectedFile.size) }}</p>
                  <button 
                    type="button"
                    @click.stop.prevent="clearFile"
                    class="mt-3 px-4 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 text-xs font-bold transition-colors flex items-center gap-2"
                  >
                    <i class="pi pi-trash"></i>
                    Remove Photo
                  </button>
                </div>
              </div>

              <!-- Default upload prompt -->
              <div v-else class="flex flex-col items-center justify-center py-6 pointer-events-none">
                <div class="w-16 h-16 rounded-3xl bg-surface-200 dark:bg-surface-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <i class="pi pi-cloud-upload text-3xl text-surface-500 group-hover:text-primary-500 transition-colors"></i>
                </div>
                <p class="text-lg font-bold text-surface-700 dark:text-surface-200">Drop photo here or click</p>
                <p class="text-sm text-surface-500 mt-2">Maximum file size: <span class="font-bold">2MB</span></p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name -->
            <div class="md:col-span-2">
              <IftaLabel>
                <InputText
                  id="v_name"
                  v-model="form.name"
                  class="w-full"
                  variant="filled"
                  :invalid="stepErrors.name"
                />
                <label for="v_name">Full Name *</label>
              </IftaLabel>
              <small v-if="stepErrors.name" class="text-red-500 mt-1 block px-1">Please enter the victim's name</small>
            </div>

            <!-- Age & Gender -->
            <IftaLabel>
              <InputNumber
                id="v_age"
                v-model="form.age"
                class="w-full"
                variant="filled"
                :min="0"
                :max="150"
              />
              <label for="v_age">Age</label>
            </IftaLabel>

            <IftaLabel>
              <Select
                id="v_gender"
                v-model="form.gender"
                :options="genderOptions"
                class="w-full"
                variant="filled"
              />
              <label for="v_gender">Gender</label>
            </IftaLabel>

            <!-- Occupation -->
            <div class="md:col-span-2">
              <IftaLabel>
                <InputText
                  id="v_occ"
                  v-model="form.occupation"
                  class="w-full"
                  variant="filled"
                />
                <label for="v_occ">Occupation (e.g., Student, Teacher)</label>
              </IftaLabel>
            </div>

            <!-- Birth Information -->
            <div class="md:col-span-2">
              <IftaLabel>
                <Calendar
                  id="v_birth_date"
                  v-model="form.birthDate"
                  dateFormat="yy/mm/dd"
                  showIcon
                  class="w-full"
                  variant="filled"
                  placeholder=" "
                />
                <label for="v_birth_date">Birth Date (YYYY/MM/DD)</label>
              </IftaLabel>
            </div>
            
            <IftaLabel>
              <AutoComplete
                id="v_birth_prov"
                v-model="form.birthProvince"
                :suggestions="filteredProvinces"
                @complete="searchProvinces"
                optionLabel="name"
                optionValue="name"
                class="w-full"
                variant="filled"
                dropdown
              />
              <label for="v_birth_prov">Birth Province</label>
            </IftaLabel>

            <IftaLabel>
              <InputText
                id="v_birth_city"
                v-model="form.birthCity"
                class="w-full"
                variant="filled"
              />
              <label for="v_birth_city">Birth City</label>
            </IftaLabel>
          </div>
        </div>
      </div>

      <!-- Step 3: Incident Details -->
      <div v-if="currentStep === 2" class="space-y-8">
        <div class="text-center mb-10">
          <div class="inline-block p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 mb-4">
            <i class="pi pi-map-marker text-3xl text-red-500"></i>
          </div>
          <h2 class="text-3xl font-black text-surface-900 dark:text-surface-0 mb-2">Incident Details</h2>
          <p class="text-surface-500 text-lg">Help us document what happened and where</p>
        </div>

        <div class="max-w-2xl mx-auto space-y-8">
          <!-- Location Group -->
          <div class="space-y-4">
            <h3 class="text-xs font-black uppercase tracking-widest text-surface-400 mb-2">Location</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IftaLabel>
                <AutoComplete
                  id="inc_prov"
                  v-model="form.incident_province"
                  :suggestions="filteredProvinces"
                  @complete="searchProvinces"
                  optionLabel="name"
                  optionValue="name"
                  class="w-full"
                  variant="filled"
                  dropdown
                />
                <label for="inc_prov">{{ form.status === 'Missing' ? 'Last Seen Province' : 'Incident Province' }}</label>
              </IftaLabel>

              <IftaLabel>
                <InputText
                  id="inc_city"
                  v-model="form.incident_city"
                  class="w-full"
                  variant="filled"
                />
                <label for="inc_city">{{ form.status === 'Missing' ? 'Last Seen City' : 'Incident City' }}</label>
              </IftaLabel>
            </div>
          </div>

          <!-- Date Group -->
          <div class="space-y-4">
            <h3 class="text-xs font-black uppercase tracking-widest text-surface-400 mb-2">Timeline</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IftaLabel>
                <Calendar
                  id="inc_date"
                  v-model="form.dateOfDeath"
                  dateFormat="yy/mm/dd"
                  showIcon
                  class="w-full"
                  variant="filled"
                  placeholder=" "
                />
                <label for="inc_date">{{ form.status === 'Missing' ? 'Last Seen Date' : 'Date of Death' }}</label>
              </IftaLabel>

              <div class="flex items-center gap-3 bg-surface-100 dark:bg-surface-900 p-3 rounded-xl border border-surface-200 dark:border-surface-700 w-full">
                <Checkbox v-model="form.deathDateApproximate" inputId="approximate" binary />
                <label for="approximate" class="text-sm font-bold text-surface-700 dark:text-surface-300">Approximate Date</label>
              </div>
            </div>
          </div>

          <!-- Specific Fields based on status -->
          <div class="space-y-6">
            <h3 class="text-xs font-black uppercase tracking-widest text-surface-400 mb-2">Circumstances</h3>
            
            <IftaLabel v-if="form.status === 'Killed'">
              <Select
                id="inc_cause"
                v-model="form.causeOfDeath"
                :options="causeOfDeathOptions"
                class="w-full"
                variant="filled"
              />
              <label for="inc_cause">Cause of Death</label>
            </IftaLabel>

            <template v-if="form.status === 'Missing'">
              <div class="grid grid-cols-1 gap-6">
                <IftaLabel>
                  <Select
                    id="inc_circum"
                    v-model="form.disappearanceCircumstances"
                    :options="disappearanceCircumstancesOptions"
                    class="w-full"
                    variant="filled"
                  />
                  <label for="inc_circum">Disappearance Circumstances</label>
                </IftaLabel>

                <IftaLabel>
                  <Select
                    id="inc_actor"
                    v-model="form.suspectedActor"
                    :options="suspectedActorOptions"
                    class="w-full"
                    variant="filled"
                  />
                  <label for="inc_actor">Suspected Actor</label>
                </IftaLabel>
              </div>
            </template>

            <IftaLabel>
              <Textarea
                id="inc_desc"
                v-model="form.description"
                rows="4"
                class="w-full"
                variant="filled"
                autoResize
              />
              <label for="inc_desc">{{ form.status === 'Missing' ? 'Additional Details' : 'Incident Description' }}</label>
            </IftaLabel>
          </div>

          <!-- Source Information -->
          <div class="p-6 rounded-2xl bg-primary-50/50 dark:bg-primary-900/5 border border-primary-100 dark:border-primary-900/20 space-y-6">
            <div class="flex items-center gap-3 mb-2">
              <i class="pi pi-verified text-primary-500"></i>
              <h3 class="font-bold text-surface-900 dark:text-surface-0">Source Verification</h3>
            </div>
            
            <div class="grid grid-cols-1 gap-6">
              <div>
                <IftaLabel>
                  <Select
                    id="src_type"
                    v-model="form.sourceType"
                    :options="sourceTypeOptions"
                    class="w-full"
                    variant="filled"
                    :invalid="stepErrors.sourceType"
                  />
                  <label for="src_type">Source Type *</label>
                </IftaLabel>
                <small v-if="stepErrors.sourceType" class="text-red-500 mt-1 block px-1">Please select a source type</small>
              </div>

              <div v-if="form.sourceType === 'Social Media'">
                <IftaLabel>
                  <InputText
                    id="src_link"
                    v-model="form.socialMediaLink"
                    class="w-full"
                    variant="filled"
                    :invalid="stepErrors.socialMediaLink"
                  />
                  <label for="src_link">Social Media Link *</label>
                </IftaLabel>
                <small v-if="stepErrors.socialMediaLink" class="text-red-500 mt-1 block px-1">Link is required for social media sources</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: Review -->
      <div v-if="currentStep === 3" class="space-y-8">
        <div class="text-center mb-10">
          <div class="inline-block p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 mb-4">
            <i class="pi pi-clipboard text-3xl text-amber-500"></i>
          </div>
          <h2 class="text-3xl font-black text-surface-900 dark:text-surface-0 mb-2">Review Submission</h2>
          <p class="text-surface-500 text-lg">Verify the record before official archival</p>
        </div>

        <div class="max-w-4xl mx-auto">
          <div class="bg-surface-0 dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-2xl overflow-hidden">
            <!-- Header/Status Banner -->
            <div 
              :class="[
                'px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b',
                form.status === 'Killed' ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20' : 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20'
              ]"
            >
              <div class="flex items-center gap-4">
                <div 
                  :class="[
                    'w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg',
                    form.status === 'Killed' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                  ]"
                >
                  <i :class="form.status === 'Killed' ? 'pi pi-heart-fill' : 'pi pi-search'"></i>
                </div>
                <div>
                  <h3 class="text-xl font-black text-surface-900 dark:text-surface-0">ARCHIVAL RECORD</h3>
                  <p :class="['text-sm font-bold uppercase tracking-widest', form.status === 'Killed' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400']">
                    {{ form.status }} Status
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-800 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700">
                <i class="pi pi-calendar text-primary-500"></i>
                <span class="text-sm font-bold text-surface-600 dark:text-surface-300">{{ new Date().toLocaleDateString() }}</span>
              </div>
            </div>

            <div class="p-8 md:p-10">
              <div class="grid grid-cols-1 md:grid-cols-12 gap-10">
                <!-- Left: Photo & Basic Identity -->
                <div class="md:col-span-4 flex flex-col items-center md:items-start">
                  <div class="relative w-full aspect-square md:w-full max-w-[240px] rounded-3xl overflow-hidden shadow-2xl ring-8 ring-surface-100 dark:ring-surface-900/50 mb-6 bg-surface-100 dark:bg-surface-950 flex items-center justify-center">
                    <img v-if="previewUrl" :src="previewUrl" alt="Victim Photo" class="w-full h-full object-cover dark:brightness-[0.85]" />
                    <div v-else class="flex flex-col items-center text-surface-300 dark:text-surface-600 p-8 text-center">
                      <i class="pi pi-user text-6xl mb-4"></i>
                      <p class="text-sm font-bold">No Photo Provided</p>
                    </div>
                  </div>
                  <div class="text-center md:text-left w-full">
                    <h4 class="text-2xl font-black text-surface-900 dark:text-surface-0 mb-1">{{ form.name }}</h4>
                    <p class="text-primary-500 font-bold mb-4">{{ form.occupation || 'Occupation Not Listed' }}</p>
                    <div class="flex flex-wrap justify-center md:justify-start gap-2">
                      <span v-if="form.age" class="px-3 py-1 bg-surface-100 dark:bg-surface-800 rounded-full text-xs font-bold text-surface-600 dark:text-surface-400">
                        {{ form.age }} Years Old
                      </span>
                      <span v-if="form.gender" class="px-3 py-1 bg-surface-100 dark:bg-surface-800 rounded-full text-xs font-bold text-surface-600 dark:text-surface-400">
                        {{ form.gender }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Right: Details Grid -->
                <div class="md:col-span-8 space-y-8">
                  <!-- Birth Info Section -->
                  <div>
                    <div class="flex items-center gap-2 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">
                      <i class="pi pi-user-plus text-primary-500"></i>
                      <h5 class="text-sm font-black uppercase tracking-widest text-surface-400">Personal History</h5>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                      <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">Birth Date</p>
                        <p class="text-sm font-bold text-surface-800 dark:text-surface-200">{{ form.birthDate ? formatDateDisplay(form.birthDate) : 'Not Disclosed' }}</p>
                      </div>
                      <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">Origin</p>
                        <p class="text-sm font-bold text-surface-800 dark:text-surface-200">
                          {{ form.birthCity }}{{ form.birthProvince ? `, ${form.birthProvince}` : '' }}{{ !form.birthCity && !form.birthProvince ? 'Not Disclosed' : '' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Incident Section -->
                  <div>
                    <div class="flex items-center gap-2 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">
                      <i class="pi pi-exclamation-triangle text-red-500"></i>
                      <h5 class="text-sm font-black uppercase tracking-widest text-surface-400">Incident Details</h5>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                      <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">Date of Incident</p>
                        <p class="text-sm font-bold text-surface-800 dark:text-surface-200">
                          {{ form.dateOfDeath ? formatDateDisplay(form.dateOfDeath) : 'Date Unknown' }}
                          <span v-if="form.deathDateApproximate" class="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded ml-1 italic">Approx.</span>
                        </p>
                      </div>
                      <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">Location</p>
                        <p class="text-sm font-bold text-surface-800 dark:text-surface-200">
                          {{ form.incident_city }}{{ form.incident_province ? `, ${form.incident_province}` : '' }}
                        </p>
                      </div>
                      <div v-if="form.status === 'Killed'" class="sm:col-span-2">
                        <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">Cause of Death</p>
                        <p class="text-sm font-bold text-surface-800 dark:text-surface-200">{{ form.causeOfDeath || 'Pending Investigation' }}</p>
                      </div>
                      <template v-if="form.status === 'Missing'">
                        <div>
                          <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">Circumstances</p>
                          <p class="text-sm font-bold text-surface-800 dark:text-surface-200">{{ form.disappearanceCircumstances || 'Unknown' }}</p>
                        </div>
                        <div>
                          <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">Suspected Actor</p>
                          <p class="text-sm font-bold text-surface-800 dark:text-surface-200">{{ form.suspectedActor || 'Unknown' }}</p>
                        </div>
                      </template>
                    </div>
                  </div>

                  <!-- Narrative -->
                  <div v-if="form.description">
                    <div class="flex items-center gap-2 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">
                      <i class="pi pi-align-left text-surface-400"></i>
                      <h5 class="text-sm font-black uppercase tracking-widest text-surface-400">Additional Narrative</h5>
                    </div>
                    <p class="text-sm leading-relaxed text-surface-600 dark:text-surface-400 italic">
                      "{{ form.description }}"
                    </p>
                  </div>

                  <!-- Source -->
                  <div class="pt-4 mt-6 border-t border-surface-100 dark:border-surface-800">
                    <div class="flex items-center gap-3 p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700">
                      <div class="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                        <i class="pi pi-shield-check text-primary-500"></i>
                      </div>
                      <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-surface-400">Verified By</p>
                        <p class="text-xs font-bold text-surface-700 dark:text-surface-300">
                          {{ form.sourceType }} Source
                          <span v-if="form.socialMediaLink" class="mx-2 opacity-30">|</span>
                          <a v-if="form.socialMediaLink" :href="form.socialMediaLink" target="_blank" class="text-primary-500 hover:underline">Link Provided</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Warning/Confirmation -->
            <div class="p-6 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 text-xs font-medium flex items-start gap-4 mx-8 mb-8 rounded-2xl border border-amber-100 dark:border-amber-900/20">
              <i class="pi pi-info-circle text-lg mt-0.5"></i>
              <p class="leading-relaxed">
                By submitting this report, you confirm that the information provided is accurate to the best of your knowledge. This data will be reviewed by researchers and permanently archived as part of the historical record.
              </p>
            </div>
          </div>

          <!-- Turnstile -->
          <div class="flex flex-col items-center gap-4 pt-8">
            <p class="text-sm font-bold text-surface-500 uppercase tracking-widest">Security Verification</p>
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
import { ref, onMounted, nextTick } from 'vue';
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
const filteredProvinces = ref([...provinces]);

function searchProvinces(event: { query: string }) {
  if (!event.query.trim().length) {
    filteredProvinces.value = [...provinces];
  } else {
    filteredProvinces.value = provinces.filter((province) => {
      return province.name.toLowerCase().includes(event.query.toLowerCase());
    });
  }
}

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
  // Load Turnstile script on mount
  if (!document.getElementById('turnstile-script')) {
    const script = document.createElement('script');
    script.id = 'turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
});

function renderTurnstile() {
  // Only render when we're on the review step and container exists
  if (currentStep.value !== 3) return;
  if (!(window as any).turnstile) {
    // Script not loaded yet, retry
    setTimeout(renderTurnstile, 200);
    return;
  }
  if (!turnstileContainer.value) {
    // Container not ready yet, retry
    setTimeout(renderTurnstile, 100);
    return;
  }
  
  // Clear any existing widget first
  turnstileContainer.value.innerHTML = '';
  
  (window as any).turnstile.render(turnstileContainer.value, {
    sitekey: config.public.turnstileSiteKey,
    callback: (token: string) => {
      turnstileToken.value = token;
    },
    'error-callback': () => {
      console.error('Turnstile error');
    }
  });
}

// File handling
const previewUrl = ref<string | null>(null);

function onFileInputChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    // Check file size (2MB max)
    if (file.size > 2000000) {
      alert('File size must be under 2MB');
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
      nextTick(() => renderTurnstile());
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
