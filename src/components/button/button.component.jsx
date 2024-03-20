import "./button.styles.scss";

const Button = ({ children, isLoading = false, customClassName = "", ...otherProps }) => {
	return (
		<div className={`${customClassName} btn-container`}>
			<button className="thrift-tide-btn" disabled={isLoading} {...otherProps}>
				{children}
			</button>
		</div>
	);
};

export default Button;
