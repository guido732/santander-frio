const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const server = express();
const axios = require("axios");

let userDb = [
	{
		dni: "30111000",
		password: "pedrogato123",
		isAuth: false,
	},
	{
		dni: "20999111",
		password: "marioperro123",
		isAuth: false,
	},
];

let accounts = [
	{
		fullname: "Pedro Gato",
		dni: "30111000",
		accounts: [
			{
				accountNumber: 111111,
				currency: "$",
				balance: 10000.0,
				extractionLimit: 1000,
			},
			{
				accountNumber: 222222,
				currency: "US$",
				balance: 500.0,
				extractionLimit: 1000,
			},
		],
	},
	{
		fullname: "Mario Perro",
		dni: "20999111",
		accounts: [
			{
				accountNumber: 333333,
				currency: "$",
				balance: 10000.0,
				extractionLimit: 1000,
			},
			{
				accountNumber: 444444,
				currency: "US$",
				balance: 500.0,
				extractionLimit: 1000,
			},
		],
	},
];

const currencyExange = {
	$: 58.5,
	US$: 63.5,
	lastUpdated: "",
};

server.listen(3000, () => {
	console.log("Server started");
});

server.use(bodyParser.json(), cors());

// Register new user
server.post("/v1/users/newuser", validateExistingUser, (req, res) => {
	// TODO: Corroborar que las variables sean igual que lo que se manda desde el front
	const { dni, password, fullname } = req.body;
	userDb.push({ dni, password });
	createAccount(dni, fullname);
	res.status(200).json("User created");
});

//User login
server.post("/v1/users/login", userLogin, (req, res) => {
	const { userData } = req;
	isAuth = true;
	res.status(200).json(userData);
});

// Deposit money
server.put(
	"/v1/accounts/operations/depositMoney",
	getActiveUser,
	validateAmount,
	(req, res) => {
		const { amount, destinationAccountNum } = req.body;
		const { activeUserIndex, activeUser } = res.locals;
		//Valida cuenta de deposito
		if (validateEndAccount(destinationAccountNum, activeUser)) {
			// Obtiene indice de cuentas
			const destinationAccountIndex = getAccountIndex(activeUser, destinationAccountNum);
			//realiza la operacion
			accounts[activeUserIndex].accounts[destinationAccountIndex].balance += +amount;

			//retorna nuevo userActive info
			res.status(200).json(accounts[activeUserIndex]);
		} else {
			res.status(404).send("Account not found");
		}
	},
);

// User's accounts current status
server.get("/v1/users/accounts", (req, res) => {
	const { dni } = req.body;
	const userData = findUserData(dni);
	res.status(200).json(userData);
}); // El caso de error se maneja por el general, ya que este GET se hace una vez logueado el
//Usuario por lo que el DNI ya esta previamente validado por los otros metodos.

//User logout
server.post("/v1/users/logout", (req, res) => {
	const { dni } = req.body;
	const user = findUser(dni);
	user.isAuth = false;
	res.status(200).json(null);
});

// InternalTransference
// Validación de cuentas internas (que existan)
server.put(
	"/v1/accounts/operations/internaltransfer",
	getActiveUser,
	validateAmount,
	getCurrencyExange,
	(req, res) => {
		// Agregar middleware VALIDARCUENTAORIGEN/TOKEN
		const { amount, originAccountNum, destinationAccountNum } = req.body;
		const { activeUserIndex, activeUser } = res.locals;
		// Obtiene indice de cuentas
		const destinationAccountIndex = getAccountIndex(activeUser, +destinationAccountNum);
		const originAccountIndex = getAccountIndex(activeUser, +originAccountNum);

		if (
			validateExistingAccounts(
				activeUser,
				+originAccountNum,
				activeUser,
				+destinationAccountNum,
			)
		) {
			// TODO: Validar montos suficientes
			if (validateSufficientFunds(activeUser, originAccountIndex, +amount)) {
				// Realiza conversión de moneda
				const originCurrency = activeUser.accounts[originAccountIndex].currency;
				const destinationCurrency = activeUser.accounts[destinationAccountIndex].currency;
				const netAmount = +amount / 1.3;
				const transformedAmount = applyCurrencyExange(
					+netAmount,
					originCurrency,
					destinationCurrency,
				);

				// Realiza operación
				accounts[activeUserIndex].accounts[originAccountIndex].balance -= +amount;
				accounts[activeUserIndex].accounts[
					destinationAccountIndex
				].balance += +transformedAmount;

				// Retorna nuevo activeUser info
				res.status(200).json(accounts[activeUserIndex]);
			} else {
				res.status(412).send("Insufficient funds to perform operation on origin account");
			}
		} else {
			res.status(404).send("Account(s) not found");
		}
	},
);

// ExternalTransference
server.put(
	"/v1/accounts/operations/externaltransfer",
	getActiveUser,
	validateAmount,
	getCurrencyExange,
	(req, res) => {
		// Agregar middleware VALIDARCUENTAORIGEN/TOKEN
		// Obtiene datos del body + cuenta origen e Index de cuenta origen desde el res.locals
		const { amount, destinationAccountNum, originAccountNum } = req.body;
		const { activeUserIndex: originUserIndex, activeUser: originUser } = res.locals;
		// Obtiene datos de la cuenta destino
		const destinationUser = getAccountFromAccountNumber(+destinationAccountNum);
		const destinationUserIndex = accounts.indexOf(destinationUser);
		// Valida que existan las cuentas
		if (
			originUser &&
			destinationUser &&
			validateExistingAccounts(
				originUser,
				+originAccountNum,
				destinationUser,
				+destinationAccountNum,
			)
		) {
			// Obtiene indice de cuentas
			const originAccountIndex = getAccountIndex(originUser, +originAccountNum);
			const destinationAccountIndex = getAccountIndex(
				destinationUser,
				+destinationAccountNum,
			);

			// TODO: Validar montos suficientes
			if (validateSufficientFunds(originUser, originAccountIndex, +amount)) {
				// Realiza conversión de moneda
				const originCurrency = originUser.accounts[originAccountIndex].currency;
				const destinationCurrency =
					destinationUser.accounts[destinationAccountIndex].currency;
				const transformedAmount = applyCurrencyExange(
					+amount,
					originCurrency,
					destinationCurrency,
				);

				// Realiza operación
				accounts[originUserIndex].accounts[originAccountIndex].balance -= +amount;
				accounts[destinationUserIndex].accounts[
					destinationAccountIndex
				].balance += +transformedAmount;

				// Retorna nuevo activeUser info
				res.status(200).json(accounts[originUserIndex]);
			} else {
				res.status(412).send("Insufficient funds to perform operation on origin account");
			}
		} else {
			res.status(404).send("Account(s) not found");
		}
	},
);

