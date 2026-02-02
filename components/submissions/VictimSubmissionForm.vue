<template>
  <div class="space-y-6">
    <!-- Stepper Header Redesign -->
    <div class="relative mb-12 sm:mb-16 pt-2 sm:pt-4 px-4 sm:px-6 md:px-12">
      <!-- Progress Bar Background (Behind) -->
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
            class="mt-2 sm:mt-4 text-center transition-all duration-300 w-16 sm:w-20 sm:w-32"
            :class="[
              currentStep === index 
                ? 'text-primary-600 dark:text-primary-400 font-bold translate-y-0 opacity-100' 
                : 'text-surface-500 dark:text-surface-400 font-medium translate-y-1 opacity-70 group-hover:opacity-100'
            ]"
          >
            <p class="text-[10px] sm:text-xs uppercase tracking-wider leading-tight">{{ t(step.label) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Step Content -->
    <form @submit.prevent="handleNext">
      
      <!-- Step 1: Type -->
      <div v-if="currentStep === 0" class="space-y-6">

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-2xl mx-auto">
          <button
            type="button"
            @click="form.status = 'Killed'"
            :class="[
              'group p-5 sm:p-8 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden',
              form.status === 'Killed'
                ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10 shadow-xl scale-[1.02]'
                : 'border-surface-200 dark:border-surface-800 hover:border-red-300 hover:bg-red-50/20 dark:hover:bg-red-900/5'
            ]"
          >
            <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-48 h-48 text-red-500">
                <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C8.17,3 8.82,3.12 9.44,3.33L13,9.35L9,14.35L12,21.35V21.35M16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35L11,14.35L15.5,9.35L12.85,4.27C13.87,3.47 15.17,3 16.5,3Z" />
              </svg>
            </div>
            
            <div 
              :class="[
                'w-24 h-24 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500',
                form.status === 'Killed' ? 'bg-red-500 shadow-lg shadow-red-500/40 rotate-6' : 'bg-red-100 dark:bg-red-900/40 group-hover:rotate-3'
              ]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" :class="['w-14 h-14 transition-colors duration-500', form.status === 'Killed' ? 'text-white' : 'text-red-500']">
                <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C8.17,3 8.82,3.12 9.44,3.33L13,9.35L9,14.35L12,21.35V21.35M16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35L11,14.35L15.5,9.35L12.85,4.27C13.87,3.47 15.17,3 16.5,3Z" />
              </svg>
            </div>
            
            <h3 class="text-2xl font-black text-surface-900 dark:text-surface-0 mb-2">{{ t('submissionForm.victim.status.killed.label') }}</h3>
            <p class="text-surface-500 dark:text-surface-400 text-sm leading-relaxed">{{ t('submissionForm.victim.status.killed.description') }}</p>
          </button>

          <button
            type="button"
            @click="form.status = 'Missing'"
            :class="[
              'group p-5 sm:p-8 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden',
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
            
            <h3 class="text-2xl font-black text-surface-900 dark:text-surface-0 mb-2">{{ t('submissionForm.victim.status.missing.label') }}</h3>
            <p class="text-surface-500 dark:text-surface-400 text-sm leading-relaxed">{{ t('submissionForm.victim.status.missing.description') }}</p>
          </button>
        </div>

        <p v-if="stepErrors.status" class="text-red-500 text-center text-sm mt-4">
          {{ t('submissionForm.victim.status.error') }}
        </p>
      </div>

      <!-- Step 2: Personal Info -->
      <div v-if="currentStep === 1" class="space-y-6 sm:space-y-8">

        <div class="max-w-2xl mx-auto space-y-6">
          <!-- Photo Upload Redesign -->
          <div class="relative group">
            <label class="block text-sm font-bold mb-3 text-surface-700 dark:text-surface-300 ml-1">{{ t('submissionForm.victim.photo.label') }}</label>
            <div 
              class="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden"
              :class="[
                selectedFiles.length > 0 
                  ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-900/10' 
                  : 'border-surface-300 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-500 bg-surface-100 dark:bg-surface-900 hover:bg-surface-200 dark:hover:bg-surface-800'
              ]"
            >
              <input 
                type="file" 
                class="absolute inset-0 opacity-0 cursor-pointer z-20" 
                accept=".jpg,.jpeg,.jfif,.pjpeg,.pjp,.png,image/jpeg,image/png"
                multiple
                @change="onFileInputChange"
              />
              
              <!-- Preview if file selected -->
              <div v-if="selectedFiles.length > 0" class="absolute inset-0 z-10 bg-surface-0/90 dark:bg-surface-900/90 backdrop-blur-sm overflow-y-auto p-4 flex flex-col gap-4">
                <div v-for="(file, index) in selectedFiles" :key="file.name + index" class="flex items-center gap-4 bg-surface-100 dark:bg-surface-800 p-3 rounded-xl border border-surface-200 dark:border-surface-700 relative group/item">
                  <div class="relative w-16 h-16 flex-shrink-0">
                    <img :src="previewUrls[index]" alt="Preview" class="w-full h-full rounded-lg object-cover" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-surface-900 dark:text-surface-0 truncate">{{ file.name }}</p>
                    <p class="text-xs text-surface-500 font-medium" dir="ltr">{{ formatFileSize(file.size) }}</p>
                  </div>
                   <button 
                    type="button"
                    @click.stop.prevent="removeFile(index)"
                    class="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </div>

                 <button 
                    type="button"
                    @click.stop.prevent="clearFiles"
                    class="mt-auto self-center px-4 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 text-xs font-bold transition-colors flex items-center gap-2"
                  >
                    <i class="pi pi-trash"></i>
                    {{ t('submissionForm.victim.photo.remove') }} ({{ t('common.all') }})
                  </button>
              </div>

              <!-- Default upload prompt -->
              <div v-else class="flex flex-col items-center justify-center py-6 pointer-events-none">
                <div class="w-16 h-16 rounded-3xl bg-surface-200 dark:bg-surface-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <i class="pi pi-cloud-upload text-3xl text-surface-500 group-hover:text-primary-500 transition-colors"></i>
                </div>
                <p class="text-lg font-bold text-surface-700 dark:text-surface-200">{{ t('submissionForm.victim.photo.dropzone') }}</p>
                <p class="text-sm text-surface-500 mt-2 flex items-center justify-center gap-1.5">
                  <span>{{ t('submissionForm.victim.photo.maxSize') }}</span>
                  <span class="font-bold" dir="ltr">2MB</span>
                </p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name & Persian Name -->
            <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <IftaLabel>
                  <InputText
                    id="v_name"
                    v-model="form.name"
                    class="w-full"
                    variant="filled"
                    :invalid="stepErrors.name"
                  />
                  <label for="v_name">{{ t('submissionForm.victim.personalInfo.nameEn') }}</label>
                </IftaLabel>
                <small v-if="stepErrors.name" class="text-red-500 mt-1 block px-1">{{ t('submissionForm.victim.personalInfo.nameError') }}</small>
              </div>

              <IftaLabel>
                <InputText
                  id="v_name_fa"
                  v-model="form.persianName"
                  class="w-full font-fa"
                  dir="rtl"
                  variant="filled"
                />
                <label for="v_name_fa">{{ t('submissionForm.victim.personalInfo.nameFa') }}</label>
              </IftaLabel>
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
              <label for="v_age">{{ t('submissionForm.victim.personalInfo.age') }}</label>
            </IftaLabel>

            <IftaLabel>
              <Select
                id="v_gender"
                v-model="form.gender"
                :options="genderOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                variant="filled"
              />
              <label for="v_gender">{{ t('submissionForm.victim.personalInfo.gender') }}</label>
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
                <label for="v_occ">{{ t('submissionForm.victim.personalInfo.occupation') }}</label>
              </IftaLabel>
            </div>

            <!-- Birth Information -->
            <div class="md:col-span-2">
              <IftaLabel>
                <FormDateInput
                  id="v_birth_date"
                  v-model="form.birthDate"
                  class="w-full"
                  :error="stepErrors.birthDate"
                />
                <label for="v_birth_date">{{ t('submissionForm.victim.personalInfo.birthDate') }}</label>
              </IftaLabel>
            </div>
            
            <IftaLabel>
              <AutoComplete
                id="v_birth_prov"
                v-model="form.birthProvince"
                :suggestions="filteredProvinces"
                @complete="searchProvinces"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                variant="filled"
                dropdown
              />
              <label for="v_birth_prov">{{ t('submissionForm.victim.personalInfo.birthProvince') }}</label>
            </IftaLabel>

            <IftaLabel>
              <InputText
                id="v_birth_city"
                v-model="form.birthCity"
                class="w-full"
                variant="filled"
              />
              <label for="v_birth_city">{{ t('submissionForm.victim.personalInfo.birthCity') }}</label>
            </IftaLabel>
          </div>
        </div>
      </div>

      <!-- Step 3: Incident Details -->
      <div v-if="currentStep === 2" class="space-y-6 sm:space-y-8">

        <div class="max-w-2xl mx-auto space-y-8">
          <!-- Location Group -->
          <div class="space-y-4">
            <h3 class="text-xs font-black uppercase tracking-widest text-surface-400 mb-2">{{ t('submissionForm.victim.incidentDetails.location') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IftaLabel>
                <AutoComplete
                  id="inc_prov"
                  v-model="form.incident_province"
                  :suggestions="filteredProvinces"
                  @complete="searchProvinces"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full"
                  variant="filled"
                  dropdown
                />
                <label for="inc_prov">{{ form.status === 'Missing' ? t('submissionForm.victim.incidentDetails.provinceMissing') : t('submissionForm.victim.incidentDetails.province') }}</label>
              </IftaLabel>

              <IftaLabel>
                <InputText
                  id="inc_city"
                  v-model="form.incident_city"
                  class="w-full"
                  variant="filled"
                />
                <label for="inc_city">{{ form.status === 'Missing' ? t('submissionForm.victim.incidentDetails.cityMissing') : t('submissionForm.victim.incidentDetails.city') }}</label>
              </IftaLabel>
            </div>
            
            <div class="mt-4">
              <IftaLabel>
                <InputText
                  id="inc_addr"
                  v-model="form.incident_address"
                  class="w-full"
                  variant="filled"
                />
                <label for="inc_addr">{{ form.status === 'Missing' ? t('submissionForm.victim.incidentDetails.addressMissing') : t('submissionForm.victim.incidentDetails.address') }}</label>
              </IftaLabel>
            </div>
          </div>

          <!-- Date Group -->
          <div class="space-y-4">
            <h3 class="text-xs font-black uppercase tracking-widest text-surface-400 mb-2">{{ t('submissionForm.victim.incidentDetails.timeline') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IftaLabel>
                <FormDateInput
                  id="inc_date"
                  v-model="form.dateOfDeath"
                  class="w-full"
                  :error="stepErrors.dateOfDeath"
                />
                <label for="inc_date">{{ form.status === 'Missing' ? t('submissionForm.victim.incidentDetails.dateMissing') : t('submissionForm.victim.incidentDetails.date') }}</label>
              </IftaLabel>

              <div class="flex items-center gap-3 bg-surface-100 dark:bg-surface-900 p-3 rounded-xl border border-surface-200 dark:border-surface-700 w-full">
                <Checkbox v-model="form.deathDateApproximate" inputId="approximate" binary />
                <label for="approximate" class="text-sm font-bold text-surface-700 dark:text-surface-300">{{ t('submissionForm.victim.incidentDetails.approximate') }}</label>
              </div>
            </div>
          </div>

          <!-- Specific Fields based on status -->
          <div class="space-y-6">
            <h3 class="text-xs font-black uppercase tracking-widest text-surface-400 mb-2">{{ t('submissionForm.victim.incidentDetails.circumstances') }}</h3>
            
            <IftaLabel v-if="form.status === 'Killed'">
              <Select
                id="inc_cause"
                v-model="form.causeOfDeath"
                :options="causeOfDeathOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                variant="filled"
              />
              <label for="inc_cause">{{ t('submissionForm.victim.incidentDetails.cause') }}</label>
            </IftaLabel>

            <template v-if="form.status === 'Missing'">
              <div class="grid grid-cols-1 gap-6">
                <IftaLabel>
                  <Select
                    id="inc_circum"
                    v-model="form.disappearanceCircumstances"
                    :options="disappearanceCircumstancesOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    variant="filled"
                  />
                  <label for="inc_circum">{{ t('submissionForm.victim.incidentDetails.disappearanceCircumstances') }}</label>
                </IftaLabel>

                <IftaLabel>
                  <Select
                    id="inc_actor"
                    v-model="form.suspectedActor"
                    :options="suspectedActorOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    variant="filled"
                  />
                  <label for="inc_actor">{{ t('submissionForm.victim.incidentDetails.suspectedActor') }}</label>
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
              <label for="inc_desc">{{ form.status === 'Missing' ? t('submissionForm.victim.incidentDetails.additionalDetails') : t('submissionForm.victim.incidentDetails.description') }}</label>
            </IftaLabel>
          </div>

          <!-- Source Information -->
          <div class="p-4 sm:p-6 rounded-2xl bg-primary-50/50 dark:bg-primary-900/5 border border-primary-100 dark:border-primary-900/20 space-y-6">
            <div class="flex items-center gap-3 mb-2">
              <i class="pi pi-verified text-primary-500"></i>
              <h3 class="font-bold text-surface-900 dark:text-surface-0">{{ t('submissionForm.victim.source.verification') }}</h3>
            </div>
            
            <div class="grid grid-cols-1 gap-6">
              <div>
                <IftaLabel>
                  <Select
                    id="src_type"
                    v-model="form.sourceType"
                    :options="sourceTypeOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    variant="filled"
                    :invalid="stepErrors.sourceType"
                  />
                  <label for="src_type">{{ t('submissionForm.victim.source.type') }}</label>
                </IftaLabel>
                <small v-if="stepErrors.sourceType" class="text-red-500 mt-1 block px-1">{{ t('submissionForm.victim.source.typeError') }}</small>
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
                  <label for="src_link">{{ t('submissionForm.victim.source.link') }}</label>
                </IftaLabel>
                <small v-if="stepErrors.socialMediaLink" class="text-red-500 mt-1 block px-1">{{ t('submissionForm.victim.source.linkError') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: Review -->
      <div v-if="currentStep === 3" class="space-y-6 sm:space-y-8">

        <div class="max-w-4xl mx-auto">
          <div class="bg-surface-0 dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-2xl overflow-hidden">
            <!-- Header/Status Banner -->
            <div 
              :class="[
                'px-4 sm:px-8 py-4 sm:py-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b',
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
                  <svg v-if="form.status === 'Killed'" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                    <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C8.17,3 8.82,3.12 9.44,3.33L13,9.35L9,14.35L12,21.35V21.35M16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35L11,14.35L15.5,9.35L12.85,4.27C13.87,3.47 15.17,3 16.5,3Z" />
                  </svg>
                  <i v-else class="pi pi-search"></i>
                </div>
                <div>
                  <h3 class="text-xl font-black text-surface-900 dark:text-surface-0">{{ t('submissionForm.victim.incidentDetails.archivalRecord') }}</h3>
                  <p :class="['text-sm font-bold uppercase tracking-widest', form.status === 'Killed' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400']">
                    {{ form.status === 'Killed' ? t('submissionForm.victim.status.killed.label') : t('submissionForm.victim.status.missing.label') }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-800 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700">
                <i class="pi pi-calendar text-primary-500"></i>
                <span class="text-sm font-bold text-surface-600 dark:text-surface-300">{{ formatDateDisplay(new Date()) }}</span>
              </div>
            </div>

            <div class="p-4 sm:p-8 md:p-10">
              <div class="grid grid-cols-1 md:grid-cols-12 gap-10">
                <!-- Left: Photo & Basic Identity -->
                <div class="md:col-span-4 flex flex-col items-center md:items-start">
                  <div class="relative w-full aspect-square md:w-full max-w-[240px] rounded-3xl overflow-hidden shadow-2xl ring-8 ring-surface-100 dark:ring-surface-900/50 mb-6 bg-surface-100 dark:bg-surface-950 flex items-center justify-center">
                    <img v-if="reviewPreviewUrl" :src="reviewPreviewUrl" alt="Victim Photo" class="w-full h-full object-cover dark:brightness-[0.85]" />
                    <div v-else class="flex flex-col items-center text-surface-300 dark:text-surface-600 p-8 text-center">
                      <i class="pi pi-user text-6xl mb-4"></i>
                      <p class="text-sm font-bold">{{ t('submissionForm.victim.photo.empty') }}</p>
                    </div>
                  </div>
                  <div class="text-center md:text-left w-full">
                    <h4 class="text-2xl font-black text-surface-900 dark:text-surface-0 mb-1">{{ form.name }}</h4>
                    <p class="text-primary-500 font-bold mb-4">{{ form.occupation || t('submissionForm.victim.personalInfo.occupationEmpty') }}</p>
                    <div class="flex flex-wrap justify-center md:justify-start gap-2">
                      <span v-if="form.age" class="px-3 py-1 bg-surface-100 dark:bg-surface-800 rounded-full text-xs font-bold text-surface-600 dark:text-surface-400">
                        {{ pn(form.age) }} {{ t('submissionForm.victim.personalInfo.yearsOld') }}
                      </span>
                      <span v-if="form.gender" class="px-3 py-1 bg-surface-100 dark:bg-surface-800 rounded-full text-xs font-bold text-surface-600 dark:text-surface-400">
                        {{ findLabel(genderOptions, form.gender) }}
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
                      <h5 class="text-sm font-black uppercase tracking-widest text-surface-400">{{ t('submissionForm.victim.personalInfo.personalHistory') }}</h5>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                      <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">{{ t('submissionForm.victim.personalInfo.birthDate') }}</p>
                        <p class="text-sm font-bold text-surface-800 dark:text-surface-200">{{ form.birthDate ? formatDateDisplay(form.birthDate) : t('submissionForm.victim.personalInfo.notDisclosed') }}</p>
                      </div>
                      <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">{{ t('submissionForm.victim.personalInfo.origin') }}</p>
                        <p class="text-sm font-bold text-surface-800 dark:text-surface-200">
                          {{ form.birthCity }}{{ form.birthProvince ? `, ${findLabel(provinces, form.birthProvince)}` : '' }}{{ !form.birthCity && !form.birthProvince ? t('submissionForm.victim.personalInfo.notDisclosed') : '' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Incident Section -->
                  <div>
                    <div class="flex items-center gap-2 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">
                      <i class="pi pi-exclamation-triangle text-red-500"></i>
                      <h5 class="text-sm font-black uppercase tracking-widest text-surface-400">{{ t('submissionForm.victim.incidentDetails.location') }}</h5>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                      <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">{{ t('submissionForm.victim.incidentDetails.dateOfIncident') }}</p>
                        <p class="text-sm font-bold text-surface-800 dark:text-surface-200">
                          {{ form.dateOfDeath ? formatDateDisplay(form.dateOfDeath) : t('submissionForm.victim.incidentDetails.dateUnknown') }}
                          <span v-if="form.deathDateApproximate" class="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded ml-1 italic">{{ t('submissionForm.victim.incidentDetails.approx') }}</span>
                        </p>
                      </div>
                      <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">{{ t('submissionForm.victim.incidentDetails.location') }}</p>
                        <p class="text-sm font-bold text-surface-800 dark:text-surface-200">
                          {{ form.incident_city }}{{ form.incident_province ? `, ${findLabel(provinces, form.incident_province)}` : '' }}
                          <span v-if="form.incident_address" class="block text-xs font-normal text-surface-500 mt-1">{{ form.incident_address }}</span>
                        </p>
                      </div>
                      <div v-if="form.status === 'Killed'" class="sm:col-span-2">
                        <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">{{ t('submissionForm.victim.incidentDetails.cause') }}</p>
                        <p class="text-sm font-bold text-surface-800 dark:text-surface-200">{{ form.causeOfDeath ? findLabel(causeOfDeathOptions, form.causeOfDeath) : t('submissionForm.victim.incidentDetails.pendingInvestigation') }}</p>
                      </div>
                      <template v-if="form.status === 'Missing'">
                        <div>
                          <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">{{ t('submissionForm.victim.incidentDetails.disappearanceCircumstances') }}</p>
                          <p class="text-sm font-bold text-surface-800 dark:text-surface-200">{{ form.disappearanceCircumstances ? findLabel(disappearanceCircumstancesOptions, form.disappearanceCircumstances) : t('submissionForm.victim.incidentDetails.unknown') }}</p>
                        </div>
                        <div>
                          <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">{{ t('submissionForm.victim.incidentDetails.suspectedActor') }}</p>
                          <p class="text-sm font-bold text-surface-800 dark:text-surface-200">{{ form.suspectedActor ? findLabel(suspectedActorOptions, form.suspectedActor) : t('submissionForm.victim.incidentDetails.unknown') }}</p>
                        </div>
                      </template>
                    </div>
                  </div>

                  <!-- Narrative -->
                  <div v-if="form.description">
                    <div class="flex items-center gap-2 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">
                      <i class="pi pi-align-left text-surface-400"></i>
                      <h5 class="text-sm font-black uppercase tracking-widest text-surface-400">{{ t('submissionForm.victim.incidentDetails.additionalNarrative') }}</h5>
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
                        <p class="text-[10px] font-black uppercase tracking-widest text-surface-400">{{ t('submissionForm.victim.source.verifiedBy') }}</p>
                        <p class="text-xs font-bold text-surface-700 dark:text-surface-300">
                          {{ form.sourceType ? findLabel(sourceTypeOptions, form.sourceType) : '' }} {{ t('submissionForm.victim.source.source') }}
                          <span v-if="form.socialMediaLink" class="mx-2 opacity-30">|</span>
                          <a v-if="form.socialMediaLink" :href="form.socialMediaLink" target="_blank" class="text-primary-500 hover:underline">{{ t('submissionForm.victim.source.linkProvided') }}</a>
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
                {{ t('submissionForm.victim.footer.warning') }}
              </p>
            </div>
          </div>

          <!-- Turnstile -->
          <div class="flex flex-col items-center gap-4 pt-8">
            <p class="text-sm font-bold text-surface-500 uppercase tracking-widest">{{ t('submissionForm.common.securityVerification') }}</p>
            <div id="turnstile-victim" ref="turnstileContainer"></div>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between mt-8 pt-6 border-t border-surface-200 dark:border-surface-700">
        <Button
          v-if="currentStep > 0"
          type="button"
          :label="t('submissionForm.common.back')"
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
            :label="t('submissionForm.common.next')"
            icon="pi pi-arrow-right"
            iconPos="right"
            :disabled="!canGoToNext"
          />
          <Button
            v-else
            type="button"
            :label="t('submissionForm.common.submitReport')"
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
import { ref, onMounted, nextTick, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import provincesData from '~/data/provinces.json';

const { t, locale } = useI18n();
const { pn } = usePersianNumbers();

const props = defineProps<{
  submitting: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: any];
  'update:stepTitle': [title: string];
}>();

const config = useRuntimeConfig();
const turnstileContainer = ref<HTMLElement>();
const turnstileToken = ref('');
// ... (previous imports)
const selectedFiles = ref<File[]>([]);
const previewUrls = ref<string[]>([]);

const reviewPreviewUrl = computed(() => {
  return previewUrls.value.length > 0 ? previewUrls.value[0] : null;
});

// ... (existing code)

function onFileInputChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    // Append new files instead of replacing
    const newFiles = Array.from(input.files);
    
    // Size check
    const invalidFiles = newFiles.filter(f => f.size > 2 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      alert(t('submissionForm.victim.photo.sizeError'));
      return;
    }

    selectedFiles.value = [...selectedFiles.value, ...newFiles];
    
    // Generate previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          previewUrls.value.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
  }
}

function removeFile(index: number) {
  selectedFiles.value.splice(index, 1);
  previewUrls.value.splice(index, 1);
}

function clearFiles() {
  selectedFiles.value = [];
  previewUrls.value = [];
}
// ...


// Steps
const steps = [
  { id: 'type', label: 'submissionForm.victim.steps.type.label', icon: 'pi pi-question-circle', title: 'submissionForm.victim.steps.type.title' },
  { id: 'personal', label: 'submissionForm.victim.steps.personal.label', icon: 'pi pi-user', title: 'submissionForm.victim.steps.personal.title' },
  { id: 'incident', label: 'submissionForm.victim.steps.incident.label', icon: 'pi pi-map-marker', title: 'submissionForm.victim.steps.incident.title' },
  { id: 'review', label: 'submissionForm.victim.steps.review.label', icon: 'pi pi-clipboard', title: 'submissionForm.victim.steps.review.title' }
];

const currentStep = ref(0);
const currentStepTitle = computed(() => t(steps[currentStep.value].title));

watch(currentStepTitle, (newTitle) => {
  emit('update:stepTitle', newTitle);
}, { immediate: true });

const canGoToNext = computed(() => {
  if (currentStep.value === 0) {
    return !!form.value.status;
  }
  if (currentStep.value === 1) {
    return !!form.value.name.trim();
  }
  if (currentStep.value === 2) {
    const hasSource = !!form.value.sourceType;
    if (!hasSource) return false;
    if (form.value.sourceType === 'Social Media') {
      return !!form.value.socialMediaLink.trim();
    }
    return true;
  }
  return true;
});

const stepErrors = ref<Record<string, boolean>>({});

// Load provinces
const provinces = computed(() => provincesData.map(p => ({ 
  label: t(`provinces.${p}`), 
  value: p 
})));
const filteredProvinces = ref<{ label: string, value: string }[]>([]);

function searchProvinces(event: { query: string }) {
  if (!event.query.trim().length) {
    filteredProvinces.value = [...provinces.value];
  } else {
    filteredProvinces.value = provinces.value.filter((province) => {
      // Search in both English key and translated label
      return province.label.toLowerCase().includes(event.query.toLowerCase()) || 
             province.value.toLowerCase().includes(event.query.toLowerCase());
    });
  }
}

// Dropdown options
const genderOptions = computed(() => [
  { label: t('submissionForm.victim.options.gender.male'), value: 'Male' },
  { label: t('submissionForm.victim.options.gender.female'), value: 'Female' }
]);

const causeOfDeathOptions = computed(() => [
  { label: t('submissionForm.victim.options.causeOfDeath.gunshot'), value: 'Gunshot' },
  { label: t('submissionForm.victim.options.causeOfDeath.beating'), value: 'Beating' },
  { label: t('submissionForm.victim.options.causeOfDeath.torture'), value: 'Torture' },
  { label: t('submissionForm.victim.options.causeOfDeath.execution'), value: 'Execution' },
  { label: t('submissionForm.victim.options.causeOfDeath.unknown'), value: 'Unknown' }
]);

const disappearanceCircumstancesOptions = computed(() => [
  { label: t('submissionForm.victim.options.disappearance.protests'), value: 'Disappeared during protests' },
  { label: t('submissionForm.victim.options.disappearance.arrested'), value: 'Arrested and transferred to unknown location' },
  { label: t('submissionForm.victim.options.disappearance.abducted'), value: 'Abducted from home' },
  { label: t('submissionForm.victim.options.disappearance.detention'), value: 'Disappeared after detention' },
  { label: t('submissionForm.victim.options.disappearance.unknown'), value: 'Unknown' }
]);

const suspectedActorOptions = computed(() => [
  { label: t('submissionForm.victim.options.actor.security'), value: 'Security Forces' },
  { label: t('submissionForm.victim.options.actor.plainclothes'), value: 'Plainclothes Agents' },
  { label: t('submissionForm.victim.options.actor.unknown'), value: 'Unknown' }
]);

const sourceTypeOptions = computed(() => [
  { label: t('submissionForm.victim.options.sourceType.family'), value: 'Family or Close Friend' },
  { label: t('submissionForm.victim.options.sourceType.eyewitness'), value: 'Eyewitness' },
  { label: t('submissionForm.victim.options.sourceType.hospital'), value: 'Hospital/Forensic' },
  { label: t('submissionForm.victim.options.sourceType.local'), value: 'Local Report' },
  { label: t('submissionForm.victim.options.sourceType.social'), value: 'Social Media' }
]);

function findLabel(options: { label: string, value: string }[], value: string) {
  return options.find(o => o.value === value)?.label || value;
}

const form = ref({
  status: '' as 'Killed' | 'Missing' | '',
  name: '',
  persianName: '',
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
  incident_address: '',
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



function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
    persian_name: form.value.persianName,
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
    incident_address: form.value.incident_address,
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

  emit('submit', {
    kind: 'victim',
    data,
    files: selectedFiles.value,
    turnstileToken: turnstileToken.value
  });
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString(locale.value === 'fa' ? 'fa-IR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
</script>
