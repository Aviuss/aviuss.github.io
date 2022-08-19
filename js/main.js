"use strict";

//TODO: pig's = pigs

let combined_memory = {
    key: [],
    data: []
}

//#region SETUP
    
const word_pick_bias = 0.7; // E(0; 1) | it's a percentage that each word must (be equal to or) exceed | while increasing it, it decreases the list's lenght (so increases preformance) and decreases precision as well
const upper_length_threshold = 2;
const lower_length_threshold = 0.5;

//#endregion
//#region FUNCTIONS

function create_list_of_all_words(words_filtered){
    let _ = [];
    for (const elem of words_filtered) {
        for (const iterator of elem[1]) {
            _.push(iterator);
        } 
    }
    return _;
}

function idiom_wage_Merger(starter_Arr, arr) {
    let result = starter_Arr;
    for (let i = 0; i < arr.length; i++) {
        let same_index = result.findIndex(item => item[0] === arr[i][0]);
        if (same_index === -1) {
            result.push(arr[i]);
        } else {
            result[same_index][1] += arr[i][1];
        }
    }
    return result; 
    //example input
    //let x = [ [1, 1], [2, 1] ];
    //let y = [ [1, 1], [3, 1] ];
    //   out: [ [1, 2], [2, 1], [3, 1] ]
}

function idiom_wage_Deleter(arr, deleter) {
    if (deleter === []) { return arr; }
    
    for (const elem of deleter) {
        const same_index = arr.findIndex(item => item[0] === elem[0]);
        arr[same_index][1] -= elem[1]
    }
    return arr.filter(item => item[1] !== 0);
    //example input
    //let x = [ [1, 1], [2, 1], [3, 1] ];
    //let y = [ [1, 1], [3, 1] ];
    //   out: [ [2, 1] ]
}

function clone_array(arr) {
    let _ = [];
    for (const elem of arr) {
        _.push([...elem]);
    }
    return _;
}

function whatToCalculate(x, y) { // output: [to_add, to_delete, new? (false - old, true - create new)]
    let same_counter = 0;
    let not_included = [];

    for (const elem of y) {
        if (x.includes(elem)) {same_counter++;} else {not_included.push(elem)}
    }

    let to_delete_num = x.length - same_counter;
    const isItWorth = y.length - not_included.length - to_delete_num;

    
    if (isItWorth <= 0)
        return [y, [], true];
    
    let to_delete = [];
    if (to_delete_num > 0){
        for (const elem of x) {
            if (y.includes(elem) === false){
                to_delete.push(elem);
                to_delete_num--;
                if (to_delete_num === 0){
                    break;
                }
            }
        }
    }
    
    return [not_included, to_delete, false];
}

//#endregion

function search(input){
    let add_arr = [];
    let delete_arr = [];
    let last_but_not_least = [];

    let input_arr = new Set(input.split(" "));

    input_arr.delete("A");
    input_arr.delete("AN");
    input_arr.delete("THE");
    input_arr.delete("");

    input_arr = Array.from(input_arr);

    last_but_not_least.push(...perWordSearch(input_arr[input_arr.length - 1], true));
    input_arr = input_arr.slice(0,input_arr.length-1)


    const Add_Delete_New = whatToCalculate(combined_memory.key, input_arr);
    if (Add_Delete_New[2]) {
        combined_memory.data = [];
    }

    for (const add_word of Add_Delete_New[1]) {        

        let idiom_similarity = perWordSearch(add_word, false);
        
        if (idiom_similarity === [])
            continue;
        

        delete_arr.push(...idiom_similarity);
    }
    
    for (const add_word of Add_Delete_New[0]) {        

        let idiom_similarity = perWordSearch(add_word, false);

        if (idiom_similarity === [])
            continue;

        
        add_arr.push(...idiom_similarity);
    }
    
    combined_memory.key = input_arr;
    combined_memory.data = idiom_wage_Deleter(combined_memory.data, delete_arr);
    combined_memory.data = idiom_wage_Merger(combined_memory.data, add_arr);
    

    return idiom_wage_Merger(last_but_not_least, combined_memory.data).sort((a, b) => b[1] - a[1]);
}

