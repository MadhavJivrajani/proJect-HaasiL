let options = [];
let correct = [];
let questions = []; 
let quiz_set = {}; 
let timestamps = []; 
let all_docs = [];
let responses = [];
let students = [];
let name = "";

$("#container").hide();
function get_latest_quiz(timestamp) {
    let max_index = 0;
    for(let i=1;i<timestamp.length;i++) {
        if(timestamp[i-1].toMillis()<timestamp[i].toMillis()) {
            max_index = i;
        }
    }
    return Object.values(all_docs[max_index].quiz);
}

db.collection('students').get().then(list => {
    $('#container').hide();
    list.docs.forEach(doc => {
        students = doc.data().students;
    });
    console.log(students);

    $('#student_list').append($("<option>", {
        value: -1,
    }).text("Student name"));

    for(let i=0;i<students.length;i++) {
        console.log("in loop");
        let opt = $("<option>", {
            value: i,
        }).text(students[i]);
        //opt.innerHTML = students[i];
        $('#student_list').append(opt);
    }

    $("#student_list").on("change" ,function(){
        $("#students").hide();
        $('#container').show();
        name = $(this).find(':selected').text();
        db.collection('subjects').where("subject","==","math").get().then(snapshot => {
            snapshot.docs.forEach(doc => {
                timestamps.push(doc.data().timestamp);
                all_docs.push(doc.data());
            });

            let quiz = get_latest_quiz(timestamps);
            console.log(quiz);
            for(let i=0;i<Object.keys(quiz).length;i++) {
                options.push(quiz[i].options);
                correct.push(quiz[i].correct_response);
                questions.push({question: quiz[i].question, choices: quiz[i].options, correctAnswer: quiz[i].correct_response});
            }

            /*Display quiz*/ 
            (function() {
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
                    //$('input[type="radio"]').prop('checked', false);
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
                    db.collection("math").add({
                        name: name,
                        responses: responses,
                        timestamp: new Date()
                    });
                    $("#container").hide();
                    $('#student_list').prop('selectedIndex',0);
                    $("#students").show();
                    questionCounter = 0;
                    options = [];
                    correct = [];
                    questions = []; 
                    timestamps = []; 
                    responses = [];
                    selections = [];
                    all_docs = [];                    
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

/* 
TODO: 
    -> Put response data back into firestore [DONE] 
    -> Generate questions and put it in firestore 
    -> Display quiz [DONE]
    -> Change config settings to make firestore access secure
    -> Shuffle option order

    -> Put quiz IDs for each quiz, after selecting student name and before displaying quiz, dropdown of quiz IDs to choose from. 
    -> store result back with quiz id of quiz for each student. 
*/
