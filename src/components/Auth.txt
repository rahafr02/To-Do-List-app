// Auth page 
import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "./Auth.css";

function Auth({ onUserChange }) { //
  const [email, setEmail] = useState(""); //save email of user
  const [password, setPassword] = useState(""); //save pass of user
  const [isLogin, setIsLogin] = useState(true); //decide if user login(true) or signup (false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { //user login or signup 
      const userCredential = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      onUserChange(userCredential.user); //pass user data to onchange function 
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-page"> 
      <div className="auth-container"> 
        <h2 className="auth-title">{isLogin ? "Login" : "Register"}</h2> {/* page title based on login or signup  */}
        <form onSubmit={handleSubmit} className="auth-form"> {/*onsubmit handleSubmit called */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} //to save the email adress
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} //to save password 
            required
            className="auth-input"
          />
          <button type="submit" className="auth-button">
            {isLogin ? "Login" : "Sign Up"} {/*button title based on state */}
          </button>
        </form>
        <p onClick={() => setIsLogin(!isLogin)} className="toggle-auth"> {/*clickable text container*/} 
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

export default Auth;