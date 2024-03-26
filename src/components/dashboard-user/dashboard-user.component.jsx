import { Fragment } from "react";

import "./dashboard-user.styles.scss";

const DashboardUser = ({ displayName, email, photoURL }) => {
	if (!photoURL) {
		console.log('no photo here');
	}

	const getInitials = (name) => {
		if (!name) return '';
		const names = name.split(' ');
		return names.slice(0, 2).map((n) => n[0]).join('').toUpperCase();
	  };

	  console.log(getInitials(displayName))

	return (
		<Fragment>
			<div className="user-container">
			{photoURL ? (
				<div className="cover-img" style={{ backgroundImage: `url(${photoURL})` }} title="User avatar"/>
			  ) : (
				<div className="cover-img initials-box">{getInitials(displayName)}</div>
			  )}
				
				<div className="user-info">
					<h3>{displayName}</h3>
					<h5>{email}</h5>
				</div>
			</div>
		</Fragment>
	);
};

export default DashboardUser;
