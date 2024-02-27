import {POST_PER_PAGE, SCHEDULES_POST_MARGIN} from "./consts.ts"
import {type CollectionEntry} from "astro:content";


export interface GetPaginationProps<T> {
    posts: T;
    page: string | number;
    isIndex?: boolean;
}

export const getPageNumbers = (numberOfPosts: number) => {
    const numberOfPages = numberOfPosts / Number(POST_PER_PAGE);

    let pageNumbers: number[] = [];
    for (let i = 1; i <= Math.ceil(numberOfPages); i++) {
        pageNumbers = [...pageNumbers, i];
    }
    return pageNumbers;
};

export const getPagination = <T>({
                                     posts,
                                     page,
                                     isIndex = false,
                                 }: GetPaginationProps<T[]>) => {
    const totalPagesArray = getPageNumbers(posts.length);
    const totalPages = totalPagesArray.length;

    const currentPage = isIndex
        ? 1
        : page && !isNaN(Number(page)) && totalPagesArray.includes(Number(page))
            ? Number(page)
            : 0;
    const lastPost = isIndex ? POST_PER_PAGE : currentPage * POST_PER_PAGE;
    const startPost = isIndex ? 0 : lastPost - POST_PER_PAGE;
    const paginatedPosts = posts.slice(startPost, lastPost);

    return {
        totalPages,
        currentPage,
        paginatedPosts,
    };
};


const postFilter = ({data}: CollectionEntry<"blog">) => {
    const isPublishTimePassed =
        Date.now() >
        new Date(data.pubDate).getTime() - SCHEDULES_POST_MARGIN;
    return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
};

export const getSortedPosts = (posts: CollectionEntry<"blog">[]) => {
    return posts
        .filter(postFilter)
        .sort(
            (a, b) =>
                Math.floor(
                    new Date(b.data.updatedDate ?? b.data.pubDate).getTime() / 1000
                ) -
                Math.floor(
                    new Date(a.data.updatedDate ?? a.data.pubDate).getTime() / 1000
                )
        );
};

export const getSeriesMap = (posts: CollectionEntry<"blog">[]) : Map<string,  CollectionEntry<"blog">[]> => {
    let seriesMap = new Map()
    posts.map(post => {
        if (post.data.series) {
            if (!seriesMap.has(post.data.series))
                seriesMap.set(post.data.series, [])
            seriesMap.get(post.data.series).push(post)
        }
    })
    seriesMap.forEach((values, key) => {
        seriesMap.set(
            key,
            values.sort(
                (a: { data: { pubDate: number; }; }, b: { data: { pubDate: number; }; }) => a.data.pubDate - b.data.pubDate)
        );
    });

    const sortedKeys = [...seriesMap.keys()].sort();
    const sortedSeriesMap = new Map();
    sortedKeys.forEach(key => {
        sortedSeriesMap.set(key, seriesMap.get(key));
    });

    return sortedSeriesMap;
}