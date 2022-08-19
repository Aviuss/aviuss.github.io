"use strict";

let all_words = Array.from(new Set(list_of_idioms.join(" ").split(" ")));

// 1 ## TODO w "(RIGHT)" usunąć nawiasy
// niektóre słowa mają na końcu np. -s


function words_in_alphabetical_order(){
    let result = new Array(alphabet.length);
    for (let i = 0; i < result.length; i++){
        result[i] = new Array();
    };

    for (const word of all_words) {
        if (word[0] === "(") // temporary quick fix
            continue
        result[ alphabet.indexOf(word[0]) ].push([word, connections_from_words_to_idioms(word)]);
    };

    return result;
};

function connections_from_words_to_idioms(word){
    let result = [];

    for (let i = 0; i < list_of_idioms.length; i++) {
        if (new Set(list_of_idioms[i].split(" ")).has(word)){
            result.push(i)
        };
    }    

    return result.sort();
};

let all_words_alphabetical = words_in_alphabetical_order();

