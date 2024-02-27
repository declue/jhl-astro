import { visit } from 'unist-util-visit';

export function remarkGist() {
    return (tree: any) => {
        visit(tree, 'code', (node, index, parent) => {
            if (node.lang === 'gist' && typeof index === 'number' && parent) {
                // Gist 코드 블록을 raw HTML 노드로 교체
                const gistHtml = `<script src="https://gist.github.com/${node.value}.js"></script>`
                parent.children[index] = {type: 'html', value: gistHtml};
            }
        });
    };
}
