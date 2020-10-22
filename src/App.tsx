/* eslint-disable jsx-a11y/alt-text */
import React, { useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import config from './config.json';

import firebase, { User } from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// TODO: seprate components
// import ChatRoom from './ChatRoom';
// import SignIn from './SignIn';

console.log({ config });

firebase.initializeApp(config.firebase);

const auth = firebase.auth();
const firestore = firebase.firestore();

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  );

}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => {
      auth.signOut()
    }}>Sign Out</button>
  )
}

function ChatMessage(props: { message: { text: any; uid: any; photoURL: any }; }) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser?.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      {/* // eslint-disable-next-line jsx-a11y/alt-text */}
      <img src={photoURL} />
      <p>{text}</p>
    </div>

  )
}

function ChatRoom() {

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const dummy: any = useRef();

  const sendMessage = async (e: any) => {

    e.preventDefault();

    const { uid, photoURL }: any = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' })

  }

  return (
    <>
      <main>
        {messages && messages.map((message: any) => {
          return (
            <ChatMessage key={message.id} message={message} />
          )
        })}

        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input onChange={(e) => {
          setFormValue(e.target.value);
        }}
          value={formValue}
        />
        <button type="submit">Send</button>
      </form>
    </>
  );
}

function App() {

  // returns an object that has user info
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>

      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

export default App;
