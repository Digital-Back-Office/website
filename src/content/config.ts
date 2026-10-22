import { z, defineCollection } from 'astro:content';

const homeCollection = defineCollection({
    type: 'content',
    schema: z.object({
        hero: z.object({
            title_part_1: z.string(),
            title_part_2: z.string(),
            pill_text: z.string(),
            info: z.string(),
            trust: z.object({
                label: z.string(),
                items: z.array(z.string())
            }).optional()
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
                alt: z.string(),
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
            info: z.string(),
            alt: z.string()
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
                alt: z.string(),
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
            desc: z.string(),
            // Square headshot; the attribution falls back to text only when absent.
            image: z.string().optional(),
            image_alt: z.string().optional()
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
                desc: z.string(),
                alt: z.string()
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

const eventsCollection = defineCollection({
    type: 'content',
    schema: z.object({
        hero: z.object({
            badge: z.string(),
            title_part_1: z.string(),
            title_part_2: z.string(),
            subtitle: z.string(),
            primary_cta: z.object({ label: z.string(), href: z.string() }),
            secondary_cta: z.object({ label: z.string(), href: z.string() })
        }),
        upcoming: z.object({
            title: z.string(),
            subtitle: z.string(),
            empty_message: z.string()
        }),
        formats: z.object({
            badge: z.string(),
            title: z.string(),
            subtitle: z.string(),
            cards: z.array(z.object({
                icon: z.string(),
                alt: z.string(),
                title: z.string(),
                description: z.string(),
                meta: z.string()
            }))
        }),
        past: z.object({
            badge: z.string(),
            title: z.string(),
            subtitle: z.string()
        }),
        cta: z.object({
            title: z.string(),
            description: z.string(),
            primary_cta: z.object({ label: z.string(), href: z.string() }),
            secondary_cta: z.object({ label: z.string(), href: z.string() }),
            points: z.array(z.string())
        })
    })
});

/**
 * Case studies.
 *
 * The shape follows the case-study structure we work to: an intro, a strip of
 * project facts, then Problem / Solution / Results told once as prose and again
 * as three numbered blocks (the challenges, the process, the key features).
 *
 * Only the fields above `challenge` are required. Every block below it is
 * optional - leave one out and the page skips that section rather than
 * rendering an empty heading.
 */
const projectsCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        client: z.string(),
        // The big line under the client name in the hero, and the heading on
        // the listing row. Describes what was built, not who it was for.
        tagline: z.string(),
        // Meta description for the case study page.
        description: z.string(),
        // The intro paragraph under the hero, and the blurb on the listing row.
        summary: z.string(),

        industry: z.string(),
        services: z.array(z.string()).default([]),

        // Optional: without it the listing row and the hero fall back to a
        // branded placeholder panel carrying the client's monogram.
        cover_image: z.string().optional(),
        cover_alt: z.string().optional(),

        // Featured projects lead the listing, then `order` ascending.
        featured: z.boolean().default(false),
        order: z.number().default(99),

        // The fact strip under the intro. `industry` is prepended
        // automatically; add anything else here - funding raised, team size,
        // a review score - as free label/value pairs.
        duration: z.string().optional(),
        location: z.string().optional(),
        team: z.array(z.string()).default([]),
        facts: z.array(z.object({
            label: z.string(),
            value: z.string()
        })).default([]),

        // Problem / Solution / Results: `description` is the prose, `points`
        // become the numbered blocks further down the page.
        challenge: z.object({
            title: z.string(),
            description: z.string(),
            points_title: z.string().default('The Challenges'),
            points: z.array(z.object({
                title: z.string(),
                description: z.string()
            })).default([])
        }).optional(),

        solution: z.object({
            title: z.string(),
            description: z.string(),
            points_title: z.string().default('Key Features'),
            points: z.array(z.object({
                title: z.string(),
                description: z.string()
            })).default([])
        }).optional(),

        results: z.object({
            title: z.string(),
            description: z.string(),
            points: z.array(z.string()).default([])
        }).optional(),

        approach: z.object({
            title: z.string().default('The Process'),
            phases: z.array(z.object({
                title: z.string(),
                description: z.string()
            })).default([])
        }).optional(),

        // Flat list of names shown as pills under "Tech used".
        tech: z.array(z.string()).default([]),

        about_client: z.object({
            heading: z.string(),
            body: z.array(z.string())
        }).optional(),

        testimonial: z.object({
            quote: z.string(),
            name: z.string().optional(),
            role: z.string(),
            // Square headshot; the author block falls back to text only when absent.
            image: z.string().optional(),
            image_alt: z.string().optional()
        }).optional(),

        gallery: z.array(z.object({
            src: z.string(),
            alt: z.string(),
            caption: z.string().optional()
        })).default([])
    })
});

// Copy for the /work/ listing itself, kept in markdown for the same reason the
// events page is: it is edited by people who do not open .astro
// files.
const workCollection = defineCollection({
    type: 'content',
    schema: z.object({
        seo: z.object({
            title: z.string(),
            description: z.string(),
            keywords: z.string().optional()
        }),
        hero: z.object({
            title: z.string(),
            subtitle: z.string()
        }),
        listing: z.object({
            link_label: z.string().default('See case study'),
            empty_message: z.string()
        })
    })
});

export const collections = {
    'home': homeCollection,
    'about': aboutCollection,
    'industries': industriesCollection,
    'events': eventsCollection,
    'projects': projectsCollection,
    'work': workCollection,
    'service-showcase': defineCollection({
        type: 'content',
        schema: z.any()
    }),
};
