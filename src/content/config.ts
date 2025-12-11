import { z, defineCollection } from 'astro:content';

const homeCollection = defineCollection({
    type: 'content',
    schema: z.object({
        hero: z.object({
            title_part_1: z.string(),
            title_part_2: z.string(),
            pill_text: z.string(),
            info: z.string()
        }),
        partners: z.object({
            title: z.string(),
            images: z.array(z.object({
                name: z.string(),
                src: z.string()
            }))
        }),
        ai_solutions: z.object({
            title: z.string(),
            sub_title: z.string(),
            cta_text: z.string(),
            cards: z.array(z.object({
                id: z.string(),
                heading: z.string(), 
                description: z.string(),
                icon: z.string(),
                button_text: z.string()
            }))
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
        roadmap: z.object({
            title_1: z.string(),
            title_2: z.string(),
            sub_title: z.string(),
            cards: z.array(z.object({
                id: z.string(),
                heading: z.string(),
                description: z.string(),
                icon: z.string()
            }))
        }),
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

const industriesCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        hero: z.object({
            heading: z.string(),
            subtext: z.string(),
            video: z.string(),
            cta_text: z.string(),
            cta_link: z.string()
        }),
        trust: z.object({
            line: z.string()
        }),
        barriers: z.object({
            heading: z.string(),
            cards: z.array(z.object({
                title: z.string(),
                description: z.string()
            }))
        }),
        products: z.object({
            title: z.string(),
            subtitle: z.string(),
            tabs: z.array(z.object({
                id: z.string(),
                name: z.string(),
                heading: z.string(),
                sections: z.array(z.object({
                    subheading: z.string(),
                    description: z.string()
                })),
                cta_text: z.string(),
                cta_link: z.string(),
                image: z.string(),
                image_alt: z.string()
            }))
        }),
        why_trust: z.object({
            heading: z.string(),
            cards: z.array(z.object({
                title: z.string(),
                description: z.string(),
                icon: z.string()
            }))
        })
    })
});

export const collections = {
    'home': homeCollection,
    'about': aboutCollection,
    'industries': industriesCollection,
    'service-showcase': defineCollection({
        type: 'content',
        schema: z.any()
    }),
};