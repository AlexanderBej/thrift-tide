import { Fragment } from "react";
// import { useSelector } from "react-redux";

// import { selectCurrentUser } from "../../store/user/user.selector";

import "./dashboard-user.styles.scss";

const DashboardUser = ({ displayName, email, photoURL }) => {
	// const currentUser = useSelector(selectCurrentUser);
	// console.log(currentUser)

	return (
		<Fragment>
			<div className="user-container">
				<div className="cover-img" style={{ backgroundImage: `url(${photoURL})` }} />
				<div className="user-info">
					<h3>{displayName}</h3>
					<h5>{email}</h5>
				</div>
			</div>
		</Fragment>
	);
};

export default DashboardUser;
