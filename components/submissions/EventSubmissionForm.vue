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
            class="mt-2 sm:mt-4 text-center transition-all duration-300 w-16 sm:w-20 sm:w-32"
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
      <!-- Success State Internal -->
      <div v-if="submitted" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 sm:p-6 mb-6">>
        <div class="flex items-start gap-3">
          <i class="pi pi-check-circle text-2xl text-green-600 dark:text-green-400"></i>
          <div class="flex-1">
            <h3 class="font-bold text-green-900 dark:text-green-100 mb-2">Submission Received!</h3>
            <p class="text-green-800 dark:text-green-200 mb-3">
              Your event has been submitted for review.
            </p>
            <div class="bg-white dark:bg-surface-800 p-3 rounded border border-green-200 dark:border-green-700">
               <p class="text-sm text-surface-600 dark:text-surface-400">
                 Your submission has been received and will be reviewed.
               </p>
            </div>
          </div>
        </div>
      </div>

      <form v-else @submit.prevent="handleNext">
      
      <!-- Step 1: Event Format -->
      <div v-if="currentStep === 0" class="space-y-6">

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <!-- In Person -->
          <button
            type="button"
            @click="form.type = 'in_person'"
            :class="[
              'group p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden',
              form.type === 'in_person'
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-xl scale-[1.02]'
                : 'border-surface-200 dark:border-surface-800 hover:border-blue-300 hover:bg-blue-50/20 dark:hover:bg-blue-900/5'
            ]"
          >
            <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <i class="pi pi-map-marker !text-8xl text-blue-500"></i>
            </div>
            
            <div 
              :class="[
                'w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500',
                form.type === 'in_person' ? 'bg-blue-500 shadow-lg shadow-blue-500/40 rotate-6' : 'bg-blue-100 dark:bg-blue-900/40 group-hover:rotate-3'
              ]"
            >
              <i :class="['pi pi-map-marker !text-4xl transition-colors duration-500', form.type === 'in_person' ? 'text-white' : 'text-blue-500']"></i>
            </div>
            
            <h3 class="text-xl font-black text-surface-900 dark:text-surface-0 mb-2">In Person</h3>
            <p class="text-surface-500 dark:text-surface-400 text-sm leading-relaxed">Physical gathering at a specific location.</p>
          </button>

          <!-- Hybrid -->
          <button
            type="button"
            @click="form.type = 'hybrid'"
            :class="[
              'group p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden',
              form.type === 'hybrid'
                ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/10 shadow-xl scale-[1.02]'
                : 'border-surface-200 dark:border-surface-800 hover:border-purple-300 hover:bg-purple-50/20 dark:hover:bg-purple-900/5'
            ]"
          >
            <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <i class="pi pi-th-large !text-8xl text-purple-500"></i>
            </div>
            
            <div 
              :class="[
                'w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500',
                form.type === 'hybrid' ? 'bg-purple-500 shadow-lg shadow-purple-500/40 -rotate-6' : 'bg-purple-100 dark:bg-purple-900/40 group-hover:-rotate-3'
              ]"
            >
              <i :class="['pi pi-th-large !text-4xl transition-colors duration-500', form.type === 'hybrid' ? 'text-white' : 'text-purple-500']"></i>
            </div>
            
            <h3 class="text-xl font-black text-surface-900 dark:text-surface-0 mb-2">Hybrid</h3>
            <p class="text-surface-500 dark:text-surface-400 text-sm leading-relaxed">Both in-person and virtual attendance options.</p>
          </button>

          <!-- Online -->
          <button
            type="button"
            @click="form.type = 'online'"
            :class="[
              'group p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden',
              form.type === 'online'
                ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10 shadow-xl scale-[1.02]'
                : 'border-surface-200 dark:border-surface-800 hover:border-green-300 hover:bg-green-50/20 dark:hover:bg-green-900/5'
            ]"
          >
            <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <i class="pi pi-globe !text-8xl text-green-500"></i>
            </div>
            
            <div 
              :class="[
                'w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500',
                form.type === 'online' ? 'bg-green-500 shadow-lg shadow-green-500/40 rotate-6' : 'bg-green-100 dark:bg-green-900/40 group-hover:rotate-3'
              ]"
            >
              <i :class="['pi pi-globe !text-4xl transition-colors duration-500', form.type === 'online' ? 'text-white' : 'text-green-500']"></i>
            </div>
            
            <h3 class="text-xl font-black text-surface-900 dark:text-surface-0 mb-2">Online</h3>
            <p class="text-surface-500 dark:text-surface-400 text-sm leading-relaxed">Virtual event accessible from anywhere.</p>
          </button>
        </div>

        <p v-if="stepErrors.type" class="text-red-500 text-center text-sm mt-4">
          Please select an event format to continue
        </p>
      </div>

      <!-- Step 2: Time & Location -->
      <div v-if="currentStep === 1" class="space-y-6 sm:space-y-8">

        <div class="max-w-2xl mx-auto space-y-8">
          <!-- Date & Time -->
          <div class="space-y-4">
            <h3 class="text-xs font-black uppercase tracking-widest text-surface-400 mb-2">
              <i class="pi pi-calendar mr-2"></i>Date & Time
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <IftaLabel>
                  <FormDateInput
                    id="ev_start_date"
                    v-model="form.startDate"
                    dateFormat="yy/mm/dd"
                    showIcon
                    class="w-full"
                    variant="filled"
                    placeholder=" "
                    :invalid="stepErrors.startDate"
                  />
                  <label for="ev_start_date">Start Date *</label>
                </IftaLabel>
                <small v-if="stepErrors.startDate" class="text-red-500 mt-1 block px-1">Start date is required</small>
              </div>

              <div>
                <IftaLabel>
                  <InputText
                    id="ev_start_time"
                    v-model="form.startTime"
                    class="w-full"
                    variant="filled"
                    placeholder="e.g. 14:00"
                    @keypress="validateTimeInput"
                    :invalid="stepErrors.startTime"
                  />
                  <label for="ev_start_time">Start Time (HH:MM) *</label>
                </IftaLabel>
                <small v-if="stepErrors.startTime" class="text-red-500 mt-1 block px-1">Start time is required (HH:MM)</small>
              </div>
            </div>

            <!-- End Date Toggle -->
            <div class="flex items-center gap-3 p-4 bg-surface-100 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
              <ToggleSwitch v-model="showEndDate" inputId="show_end_date" />
              <label for="show_end_date" class="text-sm font-bold text-surface-700 dark:text-surface-300 cursor-pointer">
                Add end date & time
              </label>
            </div>

            <!-- End Date Fields (conditional) -->
            <div v-if="showEndDate" class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <IftaLabel>
                  <FormDateInput
                    id="ev_end_date"
                    v-model="form.endDate"
                    dateFormat="yy/mm/dd"
                    showIcon
                    class="w-full"
                    variant="filled"
                    placeholder=" "
                  />
                <label for="ev_end_date">End Date</label>
              </IftaLabel>

              <IftaLabel>
                <InputText
                  id="ev_end_time"
                  v-model="form.endTime"
                  class="w-full"
                  variant="filled"
                  placeholder="e.g. 17:00"
                  @keypress="validateTimeInput"
                />
                <label for="ev_end_time">End Time (HH:MM)</label>
              </IftaLabel>
            </div>
          </div>

          <!-- Physical Location (for in_person and hybrid) -->
          <div v-if="form.type === 'in_person' || form.type === 'hybrid'" class="space-y-4">
            <h3 class="text-xs font-black uppercase tracking-widest text-surface-400 mb-2">
              <i class="pi pi-map-marker mr-2"></i>Physical Location
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <!-- Country AutoComplete -->
              <div>
                <IftaLabel>
                  <AutoComplete
                    id="ev_country"
                    v-model="selectedCountry"
                    :suggestions="filteredCountries"
                    optionLabel="name"
                    forceSelection
                    dropdown
                    class="w-full"
                    inputClass="w-full"
                    variant="filled"
                    @complete="searchCountry"
                    @item-select="onCountrySelect"
                    :invalid="stepErrors.country"
                    placeholder="Search country..."
                    :minLength="0"
                  >
                    <template #option="slotProps">
                      <div class="flex items-center gap-2">
                        <img 
                          :src="getCountryFlagUrl(slotProps.option.iso2)"
                          :alt="slotProps.option.name" 
                          class="w-6 h-4 object-cover rounded shadow-sm"
                        />
                        <span>{{ t('countries.' + slotProps.option.iso2, slotProps.option.name) }}</span>
                      </div>
                    </template>
                  </AutoComplete>
                  <label for="ev_country">Country *</label>
                </IftaLabel>
                <small v-if="stepErrors.country" class="text-red-500 mt-1 block px-1">Country is required</small>
              </div>

              <!-- City -->
              <div>
                <IftaLabel>
                  <InputText
                    id="ev_city"
                    v-model="form.city"
                    class="w-full"
                    variant="filled"
                    :invalid="stepErrors.city"
                  />
                  <label for="ev_city">City *</label>
                </IftaLabel>
                <small v-if="stepErrors.city" class="text-red-500 mt-1 block px-1">City is required</small>
              </div>

              <!-- Address -->
              <div class="md:col-span-2">
                <IftaLabel>
                  <InputText
                    id="ev_address"
                    v-model="form.address"
                    class="w-full"
                    variant="filled"
                    :invalid="stepErrors.address"
                    @blur="geocodeAddress"
                  />
                  <label for="ev_address">Full Address *</label>
                </IftaLabel>
                <small v-if="stepErrors.address" class="text-red-500 mt-1 block px-1">Address is required</small>
              </div>
            </div>
          </div>

          <!-- Online Platform (for online and hybrid) -->
          <div v-if="form.type === 'online' || form.type === 'hybrid'" class="space-y-4">
            <h3 class="text-xs font-black uppercase tracking-widest text-surface-400 mb-2">
              <i class="pi pi-globe mr-2"></i>Online Platform
            </h3>
            <div class="grid grid-cols-1 gap-6">
              <div>
                <IftaLabel>
                  <InputText
                    id="ev_platform"
                    v-model="form.platform"
                    class="w-full"
                    variant="filled"
                    :invalid="stepErrors.platform"
                  />
                  <label for="ev_platform">Platform Name (e.g., Zoom, YouTube, X Spaces) *</label>
                </IftaLabel>
                <small v-if="stepErrors.platform" class="text-red-500 mt-1 block px-1">Platform name is required</small>
              </div>

              <div>
                <IftaLabel>
                  <InputText
                    id="ev_join_url"
                    v-model="form.joinUrl"
                    class="w-full"
                    variant="filled"
                    :invalid="stepErrors.joinUrl"
                  />
                  <label for="ev_join_url">Join/Watch URL *</label>
                </IftaLabel>
                <small v-if="stepErrors.joinUrl" class="text-red-500 mt-1 block px-1">Join URL is required</small>
              </div>

              <IftaLabel>
                <InputText
                  id="ev_registration_url"
                  v-model="form.registrationUrl"
                  class="w-full"
                  variant="filled"
                />
                <label for="ev_registration_url">Registration URL (optional)</label>
              </IftaLabel>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Event Details & Organizer -->
      <div v-if="currentStep === 2" class="space-y-6 sm:space-y-8">

        <div class="max-w-2xl mx-auto space-y-8">
          <!-- Event Info -->
          <div class="space-y-6">
            <h3 class="text-xs font-black uppercase tracking-widest text-surface-400 mb-2">Event Information</h3>
            
            <!-- Title -->
            <div>
              <IftaLabel>
                <InputText
                  id="ev_title"
                  v-model="form.title"
                  class="w-full"
                  variant="filled"
                  :invalid="stepErrors.title"
                />
                <label for="ev_title">Event Title *</label>
              </IftaLabel>
              <small v-if="stepErrors.title" class="text-red-500 mt-1 block px-1">Please enter an event title</small>
            </div>

            <!-- Announcement Link (Required) -->
            <div>
              <IftaLabel>
                <InputText
                  id="ev_announcement"
                  v-model="form.announcement"
                  class="w-full"
                  variant="filled"
                  :invalid="stepErrors.announcement"
                />
                <label for="ev_announcement">Announcement Link *</label>
              </IftaLabel>
              <small v-if="stepErrors.announcement" class="text-red-500 mt-1 block px-1">Announcement URL is required</small>
            </div>

            <!-- Description (Optional) -->
            <div>
              <IftaLabel>
                <Textarea
                  id="ev_desc"
                  v-model="form.description"
                  rows="5"
                  class="w-full"
                  variant="filled"
                  autoResize
                />
                <label for="ev_desc">Description</label>
              </IftaLabel>
            </div>
          </div>

          <!-- Organizer Information -->
          <div class="p-4 sm:p-6 rounded-2xl bg-primary-50/50 dark:bg-primary-900/5 border border-primary-100 dark:border-primary-900/20 space-y-6">
            <div class="flex items-center gap-3 mb-2">
              <i class="pi pi-users text-primary-500"></i>
              <h3 class="font-bold text-surface-900 dark:text-surface-0">Organizer Information</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Name (Optional) -->
              <div class="md:col-span-2">
                <IftaLabel>
                  <InputText
                    id="ev_org_name"
                    v-model="form.organizerName"
                    class="w-full"
                    variant="filled"
                  />
                  <label for="ev_org_name">Organizer Name</label>
                </IftaLabel>
              </div>

              <!-- Website -->
              <IftaLabel>
                <InputText
                  id="ev_org_website"
                  v-model="form.organizerWebsite"
                  class="w-full"
                  variant="filled"
                />
                <label for="ev_org_website">
                  <i class="pi pi-globe mr-1"></i>Website
                </label>
              </IftaLabel>

              <!-- Email -->
              <IftaLabel>
                <InputText
                  id="ev_org_email"
                  v-model="form.organizerEmail"
                  class="w-full"
                  variant="filled"
                />
                <label for="ev_org_email">
                  <i class="pi pi-envelope mr-1"></i>Contact Email
                </label>
              </IftaLabel>
            </div>

            <!-- Social Media -->
            <div class="pt-4 border-t border-primary-100 dark:border-primary-900/20">
              <p class="text-xs font-bold uppercase tracking-widest text-surface-400 mb-4">Social Media</p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- X (Twitter) -->
                <div class="relative">
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 z-10">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </div>
                  <InputText
                    v-model="form.organizerX"
                    class="w-full pl-10"
                    variant="filled"
                    placeholder="@username or URL"
                    @blur="formatSocialUrl('x')"
                  />
                </div>

                <!-- Instagram -->
                <div class="relative">
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 z-10">
                    <i class="pi pi-instagram"></i>
                  </div>
                  <InputText
                    v-model="form.organizerInstagram"
                    class="w-full pl-10"
                    variant="filled"
                    placeholder="@username or URL"
                    @blur="formatSocialUrl('instagram')"
                  />
                </div>

                <!-- Telegram -->
                <div class="relative">
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 z-10">
                    <i class="pi pi-telegram"></i>
                  </div>
                  <InputText
                    v-model="form.organizerTelegram"
                    class="w-full pl-10"
                    variant="filled"
                    placeholder="@channel or URL"
                    @blur="formatSocialUrl('telegram')"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: Review -->
      <div v-if="currentStep === 3" class="space-y-6 sm:space-y-8">

        <div class="max-w-4xl mx-auto">
          <div class="bg-surface-0 dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-2xl overflow-hidden">
            <!-- Header/Type Banner -->
            <div 
              :class="[
                'px-4 sm:px-8 py-4 sm:py-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b',
                form.type === 'in_person' ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20' : 
                form.type === 'hybrid' ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/20' :
                'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20'
              ]"
            >
              <div class="flex items-center gap-4">
                <div 
                  :class="[
                    'w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg text-white',
                    form.type === 'in_person' ? 'bg-blue-500' : form.type === 'hybrid' ? 'bg-purple-500' : 'bg-green-500'
                  ]"
                >
                  <i :class="form.type === 'in_person' ? 'pi pi-map-marker' : form.type === 'hybrid' ? 'pi pi-th-large' : 'pi pi-globe'"></i>
                </div>
                <div>
                  <h3 class="text-xl font-black text-surface-900 dark:text-surface-0">{{ form.title }}</h3>
                  <p :class="['text-sm font-bold uppercase tracking-widest', form.type === 'in_person' ? 'text-blue-600 dark:text-blue-400' : form.type === 'hybrid' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400']">
                    {{ form.type === 'in_person' ? 'In Person Event' : form.type === 'hybrid' ? 'Hybrid Event' : 'Online Event' }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-800 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700">
                <i class="pi pi-calendar text-primary-500"></i>
                <span class="text-sm font-bold text-surface-600 dark:text-surface-300">{{ form.startDate ? formatDateDisplay(form.startDate) : 'Date TBD' }}</span>
                <span v-if="form.startTime" class="text-surface-400">—</span>
                <span v-if="form.startTime" class="text-sm font-bold text-surface-600 dark:text-surface-300">{{ form.startTime }}</span>
              </div>
            </div>

            <div class="p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
              <!-- Time Info -->
              <div>
                <div class="flex items-center gap-2 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">
                  <i class="pi pi-clock text-primary-500"></i>
                  <h5 class="text-sm font-black uppercase tracking-widest text-surface-400">Schedule</h5>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">Start</p>
                    <p class="text-sm font-bold text-surface-800 dark:text-surface-200">
                      {{ form.startDate ? formatDateDisplay(form.startDate) : 'TBD' }}
                      {{ form.startTime ? `at ${form.startTime}` : '' }}
                    </p>
                  </div>
                  <div v-if="form.endDate || form.endTime">
                    <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">End</p>
                    <p class="text-sm font-bold text-surface-800 dark:text-surface-200">
                      {{ form.endDate ? formatDateDisplay(form.endDate) : '' }}
                      {{ form.endTime ? `at ${form.endTime}` : '' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div v-if="form.description">
                <div class="flex items-center gap-2 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">
                  <i class="pi pi-align-left text-primary-500"></i>
                  <h5 class="text-sm font-black uppercase tracking-widest text-surface-400">Description</h5>
                </div>
                <p class="text-sm leading-relaxed text-surface-600 dark:text-surface-400 whitespace-pre-wrap">{{ form.description }}</p>
              </div>

              <!-- Announcement -->
              <div>
                <div class="flex items-center gap-2 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">
                  <i class="pi pi-link text-primary-500"></i>
                  <h5 class="text-sm font-black uppercase tracking-widest text-surface-400">Announcement</h5>
                </div>
                <a :href="form.announcement" target="_blank" class="text-sm font-medium text-primary-500 hover:underline truncate block">
                  {{ form.announcement }}
                </a>
              </div>

              <!-- Location (if applicable) -->
              <div v-if="form.type === 'in_person' || form.type === 'hybrid'">
                <div class="flex items-center gap-2 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">
                  <i class="pi pi-map-marker text-blue-500"></i>
                  <h5 class="text-sm font-black uppercase tracking-widest text-surface-400">Physical Location</h5>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-8">
                  <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">Country</p>
                    <div class="flex items-center gap-2">
                        <img 
                          v-if="form.country"
                          :src="getCountryFlagUrl(form.country)"
                          alt="Flag" 
                          class="w-5 h-3.5 object-cover rounded shadow-sm"
                        />
                      <p class="text-sm font-bold text-surface-800 dark:text-surface-200">{{ getCountryName(form.country) || 'Not specified' }}</p>
                    </div>
                  </div>
                  <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">City</p>
                    <p class="text-sm font-bold text-surface-800 dark:text-surface-200">{{ form.city || 'Not specified' }}</p>
                  </div>
                  <div class="sm:col-span-3">
                    <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">Address</p>
                    <p class="text-sm font-bold text-surface-800 dark:text-surface-200">{{ form.address || 'Not specified' }}</p>
                  </div>
                </div>
              </div>

              <!-- Online Info (if applicable) -->
              <div v-if="form.type === 'online' || form.type === 'hybrid'">
                <div class="flex items-center gap-2 mb-4 border-b border-surface-100 dark:border-surface-800 pb-2">
                  <i class="pi pi-globe text-green-500"></i>
                  <h5 class="text-sm font-black uppercase tracking-widest text-surface-400">Online Access</h5>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-8">
                  <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">Platform</p>
                    <p class="text-sm font-bold text-surface-800 dark:text-surface-200">{{ form.platform }}</p>
                  </div>
                  <div class="sm:col-span-2">
                    <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">Join URL</p>
                    <a :href="form.joinUrl" target="_blank" class="text-sm font-medium text-primary-500 hover:underline truncate block">
                      {{ form.joinUrl }}
                    </a>
                  </div>
                  <div v-if="form.registrationUrl" class="sm:col-span-3">
                    <p class="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">Registration</p>
                    <a :href="form.registrationUrl" target="_blank" class="text-sm font-medium text-primary-500 hover:underline truncate block">
                      {{ form.registrationUrl }}
                    </a>
                  </div>
                </div>
              </div>

              <!-- Organizer -->
              <div class="pt-4 mt-6 border-t border-surface-100 dark:border-surface-800">
                <div class="flex items-center gap-3 p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700">
                  <div class="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                    <i class="pi pi-users text-primary-500"></i>
                  </div>
                  <div class="flex-1">
                    <p class="text-[10px] font-black uppercase tracking-widest text-surface-400">Organized By</p>
                    <p class="text-sm font-bold text-surface-700 dark:text-surface-300">{{ form.organizerName || 'Community Organizer' }}</p>
                    <div class="flex flex-wrap gap-3 mt-2">
                      <a v-if="form.organizerWebsite" :href="form.organizerWebsite" target="_blank" class="text-xs text-primary-500 hover:underline flex items-center gap-1">
                        <i class="pi pi-globe"></i> Website
                      </a>
                      <span v-if="form.organizerEmail" class="text-xs text-surface-500 flex items-center gap-1">
                        <i class="pi pi-envelope"></i> {{ form.organizerEmail }}
                      </span>
                      <span v-if="form.organizerX" class="text-xs text-surface-500 flex items-center gap-1">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        {{ form.organizerX }}
                      </span>
                      <span v-if="form.organizerInstagram" class="text-xs text-surface-500 flex items-center gap-1">
                        <i class="pi pi-instagram"></i> {{ form.organizerInstagram }}
                      </span>
                      <span v-if="form.organizerTelegram" class="text-xs text-surface-500 flex items-center gap-1">
                        <i class="pi pi-telegram"></i> {{ form.organizerTelegram }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Info Notice -->
            <div class="p-6 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 text-xs font-medium flex items-start gap-4 mx-8 mb-8 rounded-2xl border border-amber-100 dark:border-amber-900/20">
              <i class="pi pi-info-circle text-lg mt-0.5"></i>
              <p class="leading-relaxed">
                By submitting this event, you confirm that the information provided is accurate. The event will be reviewed before being published on the calendar.
              </p>
            </div>
          </div>

          <!-- Turnstile -->
          <div class="flex flex-col items-center gap-4 pt-8">
            <p class="text-sm font-bold text-surface-500 uppercase tracking-widest">Security Verification</p>
            <div id="turnstile-event" ref="turnstileContainer"></div>
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
            :disabled="!canGoToNext"
          />
          <Button
            v-else
            type="button"
            label="Submit Event"
            icon="pi pi-send"
            :loading="submitting"
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
import { useCountries } from '~/composables/useCountries';
import { initUpload, completeSubmission } from '~/utils/submissionsClient';

const props = defineProps<{
  submitting?: boolean;
  initialData?: ParsedEvent | null;
}>();

const emit = defineEmits<{
  'success': [payload: any];
  'update:stepTitle': [title: string];
}>();

const config = useRuntimeConfig();
const { t } = useI18n();
const turnstileContainer = ref<HTMLElement>();
const turnstileToken = ref('');
const submitting = ref(false);
const showEndDate = ref(false);
const { getAllCountries, getCountryFlagUrl } = useCountries();

// Steps
const steps = [
  { id: 'format', label: 'Format', icon: 'pi pi-th-large', title: 'Event Format' },
  { id: 'time_location', label: 'Time & Location', icon: 'pi pi-clock', title: 'Time & Location' },
  { id: 'details', label: 'Details', icon: 'pi pi-file-edit', title: 'Event Details' },
  { id: 'review', label: 'Review', icon: 'pi pi-clipboard', title: 'Review Submission' }
];

const currentStep = ref(0);
const currentStepTitle = computed(() => steps[currentStep.value].title);

watch(currentStepTitle, (newTitle) => {
  emit('update:stepTitle', newTitle);
}, { immediate: true });
const stepErrors = ref<Record<string, boolean>>({});

const canGoToNext = computed(() => {
  if (currentStep.value === 0) {
    return !!form.value.type;
  }
  if (currentStep.value === 1) {
    if (!form.value.startDate || !form.value.startTime) return false;
    
    if (form.value.type === 'in_person' || form.value.type === 'hybrid') {
      if (!form.value.country || !form.value.city.trim() || !form.value.address.trim()) return false;
    }
    
    if (form.value.type === 'online' || form.value.type === 'hybrid') {
      if (!form.value.platform.trim() || !form.value.joinUrl.trim()) return false;
    }
    
    return true;
  }
  if (currentStep.value === 2) {
    return !!form.value.title.trim() && !!form.value.announcement.trim();
  }
  return true;
});

const countriesList = computed(() => getAllCountries.value);
const filteredCountries = ref<any[]>([]);
const selectedCountry = ref<any>(null);

const form = ref({
  type: props.initialData?.type || '' as 'in_person' | 'online' | 'hybrid' | '',
  // Time
  startDate: props.initialData?.date.start ? new Date(props.initialData.date.start.replace(/\//g, '-')) : null as Date | null,
  startTime: props.initialData?.date.start_time || '',
  endDate: props.initialData?.date.end ? new Date(props.initialData.date.end.replace(/\//g, '-')) : null as Date | null,
  endTime: props.initialData?.date.end_time || '',
  // Location
  country: props.initialData?.location?.country || '',
  city: props.initialData?.location?.city || '',
  address: props.initialData?.location?.address || '',
  // Online
  platform: props.initialData?.online?.platform || '',
  joinUrl: props.initialData?.online?.join_url || '',
  registrationUrl: props.initialData?.online?.registration_url || '',
  // Event info
  title: props.initialData?.title || '',
  description: props.initialData?.description || '',
  announcement: props.initialData?.announcement || '', // Updated from poster
  // Organizer
  organizerName: props.initialData?.organizer.name || '',
  organizerWebsite: props.initialData?.organizer.website || '',
  organizerEmail: props.initialData?.organizer.contact_email || '',
  organizerX: props.initialData?.organizer.socials?.x || '',
  organizerInstagram: props.initialData?.organizer.socials?.instagram || '',
  organizerTelegram: props.initialData?.organizer.socials?.telegram || ''
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
  
  // Initialize selectedCountry if initialData exists
  if (form.value.country) {
    const found = countriesList.value.find(c => c.iso2 === form.value.country);
    if (found) selectedCountry.value = found;
  }
  
  // Check if end date was provided in initial data
  if (props.initialData?.date.end || props.initialData?.date.end_time) {
    showEndDate.value = true;
  }
});

function searchCountry(event: any) {
  const query = event.query.toLowerCase();
  filteredCountries.value = countriesList.value.filter(c => 
    c.name.toLowerCase().includes(query) || 
    c.iso2.toLowerCase().includes(query) ||
    t('countries.' + c.iso2, c.name).toLowerCase().includes(query) ||
    (c.aliases && c.aliases.some((a: string) => a.toLowerCase().includes(query)))
  );
}

function onCountrySelect(event: any) {
  if (event.value) {
    form.value.country = event.value.iso2;
  }
}



function getCountryName(iso2: string) {
  const country = countriesList.value.find(c => c.iso2 === iso2);
  return country ? t('countries.' + country.iso2, country.name) : iso2;
}

function validateTimeInput(event: KeyboardEvent) {
  // Allow navigation keys (backspace, delete, arrows, tab)
  if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(event.key)) {
    return;
  }
  // Allow only numbers and colon
  if (!/[0-9:]/.test(event.key)) {
    event.preventDefault();
  }
}


function renderTurnstile() {
  if (currentStep.value !== 3) return;
  if (!(window as any).turnstile) {
    setTimeout(renderTurnstile, 200);
    return;
  }
  if (!turnstileContainer.value) {
    setTimeout(renderTurnstile, 100);
    return;
  }
  
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

function validateStep(): boolean {
  stepErrors.value = {};

  if (currentStep.value === 0) {
    if (!form.value.type) {
      stepErrors.value.type = true;
      return false;
    }
  }

  if (currentStep.value === 1) {
    let valid = true;
    if (!form.value.startDate) {
      stepErrors.value.startDate = true;
      valid = false;
    }
    if (!form.value.startTime) {
      stepErrors.value.startTime = true;
      valid = false;
    }
    
    if (form.value.type === 'in_person' || form.value.type === 'hybrid') {
      if (!form.value.country) {
        stepErrors.value.country = true;
        valid = false;
      }
      if (!form.value.city || !form.value.city.trim()) {
        stepErrors.value.city = true;
        valid = false;
      }
      if (!form.value.address || !form.value.address.trim()) {
        stepErrors.value.address = true;
        valid = false;
      }
    }

    if (form.value.type === 'online' || form.value.type === 'hybrid') {
        if (!form.value.platform.trim()) {
            stepErrors.value.platform = true;
            valid = false;
        }
        if (!form.value.joinUrl.trim()) {
            stepErrors.value.joinUrl = true;
            valid = false;
        }
    }

    return valid;
  }

  if (currentStep.value === 2) {
    let valid = true;
    if (!form.value.title.trim()) {
      stepErrors.value.title = true;
      valid = false;
    }
    // Description is now optional
    
    // Announcement Link is required
    if (!form.value.announcement.trim()) {
      stepErrors.value.announcement = true;
      valid = false;
    }
    
    // Organizer name is now optional
    return valid;
  }

  return true;
}

function handleNext() {
  if (validateStep()) {
    currentStep.value++;
    if (currentStep.value === 3) {
      nextTick(() => renderTurnstile());
    }
  }
}

async function handleSubmit() {
  console.log('EventSubmissionForm: handleSubmit called');
  
  if (!turnstileToken.value) {
    alert('Please wait for the security check (Cloudflare Turnstile) to complete. If it does not appear, please refresh the page.');
    return;
  }

  try {
    console.log('EventSubmissionForm: Preparing data...');
    const data = {
      title: form.value.title,
      featured: false,
      description: form.value.description,
      type: form.value.type,
      date: {
        start: formatDate(form.value.startDate),
        start_time: form.value.startTime,
        end: showEndDate.value && form.value.endDate ? formatDate(form.value.endDate) : undefined,
        end_time: showEndDate.value && form.value.endTime ? form.value.endTime : undefined
      },
      location: (form.value.type === 'in_person' || form.value.type === 'hybrid') ? {
        country: form.value.country,
        city: form.value.city,
        address: form.value.address
      } : undefined,
      online: (form.value.type === 'online' || form.value.type === 'hybrid') ? {
        platform: form.value.platform,
        join_url: form.value.joinUrl,
        registration_url: form.value.registrationUrl || undefined
      } : undefined,
      organizer: {
        name: form.value.organizerName,
        website: form.value.organizerWebsite || undefined,
        contact_email: form.value.organizerEmail || undefined,
        socials: {
          x: form.value.organizerX || undefined,
          instagram: form.value.organizerInstagram || undefined,
          telegram: form.value.organizerTelegram || undefined
        }
      },
      announcement: form.value.announcement
    };
    
    console.log('EventSubmissionForm: Data prepared, starting internal submission...', data);
    submitting.value = true;

    // Step 1: Calculate hashes
    const fileInfos = [];
    // Events don't usually have files in this form, but keeping logic just in case or for consistency
    // The form.files seems to be empty array in the current code, but let's check.
    // data.files is passed as [] in current emit. 
    // Wait, the emit had files: []
    // So we don't need file handling for Events right now?
    // The current handleSubmit in submit.vue loops over payload.files.    

    const initResponse = await initUpload({
      turnstileToken: turnstileToken.value,
      kind: 'event',
      files: []
    });
    console.log('EventSubmissionForm: Init success', initResponse);

    // Step 2: R2 Upload (Skipped as no files for events currently)

    // Step 3: Complete
    await completeSubmission({
      submissionId: initResponse.submissionId,
      kind: 'event',
      payload: data,
      uploadedFiles: [],
      turnstileToken: turnstileToken.value
    });
    console.log('EventSubmissionForm: Complete success');

    // Show success state
    emit('success', { submissionId: initResponse.submissionId });
    // Also set localized success state if parent doesn't handle it
    submitted.value = true;
    submissionId.value = initResponse.submissionId;

  } catch (err: any) {
    console.error('EventSubmissionForm: Error in handleSubmit', err);
    alert(`Submission failed: ${err.message || 'Unknown error'}`);
  } finally {
    submitting.value = false;
  }
}

const submitted = ref(false);
const submissionId = ref('');

function resetForm() {
  submitted.value = false;
  submissionId.value = '';
  currentStep.value = 0;
  // Reset form data...
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatSocialUrl(platform: 'x' | 'instagram' | 'telegram') {
  let value = '';
  
  if (platform === 'x') value = form.value.organizerX;
  else if (platform === 'instagram') value = form.value.organizerInstagram;
  else if (platform === 'telegram') value = form.value.organizerTelegram;
  
  if (!value || !value.trim()) return;
  
  value = value.trim();
  
  // If it's already a URL, leave it alone
  if (value.startsWith('http://') || value.startsWith('https://')) return;
  
  // Remove @ if present
  if (value.startsWith('@')) value = value.substring(1);
  
  // Construct URL
  if (platform === 'x') {
    form.value.organizerX = `https://x.com/${value}`;
  } else if (platform === 'instagram') {
    form.value.organizerInstagram = `https://www.instagram.com/${value}/`;
  } else if (platform === 'telegram') {
    form.value.organizerTelegram = `https://t.me/${value}`;
  }
}
</script>
