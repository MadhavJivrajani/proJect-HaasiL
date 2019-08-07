var questions = new Map([
    [[1,"4 + 7 = "],[["11", "2", "10", "12"],"math",["add","easy"]]],
    [[2,"2 x 3 = "],[["6","5","2","10"],"math",["mul"]]],
    [[3,"A for "  ],[["Apple","Ball","Cat","Goat"],"eng",["alpha"]]],
    [[4,"11 + 4 = "],[["15", "13", "14", "10"],"math",["add"]]],
    [[5,"6 / 2 = "],[["3","4","5","1"],"math",["div"]]],
    [[6,"2 + 4 = "],[["6", "3", "8", "10"],"math",["add"]]]
]);

// fetch('/hello')
//     .then(function (response) {
//         return response.text();
//     }).then(function (text) {
//         console.log('GET response text:');
//         console.log(text); // Print the greeting as text
//     });

// Send the same request
fetch('/hello')
    .then(function (response) {
        return response.json(); // But parse it as JSON this time
    })
    .then(function (json) {
        console.log('GET response as JSON:');
        //console.log(Object.values(json)); // Here’s our JSON object
        var ques = new Map();
        var i=0;
        keys = Object.keys(json)
        values = Object.values(json)
        while(i<Object.keys(json).length){
            key_init = keys[i].split(",");
            key_init[0] = Number(key_init[0]);
            ques.set(key_init,values[i]);
            i+=1;
        }    
                    
        console.log(ques)
    })

