import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

// Global state
const isHeaderVisible = ref(true)
const lastScrollY = ref(0)
const headerHeight = 64 // Fixed height of the header

export const useStickyHeader = () => {
    const route = useRoute()
    const isMobile = ref(false)
    const activeThreshold = ref<number | null>(null)

    const checkMobile = () => {
        isMobile.value = typeof window !== 'undefined' && window.innerWidth < 768
    }

    const handleScroll = () => {
        // If mobile, keep header visible and skip threshold logic
        if (isMobile.value) {
            isHeaderVisible.value = true
            return
        }

        // Force header visible on specific pages
        if (route.path.startsWith('/events') || route.path === '/') {
            isHeaderVisible.value = true
            return
        }

        const currentScrollY = window.scrollY

        // Threshold Logic
        if (activeThreshold.value !== null) {
            isHeaderVisible.value = currentScrollY < activeThreshold.value
        } else {
            // Default logic (scroll up/down toggle)
            const scrollDiff = currentScrollY - lastScrollY.value
            if (currentScrollY > headerHeight && scrollDiff > 0) {
                isHeaderVisible.value = false
            } else if (scrollDiff < 0 || currentScrollY < headerHeight) {
                isHeaderVisible.value = true
            }
        }

        lastScrollY.value = currentScrollY
    }

    const registerStickyTrigger = (element: HTMLElement) => {
        if (isMobile.value) {
            activeThreshold.value = null
            return
        }

        const rect = element.getBoundingClientRect()
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const absoluteTop = rect.top + scrollTop

        // Threshold = Absolute Top - Header Height
        activeThreshold.value = absoluteTop - headerHeight
        handleScroll()
    }

    onMounted(() => {
        checkMobile()
        window.addEventListener('resize', checkMobile)
        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()
    })

    onUnmounted(() => {
        window.removeEventListener('resize', checkMobile)
        window.removeEventListener('scroll', handleScroll)
    })

    const headerOffset = computed(() => isHeaderVisible.value ? headerHeight : 0)

    return {
        isHeaderVisible,
        isMobile,
        headerOffset,
        headerHeight,
        registerStickyTrigger
    }
}
