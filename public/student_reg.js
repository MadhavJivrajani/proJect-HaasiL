const name_field = document.getElementById("name");
const grade_field = document.getElementById("grade");
const auth = firebase.auth();

$("#submit").on("click", e => {
    // e.preventDefault();
    const ref = db.ref("students");
    let name = name_field.value;
    let grade = grade_field.value;
    let info = {};
    
    if(!name || !grade) {
        alert("Please fill the required fields");
    }
    else {
        info["/"+name+"/grade"] = grade;
        db.ref("students").update(info);
    }


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