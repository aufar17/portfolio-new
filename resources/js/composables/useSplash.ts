import { ref, onMounted } from 'vue';

export function useSplash(duration = 2500) {
    const splashDone = ref(false);

    onMounted(() => {
        const hasShown = sessionStorage.getItem('splash-shown');
        if (!hasShown) {
            setTimeout(() => {
                splashDone.value = true;
                sessionStorage.setItem('splash-shown', 'true');
            }, duration);
        } else {
            splashDone.value = true;
        }
    });

    return { splashDone };
}
