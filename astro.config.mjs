import {defineConfig} from 'astro/config';
import mdx from '@astrojs/mdx';
import react from "@astrojs/react";
import sitemap from '@astrojs/sitemap';
import {remarkGist} from "./src/remark/gist";
import {remarkMermaid} from "./src/remark/mermaid";

// https://astro.build/config
export default defineConfig({
    site: 'https://jhl-astro.github.io',
//	base: '/myblog',
    markdown: {
        remarkPlugins: [
            remarkGist,
            remarkMermaid
        ],
        rehypePlugins: []
    },
    integrations: [
        mdx(),
        sitemap(),
        react()
    ],
    content: {
        sources: ['contents']
    }
});
