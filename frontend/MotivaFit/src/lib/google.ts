export function googleConfigurado(): boolean {
    return Boolean(import.meta.env?.VITE_GOOGLE_CLIENT_ID);
}
