const doLogout = async () => {
  try {
    let activeUser = JSON.parse(sessionStorage.getItem("activeUser"));
    let userDni = activeUser.dni;
    const requestBody = { dni: userDni };
    response = await fetch("http://127.0.0.1:3000/v1/users/logout", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const jsonResponse = await response.json();
    if (response.status === 200) {
      sessionStorage.setItem("activeUser", JSON.stringify(jsonResponse));
      window.location.assign("http://127.0.0.1:5500/");
    } else {
      console.log(jsonResponse); /// TODO: Aca hay que mostrar un modal en el front diciendo que alguno de los datos son incorrectos.
    }
  } catch (error) {
    console.log(error); //MANEJO DE ERRORES
  }
};

document.getElementById("logoutAction").addEventListener("click", doLogout);
