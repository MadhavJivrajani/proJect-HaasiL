let options = [];
let correct = [];
let questions = []; 
let quiz_set = {}; 
let all_docs = [];
let responses = [];
let students = [];
let timestamps = []; 
let timestamp = new Date();
let name = "";
let index = -1;
const student_ref = real_db.ref("students");
const auth = firebase.auth();
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    while (0 !== currentIndex) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}

$("#container").hide();
$("#timestamp_list").hide();
$("#subs").hide();

function get_latest_quiz(timestamp) {
    let max_index = 0;
    for(let i=1;i<timestamp.length;i++) {
        if(timestamp[i-1].toMillis()<timestamp[i].toMillis()) {
            max_index = i;
        }
    }
    return Object.values(all_docs[max_index].quiz);
}

function get_quiz(index) {
    return Object.values(all_docs[index].quiz);
}

student_ref.on('value', data => {
    console.log(data.val());
    students = Object.keys(data.val());
    console.log(students);

    console.log(students);
    $('#student_list').append($("<option>", {
        value: -1,
    }).text("Student name"));

    for(let i=0;i<students.length;i++) {
        console.log("in loop");
        let opt = $("<option>", {
            value: i,
        }).text(students[i]);
        $('#student_list').append(opt);
    }

    $('#student_list').prop('selectedIndex',0);
    $('#timestamp_list').prop('selectedIndex',0);
    $('#subs_list').prop('selectedIndex',0);

    $("#student_list").on("change" ,function(){
        $("#students").hide();
        $("#subs").show();
        name = $(this).find(':selected').text();
        console.log(name);
        let subject = "";
        $("#subs_list").on("change", function() {
            $("#subs").hide();
            subject = $(this).find(":selected").text().toLowerCase();
            let student_timestamps = [];
            console.log(subject);
            db.collection(subject).where("name","==",name).get().then(snap => {
                snap.docs.forEach(doc => {
                    student_timestamps.push(doc.data().timestamp);
                });
                console.log("Student time",student_timestamps);
                db.collection('subjects').where("subject","==",subject).get().then(snapshot => {
                    timestamps = [];
                    //timestamps_date = [];
                    snapshot.docs.forEach(doc => {
                        if(!student_timestamps.some(time => time.seconds == doc.data().timestamp.seconds)) {
                            timestamps.push(doc.data().timestamp);
                            all_docs.push(doc.data());
                        }

                    });
                    /*TIMESTAMP DROP DOWN 
                        HERE
                    */
                    $("#subs").hide();
                    $("#timestamp_list").show();
                    $("#timestamp_list").text("");
                    console.log("Timestamps",timestamps);
                    $('#timestamp_list').append($("<option>", {
                        value: -1,
                        }).text("Timestamps of not attempted quizes"));

                        for(let i=0;i<timestamps.length;i++) {
                            console.log("in loop time");
                            let opt = $("<option>", {
                                value: i,
                            }).text(timestamps[i].toDate().toString());
                            $('#timestamp_list').append(opt);
                        }
                        $("#timestamp_list").on("change", function() {
                            index = $(this).find(':selected').val();
                            timestamp = new Date($(this).find(':selected').text());
                            console.log(index);
                            $("#timestamp_list").hide();
                            let quiz = get_quiz(index);
                            console.log(quiz);
                            questions = [];
                            for(let i=0;i<Object.keys(quiz).length;i++) {
                                let temp_opts = [];
                                correct.push(quiz[i].correct_response);
                                temp_opts = shuffle(quiz[i].options);
                                console.log(temp_opts);
                                options.push(temp_opts);
                                questions.push({question: quiz[i].question, choices: temp_opts, correctAnswer: quiz[i].correct_response});
                            }

                            /*Display quiz*/ 
                            (function() {
                                $("#container").show();
                                $("#back").hide();
                                var questionCounter = 0;
                                var selections = []; //Array containing user choices
                                var quiz = $('#quiz'); //Quiz div object
                                
                                // Display initial question
                                displayNext();
                                
                                // Click handler for the 'next' button
                                $('#next').on('click', e => {
                                    e.preventDefault();
                                    
                                    // Suspend click listener during fade animation
                                    if(quiz.is(':animated')) {        
                                    return false;
                                    }
                                    choose();
                                    
                                    // If no user selection, progress is stopped
                                    if (isNaN(selections[questionCounter])) {
                                        alert('Please make a selection!');
                                    } else {
                                        questionCounter++;
                                        displayNext();
                                    }
                                });

                                $('#start').on('click', e => {
                                    e.preventDefault();
                                    
                                    if(quiz.is(':animated')) {
                                    return false;
                                    }
                                    questionCounter = 0;
                                    selections = [];
                                    //displayNext();
                                    $('#start').hide();
                                });
                                
                                // Click handler for the 'prev' button
                                $('#prev').on('click', e => {
                                    e.preventDefault();
                                    
                                    if(quiz.is(':animated')) {
                                        return false;
                                    }
                                    choose();
                                    questionCounter--;
                                    displayNext();
                                });
                                
                                // Animates buttons on hover
                                $('.button').on('mouseenter', function () {
                                    $(this).addClass('active');
                                });
                                $('.button').on('mouseleave', function () {
                                    $(this).removeClass('active');
                                });
                                
                                // Creates and returns the div that contains the questions and 
                                // the answer selections
                                function createQuestionElement(index) {
                                    var qElement = $('<div>', {
                                        id: 'question'
                                    });
                                    
                                    var header = $('<h2>Question ' + (index + 1) + ':</h2>');
                                    qElement.append(header);
                                    
                                    var question = $('<p>').append(questions[index].question);
                                    qElement.append(question);
                                    
                                    var radioButtons = createRadios(index);
                                    qElement.append(radioButtons);
                                    
                                    return qElement;
                                }
                                
                                // Creates a list of the answer choices as radio inputs
                                function createRadios(index) {
                                    var radioList = $('<ul>');
                                    var item;
                                    var input = '';
                                    for (var i = 0; i < questions[index].choices.length; i++) {
                                        item = $('<li>');
                                        input = '<input type="radio" name="answer" value=' + i + ' />';
                                        input += questions[index].choices[i];
                                        item.append(input);
                                        radioList.append(item);
                                    }
                                    return radioList;
                                }
                                
                                // Reads the user selection and pushes the value to an array
                                function choose() {
                                    selections[questionCounter] = +$('input[name="answer"]:checked').val();
                                }
                                
                                // Displays next requested element
                                function displayNext() {
                                    quiz.fadeOut(function() {
                                        $('#question').remove();
                                        
                                        if(questionCounter < questions.length){
                                            var nextQuestion = createQuestionElement(questionCounter);
                                            $("#start").hide();
                                            quiz.append(nextQuestion).fadeIn();
                                            if (!(isNaN(selections[questionCounter]))) {
                                                $('input[value='+selections[questionCounter]+']').prop('checked', true);
                                            }
                                            
                                            // Controls display of 'prev' button
                                            if(questionCounter === 1){
                                                $('#prev').show();
                                            } else if(questionCounter === 0){
                                                $('#prev').hide();
                                                $('#next').show();
                                            }
                                        }else {
                                            var scoreElem = displayScore();
                                            quiz.append(scoreElem).fadeIn();
                                            $('#next').hide();
                                            $('#prev').hide();
                                            $('#start').show();
                                        }
                                    });
                                }
                                $('#start').on('click', e => {
                                    e.preventDefault();
                                    if(name!="") {
                                        db.collection(subject).add({
                                            name: name,
                                            responses: responses,
                                            //timestamp: timestamps[index]
                                            timestamp: timestamp
                                        });
                                    }
                                    $("#container").hide();
                                    $("#back").show();
                                    $('#student_list').prop('selectedIndex',0);
                                    $('#timestamp_list').prop('selectedIndex',0);
                                    $('#subs_list').prop('selectedIndex',0);
                                    $("#students").show();
                                    questionCounter = 0;
                                    options = [];
                                    correct = [];
                                    questions = []; 
                                    timestamps = []; 
                                    responses = [];
                                    selections = [];
                                    all_docs = []; 
                                    student_timestamps = [];  
                                    $("#timestamp_list").text("");                 
                                    if(quiz.is(':animated')) {
                                        return false;
                                    }
                                    $('#start').hide();
                                    name = "";
                                });
                                
                                // Computes score and returns a paragraph element to be displayed
                                function displayScore() {
                                    console.log(selections);

                                    var score = $('<p>',{id: 'question'});
                                    
                                    var numCorrect = 0;
                                    for (var i = 0; i < selections.length; i++) {
                                        responses.push(questions[i].choices[selections[i]]);
                                        if (questions[i].choices[selections[i]] === questions[i].correctAnswer) {
                                            numCorrect++;
                                        }
                                    }
                                    
                                    score.append('You got ' + numCorrect + ' questions out of ' +
                                                questions.length + ' right!');
                                    return score;
                                }
                            })();
                        });
                    });
                }); 
            });
        });
    }, err => {
        console.log(err);
});

firebase.auth().onAuthStateChanged(firebaseUser => {
    if(!firebaseUser) {
        let email = localStorage.getItem("email");
        console.log(email);
        let pass = window.localStorage.getItem("password");
        auth.signInWithEmailAndPassword(email, pass)
        .then(cred => {

        })
        .catch(e => {
            console.log(e.message);
        });
    }
    else {
        console.log("Logged in");
    }
});

/* 
TODO: 
    -> Put response data back into firestore [DONE] 
    -> Generate questions and put it in firestore [DONE]
    -> Display quiz [DONE]
    -> Change config settings to make firestore access secure [DONE]
    -> Shuffle option order [DONE]

    -> Use timestamps as quiz IDs and choose from different quizes [DONE] 
*/
