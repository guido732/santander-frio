JSON.parse(sessionStorage.getItem("activeUser")) === null
	? window.location.assign("../")
	: null;

// Funciones generales
const findAccountData = (activeUser, currency) => {
	const foundAccount = activeUser.accounts.find(acc => acc.currency === currency);
	const data = {
		currentBalance: foundAccount.balance,
		accountNumber: foundAccount.accountNumber,
	};
	return data;
};
const renderData = () => {
	let activeUser = JSON.parse(sessionStorage.getItem("activeUser"));
	let name = activeUser.fullname;
	document.getElementById("name").innerHTML = name;
	document.getElementById("walletArs").innerHTML = findAccountData(
		activeUser,
		"$",
	).currentBalance.toFixed(2);
	document.getElementById("walletUsd").innerHTML = findAccountData(
		activeUser,
		"US$",
	).currentBalance.toFixed(2);
};
const applyShadowBox = (action, box) => {
	$(`.${box}`).addClass(`${action}-animate-border`);
	setTimeout(() => {
		$(`.${box}`).removeClass(`${action}-animate-border`);
	}, 4000);
};

// FETCHS

// Ingresar dinero
const addMoney = async e => {
	e.preventDefault();
	let activeUser = JSON.parse(sessionStorage.getItem("activeUser"));
	const { dni } = activeUser;
	let body = {
		amount: document.getElementById("qtyDeposit").value,
		userID: dni,
		destinationAccountNum: findAccountData(activeUser, "$").accountNumber,
	};
	response = await fetch("http://127.0.0.1:3000/v1/accounts/operations/depositMoney", {
		method: "PUT",
		body: JSON.stringify(body),
		headers: {
			"Content-Type": "application/json",
		},
	});
	const jsonResponse = await response.json();

	if (response.status === 200) {
		sessionStorage.setItem("activeUser", JSON.stringify(jsonResponse));
		applyShadowBox("success", "ars");
		renderData();
	} else {
		console.log(jsonResponse); /// TODO: Aca hay que mostrar un modal en el front diciendo que alguno de los datos son incorrectos.
	}
};

// Transferencia externa
const transferExternal = async e => {
	e.preventDefault();
	let activeUser = JSON.parse(sessionStorage.getItem("activeUser"));
	const { dni } = activeUser;
	const accountOrigin = document.getElementById("inputCuentaSelectTransf").value;
	let body = {
		amount: document.getElementById("transfAmount").value,
		originAccountNum: findAccountData(activeUser, accountOrigin).accountNumber,
		destinationAccountNum: document.getElementById("cbu").value,
		userID: dni,
	};
	response = await fetch(
		"http://127.0.0.1:3000/v1/accounts/operations/externaltransfer",
		{
			method: "PUT",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
	const jsonResponse = await response.json();
	if (response.status === 200) {
		sessionStorage.setItem("activeUser", JSON.stringify(jsonResponse));
		applyShadowBox("danger", "ars");
		renderData();
	} else {
		console.log(jsonResponse); /// TODO: Aca hay que mostrar un modal en el front diciendo que alguno de los datos son incorrectos.
	}
};

// Comprar Dolares
const exchangeMoney = async e => {
	e.preventDefault();
	let activeUser = JSON.parse(sessionStorage.getItem("activeUser"));
	const { dni } = activeUser;
	let body = {
		amount: document.getElementById("exchangeTotal").textContent,
		originAccountNum: findAccountData(activeUser, "$").accountNumber,
		destinationAccountNum: findAccountData(activeUser, "US$").accountNumber,
		userID: dni,
	};
	response = await fetch(
		"http://127.0.0.1:3000/v1/accounts/operations/internaltransfer",
		{
			method: "PUT",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
	const jsonResponse = await response.json();
	if (response.status === 200) {
		sessionStorage.setItem("activeUser", JSON.stringify(jsonResponse));
		applyShadowBox("danger", "ars");
		applyShadowBox("success", "usd");
		document.getElementById("exchangeAmount").value = "";
		renderData();
	} else {
		console.log(jsonResponse); /// TODO: Aca hay que mostrar un modal en el front diciendo que alguno de los datos son incorrectos.
	}
};

const showTransactionDetails = async () => {
	const arsAmount = document.getElementById("exchangeAmount").value;
	const exchangeRate = document.getElementById("exchangeRate");
	const usdAmount = document.getElementById("usdAmount");
	const exchangeTax = document.getElementById("exchangeTax");
	const totalAmount = document.getElementById("exchangeTotal");

	await getExangeRate().then(response => (exchangeRate.textContent = response.US$));
	if (exchangeRate.textContent === "N/A") {
		exchangeTax.textContent = "N/A";
		usdAmount.textContent = "N/A";
		totalAmount.textContent = "N/A";
	} else {
		exchangeTax.textContent = (+arsAmount * 0.3).toFixed(2);
	usdAmount.textContent = (+arsAmount / exchangeRate.textContent).toFixed(2);
	totalAmount.textContent = +arsAmount + +exchangeTax.textContent;
	}
};

const getExangeRate = async () => {
	try {
	const response = await fetch(
		"http://127.0.0.1:3000/v1/accounts/operations/getexangerate",
	);
	const jsonResponse = await response.json();
	return jsonResponse;
	} catch {
		const errorContainer = document.getElementById("error-message");
		errorContainer.style.color = "red";
		errorContainer.textContent = "No se ha podido obtener el tipo de cambio";
		return { US$: "N/A" };
	}
};

// Selectores
document.getElementById("btn-internTransf").addEventListener("click", addMoney);
document.getElementById("btn-externTransf").addEventListener("click", transferExternal);
document.getElementById("btn-exchangeMoney").addEventListener("click", exchangeMoney);
document
	.getElementById("exchangeAmount")
	.addEventListener("input", showTransactionDetails);
