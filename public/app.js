(function() {
    const firebaseConfig = {
        apiKey: "AIzaSyDcSNfHV-wvi_kC942alDLDAJMZcBvki-4",
        authDomain: "haasil-7e3f3.firebaseapp.com",
        databaseURL: "https://haasil-7e3f3.firebaseio.com",
        projectId: "haasil-7e3f3",
        storageBucket: "haasil-7e3f3.appspot.com",
        messagingSenderId: "221496357927",
        appId: "1:221496357927:web:6b6c8f2b76ed0b47644a02",
        measurementId: "G-1L95T5KCGB"
    };

    firebase.initializeApp(firebaseConfig);
    if(!firebase.auth().currentUser) {
        firebase.auth().signOut();
    }
    const emailElem = document.getElementById("email");
    const passElem = document.getElementById("pass");
    const logInBtn = document.getElementById("login");
    const signUpBtn = document.getElementById("signup");
    const logOutBtn = document.getElementById("logout");
    const formElem = document.getElementById("form");
    const nameElem = document.getElementById("name");
    
    logInBtn.addEventListener("click", e => {
        e.preventDefault();
        const email = emailElem.value;
        const pass = passElem.value;
        const auth = firebase.auth();
        localStorage.setItem("email", email);
        localStorage.setItem("password", pass);
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
            // welElem.innerHTML = name;
            $("#welcome").append($("<a>", {
                href: "dashboard.html"
            }).append($("<button id='dash'>Dashboard</button>")));
            localStorage.setItem("email", email);
            localStorage.setItem("password", pass);
            formElem.reset();        
        } else {
            alert("Password must be atleast 6 characters long");
        }
    });

    firebase.auth().onAuthStateChanged(firebaseUser => {
        window.user = firebaseUser;
        if(firebaseUser){
            console.log("logged in");
            $('#form').hide();
            $('#buttons').hide();
            const uid = firebase.auth().currentUser.uid;
            $("#logout").show();
            $('#welcome').show();
            const ref = firebase.database().ref("users");
            
            ref.on('value', data => {
                // welElem.innerHTML = data.val()[uid]["name"];
                $("#welcome").append($("<a>", {
                    href: "dashboard.html"
                }).append($("<button id='dash'>Dashboard</button>")));
    

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