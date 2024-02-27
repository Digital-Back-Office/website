import { z, defineCollection } from 'astro:content';

const homeCollection = defineCollection({
    type: 'content',
    schema: z.object({
        hero: z.object({
            title_part_1: z.string(),
            title_part_2: z.string(),
            info: z.string()
        }),
        about: z.object({
            title: z.string(),
            info_part_1: z.string(),
            info_part_2: z.string()
        }),
        keyPoints: z.array(z.object({
            title: z.string(),
            info: z.string()
        })),
        features: z.object({
            title: z.string(),
            cards: z.array(z.object({
                title: z.string(),
                info: z.string()
            }))
        }),
    }),
});

export const collections = {
    'home': homeCollection,
};