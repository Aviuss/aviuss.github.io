"use strict";

const all_words = Array.from(new Set(list_of_idioms.join(" ").split(" ")));

// 1 ## TODO w "(RIGHT)" usunąć nawiasy
// niektóre słowa mają na końcu np. -s


function seperateListByLength(arr){
    const lengths = Array.from(new Set(arr.map(item => item[0].length))).sort((a,b) => a - b);
    
    let arr_result = new Array(lengths.length);
    for (let i = 0; i < lengths.length; i++) {
        arr_result[i] = [lengths[i], new Array()];
    }
    
    for (let i = 0; i < arr.length; i++) {
        const index = lengths.indexOf(arr[i][0].length);
        arr_result[index][1].push(arr[i]);
    }

    return arr_result;
    /*HOW DOES IT WORK?
    INPUT:  [["qwe", someData], ["wer", someData], ["qw", someData], ["we", someData]];

    OUTPUT: [
                [2,
                    [ ["qw", someData],
                      ["we", someData] ]
                ],

                [3,
                    [ ["qwe", someData],
                      ["wer", someData] ]
                ]
            ]
    */
}

function seperateListAlphabetically(arr){
    const first_signs = Array.from(new Set(arr.map(item => item[0]))).sort();            

    let arr_result = new Array(first_signs.length);
    for (let i = 0; i < first_signs.length; i++) {
        arr_result[i] = [first_signs[i], new Array()];
    }

    for (let i = 0; i < arr.length; i++) {
        const index = first_signs.indexOf(arr[i][0]);
        arr_result[index][1].push(arr[i]);
    }

    return arr_result;
    /*HOW DOES IT WORK?
    INPUT:  ["qwe", "qw", "ananas"];

    OUTPUT: [
                [a,
                    [ ananas ]
                ],

                [q,
                    [ "qwe", "qw" ]
                ]
            ]
    */
}

function word_idiom_connection(word){ // this function does include "a", "an", "the", etc. BAD
    let result = [];

    for (let i = 0; i < list_of_idioms.length; i++) {
        if (new Set(list_of_idioms[i].split(" ")).has(word)){
            result.push(i)
        };
    }    

    return result.sort();
};

function all_words_alphabetically_length_func(){
    let result_arr = seperateListAlphabetically(all_words);
    
    for (let i = 0; i < result_arr.length; i++) { // append data to words
        let words = result_arr[i][1];
        for (let j = 0; j < words.length; j++) {
            words[j] = [words[j], word_idiom_connection(words[j])]
        }   
    }

    for (let i = 0; i < result_arr.length; i++) { // sort words by length
        result_arr[i][1] = seperateListByLength(result_arr[i][1]);
    }

    
    return result_arr;
}

const all_words_alphabetically_length = all_words_alphabetically_length_func();


// MEMORY

function maxNumberOfElementsInMemory_func() {
    const maxMemorySize = 1024; // bytes

    function averageSizePerElement_func(){
        let all = [];
        for (const e of all_words_alphabetically_length) {
            for (const elem of e[1]) {
                all.push(...elem[1]);
            }
        }
        let totalsize = 0;
        for (const elem of all) {
            totalsize += elem[0].length * 2 + elem[1].length * 2;
        }
        
        return totalsize/all.length // bytes
    }

    return Math.round(maxMemorySize / averageSizePerElement_func());

    //#region HOW DOES IT WORK?
    /*
    
    It returns max number of elements to 'word_memory' variable.
    First you have to define max memory size (in bytes).
    Then it calculates on average how much space does the element takes.
    And voila!
    
    */
    //#endregion
}