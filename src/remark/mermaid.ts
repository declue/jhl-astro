import { visit } from 'unist-util-visit';
import type {Node} from 'unist';
import type {Parent} from 'unist';

interface CodeNode extends Node {
    lang?: string;
    value: string;
}

export function remarkMermaid() {
    return (tree: Node) => {
        visit(tree, 'code', (node: CodeNode, index: number, parent: Parent | undefined) => {
            if (node.lang === 'mermaid-render' && parent) {
                const mermaidHtml = `<div class="mermaid">${node.value}</div>`;
                const newNode: CodeNode = {
                    type: 'html',
                    value: mermaidHtml
                };
                parent.children.splice(index, 1, newNode);
            }
        });
    };
}
