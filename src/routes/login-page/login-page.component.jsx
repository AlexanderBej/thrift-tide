import { useRef, useState } from "react";

import { signInWithGooglePopup, createUserDocumentFromAuth } from "../../utils/firebase/firebase.utils";

import FormInput from "../../components/form-input/form-input.component";
import Button from "../../components/button/button.component";

import "./login-page.styles.scss";
import { useNavigate } from "react-router-dom";

const defaultFormFields = {
	name: "",
	password: "",
};

const LoginPage = () => {
	const form = useRef();
	const [formFields, setFormFields] = useState(defaultFormFields);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const { name, password } = formFields;

	const logGoogleUser = async () => {
		const { user } = await signInWithGooglePopup();
		createUserDocumentFromAuth(user);
		console.log(user);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		console.log(formFields);
		try {
			setLoading(true);
			setTimeout(() => {
				setLoading(false);
				resetFormFields();
				onNavigateToDashboardHandler();
			}, 2000);
		} catch (error) {
			console.log(error);
		}
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
					<FormInput label="Name" type="text" inputType={"input"} onChange={handleChange} name="name" required value={name} />

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
