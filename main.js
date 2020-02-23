const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const server = express();

let accounts = [
	{
		fullname: "Pedro Gato",
		dni: "30111000",
		accounts: [
			{
				accountNumber: 111111,
				currency: "$",
				balance: 10000.0,
				extractionLimit: 1000
			},
			{
				accountNumber: 222222,
				currency: "US$",
				balance: 500.0,
				extractionLimit: 1000
			}
		]
	},
	{
		fullname: "Mario Perro",
		dni: "30111001",
		accounts: [
			{
				accountNumber: 333333,
				currency: "$",
				balance: 10000.0,
				extractionLimit: 1000
			},
			{
				accountNumber: 444444,
				currency: "US$",
				balance: 500.0,
				extractionLimit: 1000
			}
		]
	}
];
const currencyExange = {
	$: 58.5,
	US$: 63.5
};

server.listen(3000, () => {
	console.log("Server started");
});

server.use(bodyParser.json(), cors());

// Register new user
server.post("/register", validateExistingUser, (req, res) => {
	// TODO: Corroborar que las variables sean igual que lo que se manda desde el front
	const { dni, password, fullname } = req.body; /// ver nmombre de user
	userDb.push({ dni, password });
	createAccount(dni, fullname);
	res.status(200).json("Usuario registrado correctamente");
});

//User login
server.post("/login", userLogin, (req, res) => {
	// TODO: Corroborar que las variables sean igual que lo que se manda desde el front
	res.status(200).json(activeUser);
});

// InternalTransference
// Validación de cuentas internas (que existan)
server.put("/account/operations/internaltransfer", getActiveUser, validateAmount, (req, res) => {
	// Agregar middleware VALIDARCUENTAORIGEN/TOKEN
	const { amount, originAccountNum, destinationAccountNum } = req.body;
	const { activeUserIndex, activeUser } = res.locals;
	// Obtiene indice de cuentas
	const destinationAccountIndex = getAccountIndex(activeUser, +destinationAccountNum);
	const originAccountIndex = getAccountIndex(activeUser, +originAccountNum);
	if (validateExistingAccounts(activeUser, +originAccountNum, activeUser, +destinationAccountNum)) {
		// TODO: Validar montos suficientes
		if (validateSufficientFunds(activeUser, originAccountIndex, +amount)) {
			// Realiza conversión de moneda
			const originCurrency = activeUser.accounts[originAccountIndex].currency;
			const destinationCurrency = activeUser.accounts[destinationAccountIndex].currency;
			const transformedAmount = applyCurrencyExange(+amount, originCurrency, destinationCurrency);

			// Realiza operación
			accounts[activeUserIndex].accounts[originAccountIndex].balance -= +amount;
			accounts[activeUserIndex].accounts[destinationAccountIndex].balance += +transformedAmount;

			// Retorna nuevo activeUser info
			res.status(200).json(accounts[activeUserIndex]);
		} else {
			res.status(412).send("Insufficient funds to perform operation on origin account");
		}
	} else {
		res.status(404).send("Account(s) not found");
	}
});

// ExternalTransference
server.put("/account/operations/externaltransfer", getActiveUser, validateAmount, (req, res) => {
	// Agregar middleware VALIDARCUENTAORIGEN/TOKEN
	// Obtiene datos del body + cuenta origen e Index de cuenta origen desde el res.locals
	const { amount, destinationAccountNum, originAccountNum } = req.body;
	const { activeUserIndex: originUserIndex, activeUser: originUser } = res.locals;
	// Obtiene datos de la cuenta destino
	const destinationUser = getAccountFromAccountNumber(+destinationAccountNum);
	const destinationUserIndex = accounts.indexOf(destinationUser);
	// Valida que existan las cuentas
	console.log(originUser, destinationUser);
	if (
		originUser &&
		destinationUser &&
		validateExistingAccounts(originUser, +originAccountNum, destinationUser, +destinationAccountNum)
	) {
		// Obtiene indice de cuentas
		const originAccountIndex = getAccountIndex(originUser, +originAccountNum);
		const destinationAccountIndex = getAccountIndex(destinationUser, +destinationAccountNum);

		// TODO: Validar montos suficientes
		if (validateSufficientFunds(originUser, originAccountIndex, +amount)) {
			// Realiza conversión de moneda
			const originCurrency = originUser.accounts[originAccountIndex].currency;
			const destinationCurrency = destinationUser.accounts[destinationAccountIndex].currency;
			const transformedAmount = applyCurrencyExange(+amount, originCurrency, destinationCurrency);

			// Realiza operación
			accounts[originUserIndex].accounts[originAccountIndex].balance -= +amount;
			accounts[destinationUserIndex].accounts[destinationAccountIndex].balance += +transformedAmount;

			// Retorna nuevo activeUser info
			res.status(200).json(accounts[originUserIndex]);
		} else {
			res.status(412).send("Insufficient funds to perform operation on origin account");
		}
	} else {
		res.status(404).send("Account(s) not found");
	}
});

// UTILS
function validateExistingUser(req, res, next) {
	const { dni } = req.body;
	const existingUser = findUser(dni, res);
	if (!existingUser) {
		next();
	} else {
		res.status(500).send("Usuario Existente. Por favor inicie sesión");
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
	const userPassword = existingUser.password;
	if (password === userPassword) {
		const userData = findUserData(dni);
		activeUser = userData;
		next();
	} else {
		res.status(500).send("Contraseña Incorrecta. Intente nuevamente");
	}
}
function createAccount(dni, fullname) {
	const newAccount = {
		fullname: fullname,
		dni: dni,
		accounts: [
			{
				accountNumber: generateNewAccountNumber,
				accountType: "CA",
				currency: "$",
				balance: 0,
				extractionLimit: 1000
			}
		]
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
function validateExistingAccounts(originUser, originAccountNum, destinationUser, destinationAccountNum) {
	const originAccountValidation = originUser.accounts.filter(acc => acc.accountNumber === originAccountNum);
	const destinationAccountValidation = destinationUser.accounts.filter(
		acc => acc.accountNumber === destinationAccountNum
	);
	return !!originAccountValidation.length && !!destinationAccountValidation.length;
}
function validateSufficientFunds(activeUser, originAccountIndex, amount) {
	return activeUser.accounts[originAccountIndex].balance - amount >= 0 ? true : false;
}
function applyCurrencyExange(amount, originCurrency, destinationCurrency) {
	if (originCurrency !== destinationCurrency) {
		return originCurrency === "US$" ? amount * currencyExange.US$ : amount / currencyExange.$;
	} else {
		return amount;
	}
}
function getAccountFromAccountNumber(accountNumber) {
	return accounts.filter(account => account.accounts.find(acc => acc.accountNumber === accountNumber))[0];
}
function getAccountIndex(activeUser, accountNumber) {
	return activeUser.accounts.indexOf(activeUser.accounts.find(acc => acc.accountNumber === accountNumber));
}

// ERROR DETECTION
server.use((err, req, res, next) => {
	if (!err) return next();
	console.log("An error has occurred", err);
	res.status(500).send("Error");
});
