import type {JsonObject, JsonValue} from '@croct/json';
import type {ContentDefinition, ContentDefinitionBundle} from '@croct/content-model/definition';
import type {FetchResponse} from '@croct/plug';
import type {DynamicSlotId} from '@croct/plug/slot';

export type ContentFetcher = (id: string) => Promise<FetchResponse<DynamicSlotId>>;

export async function resolveContent(content: JsonValue, fetcher: ContentFetcher): Promise<JsonValue> {
    if (isObject(content)) {
        if (typeof content.croct === 'string' && content.croct.trim() !== '') {
            const {croct: slotId, ...rest} = content;

            return await fetcher(content.croct).then(
                response => createStoryblokContent(response.content, response.metadata?.schema) ?? rest,
            ).catch(() => content);
        }

        return Object.fromEntries(
            await Promise.all(
                Object.entries(content).map(
                    async ([key, value]) => [
                        key,
                        value === undefined ? value : await resolveContent(value, fetcher),
                    ],
                ),
            ),
        );
    }

    if (Array.isArray(content)) {
        return Promise.all(content.map(item => resolveContent(item, fetcher)));
    }

    return content;
}

export function createStoryblokContent(
    content: JsonObject,
    schemas: ContentDefinitionBundle | undefined,
): JsonObject | undefined {
    if (schemas === undefined) {
        return undefined;
    }

    return createStoryblokContentRecursively({
        content: content,
        schemas: schemas,
    }) as JsonObject;
}

type ContentCreationContext = {
    content: JsonValue,
    schemas: ContentDefinitionBundle,
    definition?: ContentDefinition,
};

function createStoryblokContentRecursively(context: ContentCreationContext): JsonValue | undefined {
    const {content, schemas, definition} = context;

    if (definition === undefined) {
        if (schemas !== undefined && isObject(content) && typeof content?._component === 'string') {
            return createStoryblokContentRecursively({
                content: content,
                schemas: schemas,
                definition: schemas.root,
            });
        }

        return undefined;
    }

    if (typeof content === 'number' && definition.type === 'number') {
        return content.toString();
    }

    if (Array.isArray(content) && definition.type === 'list') {
        const elements: JsonValue[] = [];

        for (const item of content) {
            const itemContent = createStoryblokContentRecursively({
                content: item,
                schemas: schemas,
                definition: definition.items,
            });

            if (itemContent === undefined) {
                return undefined;
            }

            elements.push(itemContent);
        }

        return elements;
    }

    if (typeof content === 'string') {
        if (definition.type === 'reference' && definition.id === '@croct/file') {
            return {
                id: null,
                alt: null,
                name: '',
                focus: '',
                title: null,
                filename: content,
                copyright: null,
                fieldtype: 'asset',
                meta_data: {},
                is_external_url: true,
            };
        }

        if (definition.type === 'text' && definition.format === 'url') {
            return {
                id: '',
                linktype: 'url',
                fieldtype: 'multilink',
                url: content,
                cached_url: content,
            };
        }
    } else if (isObject(content)) {
        switch (definition.type) {
            case 'structure': {
                const componentName = typeof content._component === 'string' && content._component.trim() !== ''
                    ? getComponentName(content._component)
                    : null;

                if (componentName === null) {
                    return undefined;
                }

                const entries: JsonObject = {};

                for (const [key, value] of Object.entries(content)) {
                    if (key === '_component' || key === '_type' || value === undefined) {
                        continue;
                    }

                    if (definition.attributes[key] === undefined) {
                        return undefined;
                    }

                    const attributeContent = createStoryblokContentRecursively({
                        content: value,
                        schemas: schemas,
                        definition: definition.attributes[key].type,
                    });

                    if (attributeContent === undefined) {
                        return undefined;
                    }

                    entries[key] = attributeContent;
                }

                return {
                    _uid: generateUid(),
                    component: componentName,
                    ...entries,
                };
            }

            case 'union': {
                const memberDefinition = definition.types[content._type as string];

                if (memberDefinition === undefined) {
                    return undefined;
                }

                return createStoryblokContentRecursively({
                    content: {...content, _component: content._type},
                    schemas: schemas,
                    definition: memberDefinition,
                });
            }

            case 'reference': {
                const referenceDefinition = schemas?.definitions[definition.id];

                if (referenceDefinition === undefined) {
                    return undefined;
                }

                return createStoryblokContentRecursively({
                    content: {...content, _component: definition.id},
                    schemas: schemas,
                    definition: referenceDefinition,
                });
            }
        }
    }

    return content;
}

function getComponentName(id: string): string | null {
    const name = id.replace(/@.*$/, '');

    if (name.trim() === '') {
        return null;
    }

    return name;
}

function generateUid(): string {
    return crypto.randomUUID();
}

function isObject(value: JsonValue | undefined): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
