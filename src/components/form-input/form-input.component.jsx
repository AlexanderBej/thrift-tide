import React from "react";

import "./form-input.styles.scss";

const FormInput = ({ inputType, label, customClassName, ...otherProps }) => {
	return (
		<div className={`group ${customClassName}`}>
			{React.createElement(inputType, { className: "form-input", ...otherProps })}
			{label && <label className={`${otherProps.value.length ? "shrink" : ""} form-input-label`}>{label}</label>}
		</div>
	);
};

export default FormInput;
