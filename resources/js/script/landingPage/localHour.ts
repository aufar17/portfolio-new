import { onMounted, ref } from 'vue';

/**
 * The visitor's local hour (0–23) from their device clock, so it follows
 * their time zone. Read on the client only, after mount, never while
 * rendering, so the server markup doesn't depend on it; call `read()` again
 * right before using it (opening a dialog, showing a bubble) to stay current.
 */
export function useLocalHour() {
    const hour = ref<number | null>(null);
    const read = () => {
        hour.value = new Date().getHours();
    };

    onMounted(read);

    return { hour, read };
}
