/**
 * @internal
 */
export function isPreviewUrl(url: string): boolean {
    const {searchParams} = new URL(url, 'http://localhost');

    return searchParams.has('_storyblok_c');
}
