const express = require('express');
const axios = require('axios');
const levenshtein = require('fast-levenshtein'); 
const app = express();
const Trie = require('./trie'); 
const path = require('path');
const fs = require('fs');

async function loadWordList() {
    try {
        const words = fs.readFileSync('english_words.txt', 'utf8').split("\n");
        const trie = new Trie();
        words.forEach(word => trie.insert(word.trim()));
        return trie; 
    } catch (error) {
        console.error('Error loading word list:', error);
        throw error;
    }
}

function calculateLevenshteinDistancedp(a, b) {
    let previousRow = Array(b.length + 1).fill(0).map((_, idx) => idx);
    for (let i = 1; i <= a.length; i++) {
        let currentRow = [i];
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            currentRow[j] = Math.min(
                currentRow[j - 1] + 1, // insertion
                previousRow[j] + 1,    // deletion
                previousRow[j - 1] + cost // substitution
            );
        }
        previousRow = currentRow;
    }
    return previousRow[b.length];
}



function calculateLevenshteinDistance(a, b) {
    return levenshtein.get(a, b);
}

app.get('/suggestions', async (req, res) => {
    try {
        const prefix = req.query.prefix.toLowerCase(); 
        const trie = await loadWordList();
        const allWords = trie.findPrefix('');
        
        const suggestions = allWords
            .map(word => ({ word, distance: calculateLevenshteinDistance(prefix, word.toLowerCase()) })) 
            .filter(({distance}) => distance <= 5) 
            .sort((a, b) => a.distance - b.distance) // Sort suggestions by distance
            .map(({ word }) => word); // Extract words from objects

        res.json(suggestions);
    } catch (error) {
        console.error('Error in /suggestions endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.use(express.static(path.join(__dirname, 'public')));
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
