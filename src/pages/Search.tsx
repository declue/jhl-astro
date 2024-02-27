import Fuse from "fuse.js";
import React, {useEffect, useMemo, useRef, useState} from "react";
import type {CollectionEntry} from "astro:content";
import {BASE_URL} from "../consts.ts";

export type SearchItem = {
    title: string;
    description: string;
    data: CollectionEntry<"blog">["data"];
    slug: string;
};

interface Props {
    searchList: SearchItem[];
}

interface SearchResult {
    item: SearchItem;
    refIndex: number;
    key?: string;
}

export default function SearchBar({searchList}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputVal, setInputVal] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
        null
    );

    const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        setInputVal(e.currentTarget.value);
    };

    const fuse = useMemo(
        () =>
            new Fuse(searchList, {
                keys: ["title", "description"],
                includeMatches: true,
                minMatchCharLength: 2,
                threshold: 0.5,
            }),
        [searchList]
    );

    useEffect(() => {
        // if URL has search query,
        // insert that search query in input field
        const searchUrl = new URLSearchParams(window.location.search);
        const searchStr = searchUrl.get("q");
        if (searchStr) setInputVal(searchStr);

        // put focus cursor at the end of the string
        setTimeout(function () {
            inputRef.current!.selectionStart = inputRef.current!.selectionEnd =
                searchStr?.length || 0;
        }, 50);
    }, []);

    useEffect(() => {
        // Add search result only if
        // input value is more than one character
        let inputResult = inputVal.length > 1 ? fuse.search(inputVal) : [];

        // add inputVal to search results
        inputResult = inputResult.map((result) => {
            return {
                item: result.item,
                refIndex: result.refIndex,
                key: inputVal
            };
        });

        setSearchResults(inputResult);

        // Update search string in URL
        if (inputVal.length > 0) {
            const searchParams = new URLSearchParams(window.location.search);
            searchParams.set("q", inputVal);
            const newRelativePathQuery =
                window.location.pathname + "?" + searchParams.toString();
            history.replaceState(history.state, "", newRelativePathQuery);
        } else {
            history.replaceState(history.state, "", window.location.pathname);
        }
    }, [inputVal]);

    function highlightText(text: string, query: string): JSX.Element {
        if (!query) return <>{text}</>;

        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
            <>
                {parts.map((part, index) =>
                    part.toLowerCase() === query.toLowerCase()
                        ? <span key={index} style={{ color: 'blue' }}>{part}</span>
                        : part
                )}
            </>
        );
    }

    return (

        <div className="search">
            <label className="search-label">
        <span className="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                    d="M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z"/>
            </svg>
            <span className="sr-only">Search</span>
        </span>
                <input
                    className="search-input"
                    placeholder="Search for anything..."
                    type="text"
                    name="search"
                    value={inputVal}
                    onChange={handleChange}
                    autoComplete="off"
                    ref={inputRef}
                />
            </label>

            {inputVal.length > 1 && (
                <div className="search-results-summary">
                    Found {searchResults?.length}
                    {searchResults?.length && searchResults?.length === 1 ? " result" : " results"} for '{inputVal}'
                </div>
            )}

            <ul className="search-results-list">
                {searchResults && searchResults.map(({item, refIndex}) => (
                    <li key={refIndex} className="search-result-item">
                        <a href={`${BASE_URL}/blog/${item.slug}/`} className="search-result-link">
                            <div style={{border: "1px solid var(--default-font-color)"}}>
                                <p style={{fontWeight: "bold", color: "var(--default-font-color)"}}>
                                    #{refIndex} - {highlightText(item.data.title, inputVal)} - {item.data.pubDate.toDateString()}
                                </p>
                                <p style={{
                                    paddingLeft: "30px",
                                    color: "var(--default-font-color)"
                                }}>
                                    {highlightText(item.data.description, inputVal)}
                                </p>
                            </div>
                        </a>
                    </li>
                ))}
            </ul>

        </div>

    );
}