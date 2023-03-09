import React, { useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";

function LoginPage({ user, setUser }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState(''); //<-- Switch to an empty string when ready
    const [password, setPassword] = useState('');
    const alertRef = useRef();

    //HANDLE LOGIN
    // refactor this later
    const handleSubmit = (e) => {
        e.preventDefault();
        const loginData = { username, password };
        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        })
            .then(async (res) => {
                const status = res.status;
                const data = await res.json();
                console.log('in login, data is: ', data);
                if (status === 200) {
                    setUser(data);
                    navigate(`/boards/${data.board_ids[0]}`);
                } else {
                    alertRef.current.style.visibility = 'visible';
                }
            }).catch((error) => {
                console.log('incorrect username or password', error)
            })
    }

    const handleInputChange = ({ target }, callback) => {
        callback(target.value);
        if (alertRef.current.style.visibility === 'visible') alertRef.current.style.visibility = 'hidden';
    }

    //RENDER
    return (
        <div className='loginCont'>
            <div className="user-login-box">
                <header>
                    <h1 className='login-header'>Welcome! Sign in here! </h1>
                    <span id='login-alert' ref={alertRef}>Incorrect username and/or password.</span>
                </header>
                <form className='loginForm' onSubmit={handleSubmit}>
                    <div className='formLine'>
                        <label className='login-text' htmlFor="username">Username/Email</label>
                        <input className='user-input' type='text' required value={username} onChange={(e) => handleInputChange(e, setUsername)} />
                    </div>
                    <div className='formLine'>
                        <label className='login-text' htmlFor="password">Password</label>
                        <input className='user-input' type='password' value={password} required onChange={(e) => handleInputChange(e, setPassword)} />
                    </div>
                    <button className='submit'>Login</button>
                </form>
                <div className='login-footer'>
                    <span>Don't have an Account?</span>
                    <button onClick={() => navigate('/signup')}>Sign up here!</button>
                </div>
            </div>
        </div>
    )
}

export default LoginPage;


