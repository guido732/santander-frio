// Funciones generales
const findAccountData = (activeUser,currency) => {
	const foundAccount = activeUser.accounts.find(acc => acc.currency === currency);
	data = {
		currentBalance : foundAccount.balance,
		accountNumber : foundAccount.accountNumber,
	}
	return data;
};
const renderData = () => {
	let activeUser = JSON.parse(sessionStorage.getItem("activeUser"));
	let name = activeUser.fullname;
	document.getElementById("name").innerHTML = name;
	document.getElementById("walletArs").innerHTML = findAccountData(activeUser,"$").currentBalance.toFixed(2);
	document.getElementById("walletUsd").innerHTML = findAccountData(activeUser,"US$").currentBalance.toFixed(2);
};
const applyShadowBox = (action,box) => {
	$(`.${box}`).addClass(`${action}-animate-border`);
	setTimeout(()=> {$(`.${box}`).removeClass(`${action}-animate-border`);},4000);
}

// FETCHS

// Ingresar dinero
const addMoney = async e => {
	e.preventDefault();
	let activeUser = JSON.parse(sessionStorage.getItem("activeUser"));
	const { dni } = activeUser;
	let body = {
		amount: document.getElementById("qtyDeposit").value,
		userID: dni,
		destinationAccountNum: findAccountData(activeUser,"$").accountNumber
	};
	console.log("El body a mandar es: ",body);
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
		applyShadowBox('success','ars');
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
		originAccountNum: findAccountData(activeUser,accountOrigin).accountNumber,
		destinationAccountNum: document.getElementById('cbu').value,
		userID: dni,
	};
	console.log("El body a mandar es:",body);
	response = await fetch("http://127.0.0.1:3000/v1/accounts/operations/externaltransfer", {
		method: "PUT",
		body: JSON.stringify(body),
		headers: {
			"Content-Type": "application/json",
		},
	});
	const jsonResponse = await response.json();
	if (response.status === 200) {
		sessionStorage.setItem("activeUser", JSON.stringify(jsonResponse));
		applyShadowBox('danger','ars');
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
		amount: document.getElementById("exchangeAmount").value,
		originAccountNum: findAccountData(activeUser,"$").accountNumber,
		destinationAccountNum: findAccountData(activeUser,"US$").accountNumber,
		userID: dni,
	};
	console.log("El body a mandar es: ",body);
	response = await fetch("http://127.0.0.1:3000/v1/accounts/operations/internaltransfer", {
		method: "PUT",
		body: JSON.stringify(body),
		headers: {
			"Content-Type": "application/json",
		},
	});
	const jsonResponse = await response.json();
	if (response.status === 200) {
		sessionStorage.setItem("activeUser", JSON.stringify(jsonResponse));
		applyShadowBox('danger','ars');
		applyShadowBox('success','usd');
		renderData();
	} else {
		console.log(jsonResponse); /// TODO: Aca hay que mostrar un modal en el front diciendo que alguno de los datos son incorrectos.
	}
};


// Selectores
document.getElementById("btn-internTransf").addEventListener("click", addMoney);
document.getElementById("btn-externTransf").addEventListener("click", transferExternal);
document.getElementById("btn-exchangeMoney").addEventListener('click', exchangeMoney);

