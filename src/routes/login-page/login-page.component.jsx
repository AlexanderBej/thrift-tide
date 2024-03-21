import { useRef, useState } from "react";

import { signInWithGooglePopup, createUserDocumentFromAuth, signInAuthUserWithEmailAndPassword } from "../../utils/firebase/firebase.utils";

import FormInput from "../../components/form-input/form-input.component";
import Button from "../../components/button/button.component";

import "./login-page.styles.scss";
import { useNavigate } from "react-router-dom";

const defaultFormFields = {
	email: "",
	password: "",
};

const LoginPage = () => {
	const form = useRef();
	const [formFields, setFormFields] = useState(defaultFormFields);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const { email, password } = formFields;

	const logGoogleUser = async () => {
		const { user } = await signInWithGooglePopup();
		createUserDocumentFromAuth(user);
		console.log(user);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		try {
			await signInAuthUserWithEmailAndPassword(email, password);
			resetFormFields();
			onNavigateToDashboardHandler();
		} catch (error) {
			if (error.code === 'auth/invalid-credential') {
                alert('incorrect password')
            }
			console.log("Error signing in", error)
		}

		// console.log(formFields);
		// try {
		// 	setLoading(true);
		// 	setTimeout(() => {
		// 		setLoading(false);
		// 		resetFormFields();
		// 		onNavigateToDashboardHandler();
		// 	}, 2000);
		// } catch (error) {
		// 	console.log(error);
		// }
	};

	const resetFormFields = () => {
		setFormFields(defaultFormFields);
	};

	const handleChange = (event) => {
		const { name, value } = event.target;

		setFormFields({ ...formFields, [name]: value });
	};

	const onNavigateToSignUpHandle = () => navigate("/sign-up");
	const onNavigateToDashboardHandler = () => navigate("/dashboard");

	return (
		<main className="login-page">
			<div className="login-form">
				<h1>Get back in the game</h1>
				<form ref={form} onSubmit={handleSubmit}>
					<FormInput
						label="Email"
						type="text"
						inputType={"input"}
						inputMode="email"
						onChange={handleChange}
						name="email"
						required
						value={email}
					/>

					<FormInput
						label="Password"
						type="password"
						inputType={"input"}
						onChange={handleChange}
						name="password"
						required
						value={password}
					/>

					<div className="btns-container">
						<Button isLoading={loading} type="submit" customClassName="message-me-btn">
							Login
						</Button>
						<Button isLoading={loading} type="button" customClassName="message-me-btn" onClick={logGoogleUser}>
							Google Sign In
						</Button>
					</div>
				</form>
				<h2>
					Don't have an account yet? <span onClick={onNavigateToSignUpHandle}>Sign up right now!</span>
				</h2>
			</div>
		</main>
	);
};

export default LoginPage;