server.get("/v1/accounts/operations/getexangerate", getCurrencyExange, (req, res) => {
	res.status(200).json(currencyExange);
});

// UTILS

function validateAuth(req, res, next) {
	const { dni } = req.body;
	const user = findUser(dni);
	if (user.isAuth) {
		next();
	} else {
		res.status(403).send("403 - Forbidden");
	}
}
function validateExistingUser(req, res, next) {
	const { dni } = req.body;
	const existingUser = findUser(dni, res);
	if (!existingUser) {
		next();
	} else {
		res.status(409).json("User already exists");
	}
}
function findUser(userDni, res) {
	const foundUser = userDb.find(user => +user.dni === +userDni);
	if (foundUser) {
		return foundUser;
	} else {
		return false;
	}
}
function findUserData(userDni) {
	const foundData = accounts.find(accounts => +accounts.dni === +userDni);
	return foundData;
}
function userLogin(req, res, next) {
	const { dni, password } = req.body;
	const existingUser = findUser(dni);
	if (existingUser) {
		const userPassword = existingUser.password;
		if (password === userPassword) {
			const userData = findUserData(dni);
			existingUser.isAuth = true;
			req.userData = userData;
			next();
		} else {
			res.status(401).json("Wrong password");
		}
	} else {
		res.status(404).json("User does not exists");
	}
}
function createAccount(dni, fullname) {
	const newAccount = {
		fullname: fullname,
		dni: dni,
		accounts: [
			{
				accountNumber: generateNewAccountNumber(),
				currency: "$",
				balance: 0,
				extractionLimit: 1000,
			},
			{
				accountNumber: generateNewAccountNumber(),
				currency: "US$",
				balance: 0,
				extractionLimit: 1000,
			},
		],
	};
	accounts.push(newAccount);
}
function generateNewAccountNumber() {
	return Math.floor(Math.random() * 100000000);
}
function getActiveUser(req, res, next) {
	const { userID } = req.body;
	const activeUser = accounts.find(account => account.dni === userID);
	const activeUserIndex = accounts.indexOf(activeUser);
	if (activeUserIndex !== -1) {
		res.locals.activeUser = activeUser;
		res.locals.activeUserIndex = activeUserIndex;
		next();
	} else {
		res.status(404).send("Account not found");
	}
}
function validateAmount(req, res, next) {
	const { amount } = req.body;
	return amount > 0 ? next() : res.status(400).send("Invalid amount for operation");
}
function validateExistingAccounts(
	originUser,
	originAccountNum,
	destinationUser,
	destinationAccountNum,
) {
	const originAccountValidation = originUser.accounts.filter(
		acc => acc.accountNumber === originAccountNum,
	);
	const destinationAccountValidation = destinationUser.accounts.filter(
		acc => acc.accountNumber === destinationAccountNum,
	);
	return !!originAccountValidation.length && !!destinationAccountValidation.length;
}
function validateSufficientFunds(activeUser, originAccountIndex, amount) {
	return activeUser.accounts[originAccountIndex].balance - amount >= 0 ? true : false;
}
function applyCurrencyExange(amount, originCurrency, destinationCurrency) {
	if (originCurrency !== destinationCurrency) {
		return originCurrency === "US$"
			? amount * currencyExange.US$
			: amount / currencyExange.$;
	} else {
		return amount;
	}
}
function getAccountFromAccountNumber(accountNumber) {
	return accounts.filter(account =>
		account.accounts.find(acc => acc.accountNumber === +accountNumber),
	)[0];
}
function getAccountIndex(activeUser, accountNumber) {
	return activeUser.accounts.indexOf(
		activeUser.accounts.find(acc => acc.accountNumber === +accountNumber),
	);
}
function validateEndAccount(inputAccount, activeUser) {
	const accountFound = activeUser.accounts.filter(
		account => account.accountNumber === +inputAccount,
	);
	return !!accountFound.length;
}
async function getCurrencyExange(req, res, next) {
	let d = new Date();
	let dateParam = String(d.getFullYear()) + "-" + String(d.getMonth() + 1);
	let url = `https://apis.datos.gob.ar/series/api/series/?ids=168.1_T_CAMBIOR_D_0_0_26&start_date=${dateParam}&limit=1`;
	try {
		const response = await axios.get(url);
		const data = response.data;
		const currentRate = data.data[0][1];
		currencyExange.US$ = currentRate;
		currencyExange.$ = currentRate;
		currencyExange.lastUpdated = new Date();
		next();
	} catch (error) {
		res.status(400).send("Cannot get current exange rate. Try again later");
	}
}

// ERROR DETECTION
server.use((err, req, res, next) => {
	if (!err) return next();
	console.log("An error has occurred", err);
	res.status(500).send("Error");
});
