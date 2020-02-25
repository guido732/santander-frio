const renderData = () => {
	let activeUser = JSON.parse(sessionStorage.getItem("activeUser"));
	let name = activeUser.fullname;
	let arsBalance = activeUser.accounts[0].balance;
	document.getElementById("name").innerHTML = name;
	document.getElementById("walletArs").innerHTML = arsBalance;
	// Falta hacer que el active user muestre la cuenta en dolares
};

// Ingresar dinero
const addMoney = async e => {
	e.preventDefault();
	let activeUser = JSON.parse(sessionStorage.getItem("activeUser"));
	const accountNum = findAccountNumber(activeUser);
	const { dni } = activeUser;
	let qty = {
		amount: document.getElementById("qtyDeposit").value,
		userID: dni,
		destinationAccountNum: accountNum,
	};
	response = await fetch("http://127.0.0.1:3000/v1/accounts/operations/depositMoney", {
		method: "PUT",
		body: JSON.stringify(qty),
		headers: {
			"Content-Type": "application/json",
		},
	});
	const jsonResponse = await response.json();

	if (response.status === 200) {
		sessionStorage.setItem("activeUser", JSON.stringify(jsonResponse));
		renderData();
	} else {
		console.log(jsonResponse); /// TODO: Aca hay que mostrar un modal en el front diciendo que alguno de los datos son incorrectos.
	}
};

const findAccountNumber = activeUser => {
	const foundAccount = activeUser.accounts.find(acc => acc.currency === "$");
	return foundAccount.accountNumber;
};

document.getElementById("btn-internTransf").addEventListener("click", addMoney);
