"use strict";

//TODO, type 'a' doesnt work (as first letter) ???

document.getElementById("input_field").addEventListener("input", AutoUpdate);

let combined_memory = {
    key: [],
    data: []
}

//#region SETUP
    
const word_pick_bias = 0.7; // E(0; 1) | it's a percentage that each word must (be equal to or) exceed | while increasing it, it decreases the list's lenght (so increases preformance) and decreases precision as well
const tag_pick_bias = 0.2;
const upper_length_threshold = 2; //2
const lower_length_threshold = 0.5;
const power_the_similarity_perWordBasis = 1.69; // Increasing this value will enlarge result, e.g. high similarity ==> even higher (max ==1); low similarity ==> even lower (min 0, of course)
const tag_multiplayer = 1.69;

//#endregion
//#region FUNCTIONS

function fake_similarity(first, candidates) {
    let pos;
    for (pos = 0; pos < first.length; pos++) {
        const candidates_ = candidates.filter((item) => first[pos] === item[pos])
        if (candidates_.length === 0) {
            if (pos === 0){
                return [undefined, undefined];
            }
            return [candidates, pos];
        }
        candidates = candidates_;
    }
    return [candidates, pos];
}

function highlight_similarity(first, candidates) {
    let [fake_sim, pos] = fake_similarity(first, candidates);
    if (fake_sim === undefined) { return undefined; }
    if (fake_sim.length === 1) { return [candidates.indexOf(fake_sim[0]), pos]; }
    

    const fake_sim_jaroWinkler = fake_sim.map((item) => stringSimilarity(first, item));
    const highest = Math.max(...fake_sim_jaroWinkler);
    
    return [candidates.indexOf(fake_sim[fake_sim_jaroWinkler.indexOf(highest)]), pos];
}

function slash_dash_deleter(word) {
    word = Array.from(word).map(function(letter) {if(letter === "-") {return " ";} return letter;}).join("")
    return word.split("/").join(" ");
}


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
    if (deleter == false) { return arr; }

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

    let input_arr = new Set(slash_dash_deleter(input).split(" "));

    input_arr.delete("A");
    input_arr.delete("AN");
    input_arr.delete("THE");
    input_arr.delete("");

    input_arr = Array.from(input_arr);
    
    for (let i = 0; i < input_arr.length; i++) { // e.g.: pig's => pigs
        input_arr[i] = input_arr[i].split("'").join("") 
    }

    const tags = input_arr.filter((item) => item[0] === "#");
    for (let i = 0; i < tags.length; i++) {
        const idx = input_arr.indexOf(tags[i])
        input_arr.splice(idx, 1);
    }

    if (input_arr == false && tags == false) { return []; }

    if ((input_arr == false) == false){

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
    
    } else {
        combined_memory.key = [];
        combined_memory.data = [];
    }

    let temp_similarity;

    if(tags.length == false){
        temp_similarity = last_but_not_least;
    } else { 
        const tags_with_similarity = tags.map((item) => perWordSearch(item, false, true));
        temp_similarity = idiom_wage_Merger(last_but_not_least, ...tags_with_similarity);
    }

    return idiom_wage_Merger(temp_similarity, combined_memory.data).sort((a, b) => b[1] - a[1]);
}

function perWordSearch(input_word, isLast_inArr_result, isItATag = false) {
    let pick_bias;
    //#region FILTERING | output: "words_filtered" | (list of all words TO BE checked with "input word")
    let words_filtered;
    if (isItATag === false) {
        pick_bias = word_pick_bias;

        words_filtered = word_idiom_connection.find( item => item[0] === input_word[0] ); //sort alphabetically
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

    }else{
        pick_bias = tag_pick_bias;
        words_filtered = tag_idiom_connection;
    }
    //#endregion

    //#region IDIOM SIMILARITY | output: "idiom_similarity" | (list of indexes of idiom with their similarity)
    let idiom_similarity = new Array();
    
    for (const word_with_data of words_filtered) {
        const similarity = stringSimilarity(input_word, word_with_data[0]);

        if (Math.pow(similarity, power_the_similarity_perWordBasis) < pick_bias)
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
    if (isItATag === true) {
        for (let i = 0; i < idiom_similarity.length; i++) {
            idiom_similarity[i][1] *= tag_multiplayer;
        }
    }

    //#endregion
    return idiom_similarity
}

function AutoUpdate() {
    if (document.getElementById('input_field').value == false) {
        combined_memory.key = [];
        combined_memory.data = [];
        display_answer();
        display_top_n();
        return;
    }

    const input = document.getElementById('input_field').value.toUpperCase();

    const result = search(input);

    display_top_n(10, input, result);
    display_answer(input, result);
}

function display_top_n(n, input, search_result) {
    document.getElementById("top10").innerHTML = "";

    if (input === undefined || search_result === undefined) {
        return;
    }

    const top_n = searchResultTopN(n, input, search_result);

    document.getElementById("top10").innerHTML = top_n.join("<br/>")
}

function searchResultTopN(n, input, search_result) {
    let top_n = [];
    for (let i = 0; i < Math.min(n, search_result.length); i++) {
        top_n.push(highlightTXT(input, list_of_idioms[search_result[i][0]])) 
    }
    return top_n;
}

function display_answer(input, result) {
    document.getElementById("result").innerHTML = "";

    if (input === undefined && result === undefined) {
        return;
    }
    for (const ans of result) {
        document.getElementById("result").innerHTML += Math.round(ans[1]*100)/100 + " | " + list_of_idioms[ans[0]] + " > " + ans[0] + "<br/>"; 
    }
}

function highlightTXT(input, txt) {    
    input = Array.from(new Set(input.split(" ")));
    txt = txt.split(" ");
    let highlight_pos = [];

    for (let i = 0; i < input.length; i++) {
        highlight_pos.push([-1, -1]);
    }

    for (let i = 0; i < txt.length; i++) {
        const res = highlight_similarity(txt[i], input);
        if (res === undefined) { continue; }
        if (highlight_pos[res[0]][1] < res[1]) {
            highlight_pos[res[0]] = [txt[i], res[1]];
        }
    }

    highlight_pos = Object.fromEntries(highlight_pos.filter((item) => item[0] !== -1));

    let out = [];
    for (let i = 0; i < txt.length; i++) {
        const res = highlight_pos[txt[i]];
        if (res === undefined) {
            out.push(txt[i]);
        } else {
            out.push(`<mark class="mark_same">${txt[i].substr(0, res)}</mark><mark class="mark_different">${txt[i].substr(res, txt[i].length - 1)}</mark>`)
        }
        
    }

    return out.join(" ");
}


// PERMORMANCE TESTING - script
//
//let startTime = performance.now()
//let endTime = performance.now()
//console.log(`${endTime - startTime} milliseconds`)
