questions = new Map();
fetch('/hello')
  .then(function (response) {
      return response.json(); // But parse it as JSON this time
  })
  .then(function (json) {
      console.log('GET response as JSON:');
      console.log(Object.values(json)); // Here’s our JSON object
      //window.questions = new Map();
      var i=0;
      var correct = [];
      keys = Object.keys(json);
      values = Object.values(json);
      function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        return array;
      }
      
      while(i<Object.keys(json).length){
          key_init = keys[i].split(",");
          key_init[0] = Number(key_init[0]);
          correct.push(values[i][0][0]);
          values[i][0] = shuffle(values[i][0])
          window.questions.set(key_init,values[i]);
          i+=1;
      }

      var questionLength = [...questions.keys()].length;

      var questionCounter = 0; //Tracks question number
      var selections = []; //Array containing user choices
      var quiz = $('#quiz'); //Quiz div object
    
      // Display initial question
      displayNext();
    
      // Click handler for the 'next' button
      $('#next').on('click', function (e) {
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
    
      // Click handler for the 'prev' button
      $('#prev').on('click', function (e) {
      e.preventDefault();
    
      if(quiz.is(':animated')) {
        return false;
      }
      choose();
      questionCounter--;
      displayNext();
      });
    
      // Click handler for the 'Start Over' button
      $('#start').on('click', function (e) {
      e.preventDefault();
    
      if(quiz.is(':animated')) {
        return false;
      }
      questionCounter = 0;
      selections = [];
      displayNext();
      $('#start').hide();
      });
    
      // Animates buttons on hover
      $('.button').on('mouseenter', function () {
      $(this).addClass('active');
      });
      $('.button').on('mouseleave', function () {
      $(this).removeClass('active');
      });
    
      function getKey(index) {
      for(var i in [...questions.keys()]){
        //console.log(key)
        if([...questions.keys()][i][0]==index){
          return [...questions.keys()][i];
        }
      }
      }
    
      // Creates and returns the div that contains the questions and 
      // the answer selections
      function createQuestionElement(index) {
        var qElement = $('<div>', {
          id: 'question'
        });
        var key = getKey(index+1);
        var header = $('<h2>Question ' + (index + 1) + ':</h2>');
        qElement.append(header);
        var question = $('<p>').append(key[1]);
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
        var key = getKey(index+1);
        for (var i = 0; i < questions.get(key)[0].length; i++) {
          item = $('<li>');
          input = '<br><input type="radio" name="answer" id="options" value=' + i + ' />';
          input += questions.get(key)[0][i];
          item.append(input);
          radioList.append(item);
        }
        return radioList;
      }
    
      // Reads the user selection and pushes the value to an array
      function choose() {
      console.log(+$('input[name="answer"]:checked').val())
      // console.log(Number(questions.get(getKey(1))[0][selections[0]]))
      selections[questionCounter] = $('input[type=radio][name="answer"]:checked').val();
      }
    
      // Displays next requested element
      function displayNext() {
      quiz.fadeOut(function() {
        $('#question').remove();
        
        if(questionCounter < questionLength){
          var nextQuestion = createQuestionElement(questionCounter);
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
    
      // Computes score and returns a paragraph element to be displayed
      function displayScore() {
      var score = $('<p>',{id: 'question'});
      //console.log(selections.length)
      var responses = {};
      var numCorrect = 0;
      for (var i = 0; i < selections.length; i++) {
        // console.log(selections[i])
        var key = getKey(i+1);
        console.log(String(questions.get(key)[0][Number(selections[i])]));
        responses["("+String(key[0])+","] = questions.get(key)[0][selections[i]]; 
        if (questions.get(key)[0][selections[i]] == correct[i]) {
          numCorrect++;
        }
      }
    
      score.append('You got ' + numCorrect + ' questions out of ' +
                    questionLength + ' right!!!');
          fetch('/hello', {
    
            // Specify the method
            method: 'POST',
        
            // JSON
            headers: {
                'Content-Type': 'application/json'
            },
        
            // A JSON payload
            body: JSON.stringify(responses)
        }).then(function (response) { // At this point, Flask has printed our JSON
            return response.text();
        }).then(function (text) {
        
            console.log('POST response: ');
        
            // Should be 'OK' if everything was successful
            console.log(text);
        });
      return score;
    }
  })
