import {JsonObject, JsonValue} from '@croct/json';
import {ContentDefinition, ContentDefinitionBundle} from '@croct/content-model/definition';
import type {FetchResponse} from '@croct/plug';
import {DynamicSlotId} from '@croct/plug/slot';

export type ContentFetcher = (id: string) => Promise<FetchResponse<DynamicSlotId>>;

export async function resolveContent(content: JsonValue, fetcher: ContentFetcher): Promise<JsonValue> {
    if (isObject(content)) {
        if (typeof content.croct === 'string' && content.croct.trim() !== '') {
            return await fetcher(content.croct).then(
                response => createStoryblokContent({
                    schemas: response.metadata?.schema,
                    content: response.content,
                }),
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

type ContentCreationContext = {
    content: JsonValue,
    schemas?: ContentDefinitionBundle,
    definition?: ContentDefinition,
};

export function createStoryblokContent(context: ContentCreationContext): JsonValue {
    const {content, schemas, definition} = context;

    if (definition === undefined) {
        if (schemas !== undefined && isObject(content) && typeof content?._component === 'string') {
            return createStoryblokContent({
                content: content,
                schemas: schemas,
                definition: schemas.root,
            });
        }

        return content;
    }

    if (typeof content === 'number' && definition.type === 'number') {
        return content.toString();
    }

    if (Array.isArray(content) && definition.type === 'list') {
        return content.map(
            item => createStoryblokContent({
                content: item,
                schemas: schemas,
                definition: definition.items,
            }),
        );
    }

    if (typeof content === 'string') {
        if (definition.type === 'reference' && definition.id === '@croct/file') {
            return {
                fieldtype: 'asset',
                id: null,
                alt: null,
                name: '',
                focus: '',
                title: null,
                filename: content,
                copyright: null,
                meta_data: {},
                is_external_url: true,
            };
        }

        if (definition.type === 'text' && definition.format === 'url') {
            return {
                linktype: 'url',
                fieldtype: 'multilink',
                url: content,
                cached_url: content,
            };
        }
    } else if (isObject(content)) {
        switch (definition.type) {
            case 'structure':
                return {
                    _uid: generateUid(),
                    component: typeof content._component === 'string' && content._component.trim() !== ''
                        ? getComponentName(content._component)
                        : 'unknown',
                    ...Object.fromEntries(
                        Object.entries(content).flatMap(([key, value]) => {
                            if (key === '_component' || key === '_type') {
                                return [];
                            }

                            if (definition.attributes[key] !== undefined && value !== undefined) {
                                return [[
                                    key,
                                    createStoryblokContent({
                                        content: value,
                                        schemas: schemas,
                                        definition: definition.attributes[key].type,
                                    }),
                                ]];
                            }

                            return [[key, value]];
                        }),
                    ),
                };

            case 'union': {
                const memberDefinition = definition.types[content._type as string];

                if (memberDefinition !== undefined) {
                    return createStoryblokContent({
                        content: {...content, _component: content._type},
                        schemas: schemas,
                        definition: memberDefinition,
                    });
                }

                break;
            }

            case 'reference': {
                const referenceDefinition = schemas?.definitions[definition.id];

                if (referenceDefinition !== undefined) {
                    return createStoryblokContent({
                        content: {...content, _component: definition.id},
                        schemas: schemas,
                        definition: referenceDefinition,
                    });
                }

                break;
            }
        }
    }

    return content;
}

function getComponentName(id: string): string {
    return id.replace(/@.*$/, '');
}

function generateUid(): string {
    return crypto.randomUUID();
}

function isObject(value: JsonValue | undefined): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
