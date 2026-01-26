export function isSsr(): boolean {
    return globalThis.window?.document?.createElement === undefined;
}
