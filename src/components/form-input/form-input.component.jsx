import React from "react";

import "./form-input.styles.scss";

const FormInput = ({ inputType, label, ...otherProps }) => {
	return (
		<div className="group">
			{React.createElement(inputType, { className: "form-input", ...otherProps })}
			{label && <label className={`${otherProps.value.length ? "shrink" : ""} form-input-label`}>{label}</label>}
		</div>
	);
};

export default FormInput;
