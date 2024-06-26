import { useNavigate } from "react-router-dom";

import Button from "../../components/button/button.component";
import { ReactComponent as Logo } from "../../assets/Logo.svg";

import "./home.styles.scss";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/user/user.selector";

const Home = () => {
	const currentUser = useSelector(selectCurrentUser);
	const navigate = useNavigate();

	const onNavigateToLoginHandler = () => {
		if (currentUser) {
			navigate("/dashboard");
		} else {
			navigate("/login");
		}
	};

	return (
		<main className="home-page">
			<Logo className="logo" />
			<h1>Welcome</h1>
			<h2>
				You've landed on the page of <span>ThriftTide</span>, your own personalized financial help
			</h2>
			<h3>Here you can track your monthly expenses, savings, and all financial travles.</h3>
			<p>ThriftTide uses the 50-30-20 rule so you can best handle your salary each month.</p>
			<p>If you wish to read more about the 50-30-20 rule, you may Google it yourself.</p>
			<Button type="button" onClick={onNavigateToLoginHandler}>
				Get started
			</Button>
		</main>
	);
};

export default Home;
