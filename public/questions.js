let questions = [];
let options = [];
let correct = [];
let tags = [];
const auth = firebase.auth();

$("#submit_info").on("click", e => {
    e.preventDefault();
    let no_of_questions = document.getElementById("no_of_questions").value;
    let timestamp = new Date(document.getElementById("date").value);
    let name = document.getElementById("name").value;

    let subject = $("#sub").find(":selected").text().toLowerCase();
    console.log(subject);
    $("#bg").hide();
    $("#greet").hide();
    for(let i=0;i<Number(no_of_questions);i++) {
        $("#get_ques").append($("<label>"+String(i+1)+"</label>")).append($("<input>", {
            placeholder: "Please enter the question",
            name: "question",
            type: "text",
            required:""
        }));
    
        $("#get_ques").append($("<input>", {
            placeholder: "Comma seperated options",
            name: "options",
            type: "text",
            required:""
        }));
    
        $("#get_ques").append($("<input>", {
            placeholder: "Correct answer",
            name: "correct",
            type: "text",
            required:""
        }));
        
        $("#get_ques").append($("<input>", {
            placeholder: "Comma seperated tags",
            name: "tags",
            type: "text",
            required:""
        }));
    
        $("#get_ques").append($("<br>"));

        $("#get_ques").append($("<hr>"))

    }

    $("#get_ques").append($("<center>").append($("<input>", {
        type: "submit",
        value: "submit",
        id: "submit"
    })));

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
    
        let quiz = {};
        let main_obj = {};
        let counter = 1;
        for(let i =0;i<questions.length;i++) {
            quiz["question"+counter] = {
                correct_response: correct[i],
                options: options[i].split(","),
                question: questions[i],
                tags: tags[i].split(",")
            }
            counter++;
        }
        console.log("QUESTIONS", questions);
        console.log("QUIZ", quiz);
        console.log("CORRECT", correct);
        console.log("TAGS", tags);
        main_obj["quiz"] = quiz;
        main_obj["subject"] = subject;
        main_obj["timestamp"] = timestamp;
        main_obj["volunteer_name"] = name;
        db.collection("subjects").add(main_obj); 

        $("#enter_ques").hide();
        $("#back_to_dashboard").append($("<a>", {href: "dashboard.html"}).append($("<p>Back to dashboard</p>")));

    });
});

firebase.auth().onAuthStateChanged(firebaseUser => {
    if(!firebaseUser) {
        let email = window.localStorage.getItem("email");
        let pass = window.localStorage.getItem("password");
        auth.signInWithEmailAndPassword(email, pass)
        .then(cred => {

        })
        .catch(e => {
            console.log(e.message)
        });
    }
    else {
        console.log("Logged in");
    }
});