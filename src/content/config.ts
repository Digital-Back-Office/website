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
            parallax_images: z.array(z.string()),
            title: z.string(),
            info_part_1: z.string(),
            info_part_2: z.string()
        }),
        keyPoints: z.array(z.object({
            svg: z.string(),
            title: z.string(),
            info: z.string()
        })),
        features: z.object({
            title: z.string(),
            cards: z.array(z.object({
                img: z.string(),
                title: z.string(),
                info: z.string()
            }))
        }),
        tech: z.object({
            title: z.string(),
            desc: z.string(),
            slider_1: z.array(z.string()),
            slider_2: z.array(z.string())
        }),
    }),
});

export const collections = {
    'home': homeCollection,
};