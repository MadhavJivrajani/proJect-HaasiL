(function() {
    const firebaseConfig = {
        apiKey: "",
        authDomain: "",
        databaseURL: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: "",
        measurementId: ""
    };

    firebase.initializeApp(firebaseConfig);

    const emailElem = document.getElementById("email");
    const passElem = document.getElementById("pass");
    const logInBtn = document.getElementById("login");
    const signUpBtn = document.getElementById("signup");
    const logOutBtn = document.getElementById("logout");
    const formElem = document.getElementById("form");
    const nameElem = document.getElementById("name");
    const welElem = document.getElementById("welcome");
    
    logInBtn.addEventListener("click", e => {
        e.preventDefault();
        const email = emailElem.value;
        const pass = passElem.value;
        const auth = firebase.auth();
        auth.signInWithEmailAndPassword(email, pass)
        .then(cred => {
            formElem.reset();
        })
        .catch(e => {
            console.log(e.message)
        });

    });

    signUpBtn.addEventListener("click", e => {
        //TODO check for actual emails
        e.preventDefault();
        const email = emailElem.value;
        const pass = passElem.value;
        const name = nameElem.value;
        if(pass.length>=6){
            const auth = firebase.auth();
        
            auth.createUserWithEmailAndPassword(email, pass).then(cred => {
                console.log(cred.user);
                const info = {};
                info["/"+cred.user.uid+"/email"] = email;
                info["/"+cred.user.uid+"/name"] = name;
                firebase.database().ref("users").update(info);
            });
            welElem.innerHTML = name;

            formElem.reset();        
        } else {
            alert("Password must be atleast 6 characters long");
        }
    });

    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
            console.log("logged in");
            $('#form').hide();
            $('#buttons').hide();
            const uid = firebase.auth().currentUser.uid;
            $("#logout").show();
            $('#welcome').show();
            const ref = firebase.database().ref("users");
            
            ref.on('value', data => {
                welElem.innerHTML = data.val()[uid]["name"];

            }, err => {
                console.log(err);
            });
        } else {
            console.log("not logged in");
            $('#form').show();
            $('#buttons').show();
            $('#logout').hide();
            $('#welcome').hide();
        }
    });

    logOutBtn.addEventListener("click", e => {
        e.preventDefault();
        firebase.auth().signOut();
        formElem.reset();
    });

}());
