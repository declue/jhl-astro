import {defineCollection, z} from 'astro:content';

export interface Blog {
    title: string;
    description: string;
    pubDate: Date;
    updatedDate?: Date;
    heroImage?: string;
    draft?: boolean;
    series?: string;
}
const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        heroImage: z.string().optional(),
        draft: z.boolean().optional(),
        series: z.string().optional()
    }),
});

const actions = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
    }),
});


export const collections = {blog, actions};
