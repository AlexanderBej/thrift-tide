import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createAuthUserWithEmailAndPassword, createUserDocumentFromAuth } from "../../utils/firebase/firebase.utils";

import FormInput from "../../components/form-input/form-input.component";
import Button from "../../components/button/button.component";

import "./sign-up.styles.scss";

const defaultFormFields = {
	displayName: "",
	email: "",
	password: "",
	confirmPassword: "",
};

const SignUp = () => {
	const form = useRef();
	const [formFields, setFormFields] = useState(defaultFormFields);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const { displayName, email, password, confirmPassword } = formFields;
	const handleSubmit = async (event) => {
		event.preventDefault();

		if (password !== confirmPassword) {
			alert("Passwords do not match");
			return;
		}

		try {
			setLoading(true);
			const { user } = await createAuthUserWithEmailAndPassword(email, password);

			await createUserDocumentFromAuth(user, { displayName });
			setLoading(false);
			resetFormFields();
			onNavigateToLoginHandler();
		} catch (error) {
			if (error.code === "auth/email-already-in-use") {
				alert("Email already in use");
			}
			console.log("user creation encountered an error", error);
		}
	};

	const resetFormFields = () => {
		setFormFields(defaultFormFields);
	};

	const handleChange = (event) => {
		const { name, value } = event.target;

		setFormFields({ ...formFields, [name]: value });
	};

	const onNavigateToLoginHandler = () => navigate("/login");

	return (
		<main className="sign-up-page">
			<div className="sign-up-form">
				<h1>Join us!</h1>
				<form ref={form} onSubmit={handleSubmit}>
					<FormInput
						label="Display Name"
						type="text"
						inputType={"input"}
						onChange={handleChange}
						name="displayName"
						required
						value={displayName}
					/>

					<FormInput
						label="Email"
						type="email"
						inputType={"input"}
						onChange={handleChange}
						inputMode="email"
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

					<FormInput
						label="Confirm Password"
						type="password"
						inputType={"input"}
						onChange={handleChange}
						name="confirmPassword"
						required
						value={confirmPassword}
					/>

					<div className="btns-container">
						<Button isLoading={loading} type="submit" customClassName="sign-up-btn">
							Sign up
						</Button>
					</div>
				</form>
				<h5>
					<button className="underlined-btn" onClick={onNavigateToLoginHandler}>
						Back to login
					</button>
				</h5>
			</div>
		</main>
	);
};

export default SignUp;
