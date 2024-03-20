import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import FormInput from "../../components/form-input/form-input.component";
import Button from "../../components/button/button.component";

import "./sign-up.styles.scss";

const defaultFormFields = {
	name: "",
	username: "",
	email: "",
	password: "",
	confirmPassword: "",
};

const SignUp = () => {
	const form = useRef();
	const [formFields, setFormFields] = useState(defaultFormFields);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const { name, username, email, password, confirmPassword } = formFields;
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

	const onNavigateToDashboardHandler = () => navigate("/dashboard");
	const onNavigateToLoginHandler = () => navigate("/login");

	return (
		<main className="sign-up-page">
			<div className="sign-up-form">
				<h1>Join us!</h1>
				<form ref={form} onSubmit={handleSubmit}>
					<FormInput label="Name" type="text" inputType={"input"} onChange={handleChange} name="name" required value={name} />

					<FormInput label="Username" type="text" inputType={"input"} onChange={handleChange} name="username" required value={username} />

					<FormInput label="Email" type="email" inputType={"input"} onChange={handleChange} name="email" required value={email} />

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
						<Button isLoading={loading} type="submit" customClassName="message-me-btn">
							Sign up
						</Button>
					</div>
				</form>
                <span onClick={onNavigateToLoginHandler}>Back to login</span>
			</div>
		</main>
	);
};

export default SignUp;
