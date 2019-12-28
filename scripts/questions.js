let questions = [];
let options = [];
let subject = "";
let correct = [];
let tags = [];
let no_of_questions = "";
let timestamp = "";

$("#submit_info").on("click", e => {
    e.preventDefault();
    no_of_questions = document.getElementById("no_of_questions").value;
    timestamp = document.getElementById("timestamp").value;
    console.log(timestamp);
    subject = document.getElementById("sub").value
    $("#bg").hide();
    for(let i=0;i<Number(no_of_questions);i++) {
        $("#get_ques").append($("<input>", {
            placeholder: "Please enter the question",
            name: "question",
            type: "text"
        }));
    
        $("#get_ques").append($("<input>", {
            placeholder: "Comma seperated options",
            name: "options",
            type: "text"
        }));
    
        $("#get_ques").append($("<input>", {
            placeholder: "Correct answer",
            name: "correct",
            type: "text"
        }));
        
        $("#get_ques").append($("<input>", {
            placeholder: "Comma seperated tags",
            name: "tags",
            type: "text"
        }));
    
        $("#get_ques").append($("<br><br>"))
    }

    $("#get_ques").append($("<input>", {
        type: "submit",
        value: "submit",
        id: "submit"
    }));

    $("#submit").on("click", e => {
        e.preventDefault();
        
        questions = $('input[name="question"]').map(function () {
            return this.value;
        }).get();
    
        options = $('input[name="options"]').map(function () {
            return this.value;
        }).get();
    
        correct = $('input[name="correct"]').map(function () {
            return this.value;
        }).get();
    
        tags = $('input[name="tags"]').map(function () {
            return this.value;
        }).get();
    
        console.log(questions);
        console.log(options);
        console.log(correct);
        console.log(tags);
    });
});