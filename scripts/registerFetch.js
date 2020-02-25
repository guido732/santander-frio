const registerUser = async (e) => {
	e.preventDefault();
	registerBody = {
		dni: document.getElementById("dni").value,
		password: document.getElementById("clave").value,
		fullname: document.getElementById("name").value,
	};
	console.log(registerBody);
	response = await fetch("http://127.0.0.1:3000/v1/users/newuser", {
		method: "POST",
		body: JSON.stringify(registerBody),
		headers: {
			"Content-Type": "application/json"
		  }
	});
	const jsonResponse = await response.json();
    console.log(jsonResponse);
    if (response.status === 200) {
        document.getElementById('messageLabel').innerHTML = `<div class="alert alert-success" role="alert">
        Registro exitoso, ya podes loguearte!</div>`;
      } else {
        document.getElementById('messageLabel').innerHTML = `<div class="alert alert-danger" role="alert">
        Oops, usuario existente!</div>`;
      }
    // Registro exitoso, pedir el usuario a la db, guardarlo como activeUser y redireccionar a homebanking con el usuario activo
}

document.getElementById("registerAction").addEventListener("click",registerUser);