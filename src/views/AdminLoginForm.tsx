import "../styling/AdminLoginStyles.css"


export default function AdminLoginForm() {
    return (
        <div className="container">
            <div className="form-wrapper">
                <h2>Login as Admin</h2>

                <form>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" placeholder="Enter your email" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" placeholder="Enter your password" />
                    </div>

                    <input type="submit" value="Submit" />
                </form>
            </div>
        </div>
    );
};