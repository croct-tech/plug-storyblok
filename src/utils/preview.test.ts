import {isPreviewUrl} from '@/utils/preview';

describe('isPreviewUrl', () => {
    it('should return true when URL has _storyblok_c parameter', () => {
        expect(isPreviewUrl('https://example.com?_storyblok_c=123')).toBe(true);
    });

    it('should return true when URL has _storyblok_c parameter with empty value', () => {
        expect(isPreviewUrl('https://example.com?_storyblok_c=')).toBe(true);
    });

    it('should return false when URL does not have _storyblok_c parameter', () => {
        expect(isPreviewUrl('https://example.com')).toBe(false);
    });

    it('should handle relative URLs', () => {
        expect(isPreviewUrl('/path?_storyblok_c=123')).toBe(true);
        expect(isPreviewUrl('/path')).toBe(false);
    });
});
