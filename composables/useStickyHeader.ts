import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

// Global state
const isHeaderVisible = ref(true)
const lastScrollY = ref(0)
const headerHeight = 64 // Fixed height of the header
const filterBarElement = ref<HTMLElement | null>(null)

export const useStickyHeader = () => {
    const route = useRoute()

    const handleScroll = () => {
        // Force header visible on events page
        if (route.path.startsWith('/events')) {
            isHeaderVisible.value = true
            return
        }

        const currentScrollY = window.scrollY

        // Dynamic Swap Logic
        if (filterBarElement.value) {
            // Get the filter bar's position relative to the viewport
            const rect = filterBarElement.value.getBoundingClientRect()

            // The "swap point" is when the filter bar reaches the bottom of the header.
            // Since the header is 64px tall, this means when filterBar.top <= 64.
            // BUT, if the header is visible, it takes up 64px.
            // We want to hide the header exactly when the filter bar would slide under it?
            // User said: "swap upon reaching points betwen header and filters section"
            // And: "header must only appear when the filter reached its initial placement."

            // Initial placement calculation:
            // We can store the initial offsetTop of the filter bar.
            // Or easier:
            // Hide header when filterBar.top <= headerHeight (64)
            // Show header when filterBar.top > headerHeight (64)

            // Note: getBoundingClientRect().top changes as we scroll.
            // When scrolled to top, rect.top is large (e.g. 400).
            // As we scroll down, rect.top decreases.
            // When it hits 64, it's touching the header.
            // At this point, we hide the header. 
            // When header hides, filterBar.top might jump if not handled? 
            // No, because filterBar is likely `sticky` with `top: headerOffset`.
            // If headerOffset becomes 0, filterBar sticks to 0.

            // Logic:
            // If rect.top <= 64: isHeaderVisible = false (Header hides, filter sticks to 0)
            // If rect.top > 64: isHeaderVisible = true (Header shows, filter sticks to 64)

            // Wait, if we toggle isHeaderVisible, headerOffset changes from 64 to 0.
            // If filterBar is `sticky` at `top: headerOffset`:
            // 1. Scroll down. rect.top hits 64.
            // 2. We set isHeaderVisible = false. headerOffset -> 0.
            // 3. Filter bar style updates to `top: 0`.
            // 4. Since we are at scrollY where rect.top was 64, now that `top` target is 0,
            //    start sticking?

            // We need to be careful about hysteresis or loops.
            // But fundamentally:
            // If we are "above" the swap point (scrolled down past it), header should be hidden.
            // The swap point is defined by the page structure (e.g. Hero height).

            // Let's rely on absolute measurements.
            // On register, calculate the absolute threshold once? 
            // Issue: layout shifts (images loading).
            // Better: use relative checking but robustly.

            // Let's stick to the absolute threshold but calculated ROBUSTLY.
            // We can calculate it on mount/register and maybe re-calc on resize.
            // Threshold = element.offsetTop. 
            // The element is usually inside the page flow.

            // Let's refine the previous logic but ensure we get the correct offsetTop.
            // Element.offsetTop is relative to offsetParent. 
            // If offsetParent is body, it's page coordinate.
            // Let's try getting the distinct "threshold" value more accurately.
        }

        // Fallback or Absolute Threshold Logic
        if (activeThreshold.value !== null) {
            isHeaderVisible.value = currentScrollY < activeThreshold.value
        } else {
            // Default logic
            const scrollDiff = currentScrollY - lastScrollY.value
            if (currentScrollY > headerHeight && scrollDiff > 0) {
                isHeaderVisible.value = false
            } else if (scrollDiff < 0 || currentScrollY < headerHeight) {
                isHeaderVisible.value = true
            }
        }

        lastScrollY.value = currentScrollY
    }

    // We use a ref for the numeric threshold now.
    const activeThreshold = ref<number | null>(null)

    const registerStickyTrigger = (element: HTMLElement) => {
        // Calculate the absolute top position of the element
        // We want the header to hide when this element hits the header (64px from top)
        // OR when it hits the top (0px)? 
        // "swap upon reaching points betwen header and filters"
        // Let's say we want to hide header when filter bar touches the visual header.
        // Screen Top -> [Header 64px] -> [Hero] -> [Filter Bar]
        // Scroll Down -> [Header] ... [Filter Bar comes up]
        // Filter bar hits bottom of header.
        // NOW swap: Header slides up/out. Filter bar slides to Top (0).

        // This scroll position is: Element.offsetTop - HeaderHeight.
        // At this ScrollY, the element is at 64px from viewport top.

        // But wait, user said "header must only appear when the filter reached its initial placement".
        // This confirms the threshold logic:
        // ScrollY < Threshold: Header Visible.
        // ScrollY >= Threshold: Header Hidden.

        // Only issue in previous attempt was likely `offsetTop` being wrong or `header` transition interfering.
        // Let's compute absolute top carefully.
        const rect = element.getBoundingClientRect()
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const absoluteTop = rect.top + scrollTop

        // Threshold = Absolute Top - 64 (Header Height) + small buffer?
        // Let's use exactly Absolute Top - 64.
        const newThreshold = absoluteTop - headerHeight

        activeThreshold.value = newThreshold

        handleScroll()
    }

    onMounted(() => {
        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()
    })

    onUnmounted(() => {
        window.removeEventListener('scroll', handleScroll)
    })

    const headerOffset = computed(() => isHeaderVisible.value ? headerHeight : 0)

    return {
        isHeaderVisible,
        headerOffset,
        headerHeight,
        registerStickyTrigger
    }
}
