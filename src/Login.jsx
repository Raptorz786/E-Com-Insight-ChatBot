import React, { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(email, password);
    };

    return (
        <section className="Login">
            <div id="form-ui" className="FormCenter">
                <form id="form" onSubmit={handleSubmit}>
                    <div id="form-body">
                        <div id="welcome-lines">
                            <div id="welcome-line-1">Welcome Back!</div>
                        </div>

                        <div id="input-area">
                            <div className="form-inp">
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-inp">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div id="submit-button-cvr">
                            <button id="submit-button" type="submit">
                                Login
                            </button>
                        </div>

                        {/* <div id="forgot-pass">
                            <a href="#">Forgot password?</a>
                        </div> */}

                        <div id="bar"></div>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default Login;
