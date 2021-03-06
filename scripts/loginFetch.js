const doLogin = async () => {
	try {
		const userDni = document.querySelector("#userdni").value;
		const userPassword = document.querySelector("#password").value;
		const requestBody = { dni: userDni, password: userPassword };
		response = await fetch("http://127.0.0.1:3000/v1/users/login", {
			method: "POST",
			body: JSON.stringify(requestBody),
			headers: {
				"Content-Type": "application/json",
			},
		});
		const jsonResponse = await response.json();
		if (response.status === 200) {
			sessionStorage.setItem("activeUser", JSON.stringify(jsonResponse));
			window.location.assign("./home");
		} else {
			let message;
			if(response.status === 401){
				message = 'Contraseña incorrecta.'
			}else{message = 'Usuario inexistente.'};
			document.getElementById('loginMessageLabel').innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
			console.log(jsonResponse); /// TODO: Aca hay que mostrar un modal en el front diciendo que alguno de los datos son incorrectos.
		}
	} catch (error) {
		console.log(error); //MANEJO DE ERRORES
	}
};

const hideMessages = () => {
	const messageLabel = document.getElementById('loginMessageLabel');
	if(messageLabel){messageLabel.innerHTML = '';}
}

document.getElementById("loginAction").addEventListener("click", doLogin);
document.getElementById("userdni").addEventListener("click",hideMessages);
