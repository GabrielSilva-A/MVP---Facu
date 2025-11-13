class LoginForm {
    constructor() {
        this.username = '';
        this.password = '';
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this[name] = value;
    }

    handleSubmit(event) {
        event.preventDefault();
        // Add form submission logic here
        console.log('Username:', this.username);
        console.log('Password:', this.password);
    }

    render() {
        return `
            <form onsubmit="this.handleSubmit(event)">
                <div>
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" oninput="this.handleInputChange(event)" required>
                </div>
                <div>
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" oninput="this.handleInputChange(event)" required>
                </div>
                <button type="submit">Login</button>
            </form>
        `;
    }
}

export default LoginForm;