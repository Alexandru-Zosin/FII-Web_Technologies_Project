document.getElementById("submit-button").addEventListener('click', async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("pass").value;
    const confirmPassword = document.getElementById("confirmCurrentPassword").value;

    const response = await fetch("https://localhost:3000/signup", {
        method: "POST",
        credentials: 'include',
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
            confirmPassword,
        }),
    });

    if (response.status === 201) {
        window.location.href = "https://localhost/login/index.html";
    } else if (response.status === 409) {
        window.alert("Signup failed: User already exists.");
    } else {
        const errorData = await response.json();
        window.alert(`Signup failed: ${errorData.error}`);
    }
});

window.onload = async () => {
    const response = await fetch("https://localhost:3000/validate", {
        method: "POST",
        credentials: 'include',
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
    });

    if (response.status === 200) {
        window.location.href = "https://localhost/mainPage/index.html";
    }
};