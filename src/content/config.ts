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
            bg: z.string(),
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
        testimonials: z.array(z.object({
            number: z.preprocess((val) => `#testimonial-${val}`, z.string()),
            name: z.string(),
            designation: z.string(),
            title: z.string(),
            desc: z.string()
        }))
    }),
});

const aboutCollection = defineCollection({
    type: 'content',
    schema: z.object({
        hero: z.object({
            title: z.string(),
            features: z.array(z.string())
        }),
        mission: z.object({
            title: z.string(),
            desc: z.string(),
            img: z.string()
        }),
        values: z.object({
            title: z.string(),
            cards: z.array(z.object({
                svg: z.string(),
                title: z.string(),
                desc: z.string()
            }))
        }),
        benefits: z.object({
            title: z.string(),
            points: z.array(z.object({
                number: z.preprocess((val) => `0${val}`, z.string()),
                title: z.string(),
                desc: z.string()
            }))
        }),
        approach: z.object({
            title: z.string(),
            desc: z.string(),
            img: z.string()
        }),
    })
});

export const collections = {
    'home': homeCollection,
    'about': aboutCollection,
    'service-showcase': defineCollection({
        type: 'content',
        schema: z.any()
    }),
};