// trie.js
class Node {
    constructor() {
        this.isEnd = false;
        this.children = {};
    }
}

class Trie {
    constructor() {
        this.root = new Node();
    }

    insert(word) {
        let node = this.root;
        for (const char of word) {
            if (!node.children[char]) {
                node.children[char] = new Node();
            }
            node = node.children[char];
        }
        node.isEnd = true;
    }

    findPrefix(prefix) {
        let node = this.root;
        for (const char of prefix) {
            if (!node.children[char]) {
                return [];
            }
            node = node.children[char];
        }
        return this._getAllWords(node, prefix);
    }

    _getAllWords(node, prefix) {
        const words = [];
        if (node.isEnd) {
            words.push(prefix);
        }
        for (const [char, childNode] of Object.entries(node.children)) {
            words.push(...this._getAllWords(childNode, prefix + char));
        }
        return words;
    }
}

module.exports = Trie;

