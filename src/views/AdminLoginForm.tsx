import { useForm } from "react-hook-form";
import "../App.css"


export default function AdminLoginForm() {
    const { formState: { errors } } = useForm();
    return (
        <>
            <h2>Login as Admin</h2>

            <form className="App">
                <input type="email"
                    placeholder="Enter your email"
                />
                {errors.email && <span style={{ color: "red" }}>*Email* is mandatory</span>}

                <input type="password" placeholder="Enter your password"
                />
                {errors.password && <span style={{ color: "red" }}>*Password* is mandatory</span>}

                <input type="submit" style={{ backgroundColor: "#a1eafb"}}/>
            </form>
        </>
    );
};