function perWordSearch(input_word, isLast_inArr_result) {
    //#region FILTERING | output: "words_filtered" | (list of all words TO BE checked with "input word")

    let words_filtered = all_words_alphabetically_length.find( item => item[0] === input_word[0] ); //sort alphabetically
    if (words_filtered === undefined) {
        return [];
    }
    words_filtered = words_filtered[1];

    if (isLast_inArr_result) {
        words_filtered = words_filtered.filter( item => input_word.length * lower_length_threshold <= item[0]);
    } else {
        words_filtered = words_filtered.filter( item => ((input_word.length * lower_length_threshold <= item[0]) && (item[0] <= input_word.length * upper_length_threshold)) );
    } // sort by length (including tresholds)

    words_filtered = create_list_of_all_words(words_filtered); // final sorting

    //#endregion

    //#region IDIOM SIMILARITY | output: "idiom_similarity" | (list of indexes of idiom with their similarity)
    let idiom_similarity = new Array();
    
    for (const word_with_data of words_filtered) {
        const similarity = stringSimilarity(input_word, word_with_data[0]);

        if (similarity < word_pick_bias)
            continue
        
        for (const idiom_index of word_with_data[1]) {
            let same_index = idiom_similarity.findIndex(item => item[0] == idiom_index);
            if (same_index == -1){
                idiom_similarity.push([idiom_index, similarity]);
            } else {
                idiom_similarity[same_index][1] += similarity;
            }
        }
    }
    //#endregion
    return idiom_similarity
}


function AutoUpdate() {
    if (document.getElementById('input_field').value === "") {
        combined_memory.key = [];
        combined_memory.data = [];
        display_answer();
        return;
    }
    
    let startTime = performance.now()
    const input = document.getElementById('input_field').value.toUpperCase();

    let updated = search(input);

    let endTime1 = performance.now()
    display_answer(input, updated);
    let endTime2 = performance.now()

    console.log(`${endTime1 - startTime} `);
}


function display_answer(input, answer) {
    document.getElementById("answer").innerHTML = "";

    if (input === undefined && answer === undefined) {
        return;
    }
    let n = 0;
    for (const ans of answer) {
        n++;
        if (n<11){
            document.getElementById("answer").innerHTML += Math.round(ans[1]*100)/100 + " | " + highlightTXT(input, list_of_idioms[ans[0]]) + " > " + ans[0] + "<br/>"; 
        }
        else{
            document.getElementById("answer").innerHTML += Math.round(ans[1]*100)/100 + " | " + list_of_idioms[ans[0]] + " > " + ans[0] + "<br/>"; 

        }

    }
}


function highlightTXT(input, txt) {
    return txt;
    input = input.split(" ")
    txt = txt.split(" ")
    
    let out = "";
    let taken = new Set();

    for (const elem of txt) {
        let similarity = [];
        for (let i = 0; i < input.length; i++) {
            similarity.push(stringSimilarity(elem, input[i]));
        }

        let max_similarity = Math.max(...similarity);

        if (max_similarity === 1) {
            out += `<mark class="mark_same">${elem}</mark> `;
            let index = similarity.indexOf(max_similarity);
            taken.add(index);
        } else if (max_similarity === 0){
            out += `${elem} `;
        } else {
            let index = similarity.indexOf(max_similarity);

            if (taken.has(index)){
                out += `${elem} `;
            } else {
                let range = 0;
                let i = 0;
                while (input[index][i] === elem[i]) {
                    i++;
                    range++;
                }
                if (range === 0) {
                    out += `${elem} `;    
                }
                else{
                    out += `<mark class="mark_same">${elem.substr(0, range)}</mark><mark class="mark_different">${elem.substr(range, elem.length - 1)}</mark> `;
                }
            }
        }
    }

    return out; 
}




// PERMORMANCE TESTING - script
//
//let startTime = performance.now()
//let endTime = performance.now()
//console.log(`Call took ${endTime - startTime} milliseconds`)
