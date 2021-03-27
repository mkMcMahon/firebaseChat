import React, {useRef, useState} from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

firebase.initializeApp({
    apiKey: "AIzaSyAwJhVOJJcHY5mk6iIa8Q_BGHewACXPEcc",
    authDomain: "fir-chat002.firebaseapp.com",
    projectId: "fir-chat002",
    storageBucket: "fir-chat002.appspot.com",
    messagingSenderId: "234712267706",
    appId: "1:234712267706:web:250261b36ed36e789c3b83",
    measurementId: "G-0SBDGRF8S7"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

    const [user, loading, error] = useAuthState(auth);

    if (loading) {
        return (
            <div>
                <p>Initialising User...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div>
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>⚛️🔥💬SWE-632 Chat</h1>
                <SignOut/>
            </header>

            <section>
                {user ? <div>
                    <p>Current User: {user.email}</p>
                    <ChatRoom/>
                </div> : <div>
                    <SignIn/>
                    <SignInFacebook/>
                </div>}
            </section>

        </div>
    );
}


function SignIn() {

    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    }

    return (
        <>
            <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
            <p>PLEASE BE POLITE!</p>
        </>
    )

}

function SignInFacebook() {

    const signInWithFacebook = () => {
        const provider = new firebase.auth.FacebookAuthProvider();
        auth.signInWithPopup(provider);
    }

    function after_login() {
        firebase.auth()
            .getRedirectResult()
            .then((result) => {
                if (result.credential) {
                    /** @type {firebase.auth.OAuthCredential} */
                    var credential = result.credential;

                    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
                    var token = credential.accessToken;
                    // ...
                }
                // The signed-in user info.
                var user = result.user;
            }).catch((error) => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
        });

    }


    return (
        <>
            <button className="sign-in" onClick={signInWithFacebook}>Sign in with facebook</button>
            <p>there are no community guidelines</p>
        </>
    )

}


function SignOut() {
    return auth.currentUser && (
        <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
    )
}


function ChatRoom() {
    const dummy = useRef();
    const messagesRef = firestore.collection('messages');
    const query = messagesRef.orderBy('createdAt').limit(25);

    const [messages] = useCollectionData(query, {idField: 'id'});

    const [formValue, setFormValue] = useState('');


    const sendMessage = async (e) => {
        e.preventDefault();

        const {uid, photoURL} = auth.currentUser;

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL
        })

        setFormValue('');
        dummy.current.scrollIntoView({behavior: 'smooth'});
    }

    return (<>
        <main>

            {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}

            <span ref={dummy}></span>

        </main>

        <form onSubmit={sendMessage}>

            <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice"/>

            <button type="submit" disabled={!formValue}>🕊️</button>

        </form>
    </>)
}


function ChatMessage(props) {
    const {text, uid, photoURL} = props.message;

    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return (<>
        <div className={`message ${messageClass}`}>
            <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'}/>
            <p>{text}</p>
        </div>
    </>)
}


export default App;
