//LOGIN FETCH. CHECKED.

const doLogin = async () => {
  const userDni = document.querySelector("#userdni").value;
  const userPassword = document.querySelector("#password").value;
  const requestBody = { dni: userDni, password: userPassword };
  console.log(JSON.stringify(requestBody));

  response = await fetch("http://127.0.0.1:3000/v1/users/login", {
    method: "POST",
    body: JSON.stringify(requestBody),
    headers: {
      "Content-Type": "application/json"
    }
  });
  jsonResponse = await response.json();
  console.log(jsonResponse);
};
