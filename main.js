const express = require("express");
const bodyParser = require("body-parser");
const server = express();

let accounts = [
	{
		fullname: "Pedro Gato",
		dni: "30111000",
		accounts: [
			{
				accountNumber: 111111,
				accountType: "CA",
				currency: "$",
				balance: 10000.0,
				extractionLimit: 1000
			},
			{
				accountNumber: 222222,
				accountType: "CC",
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
				accountType: "CA",
				currency: "$",
				balance: 10000.0,
				extractionLimit: 1000
			},
			{
				accountNumber: 444444,
				accountType: "CC",
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

server.use(bodyParser.json());

// InternalTransference
server.put("/account/operations/internaltransfer", validateExistingUser, (req, res) => {
	// Agregar middleware VALIDARCUENTAORIGEN/TOKEN
	const { amount, destinationAccountNum, originAccountNum } = req.body;
	const { activeUserIndex, activeUser } = res.locals;
	// Valida que existan las cuentas
	// Duplicado con getAccountIndex -> aprovechar validación
	if (validateEndAccount(destinationAccountNum, activeUser) && validateEndAccount(originAccountNum, activeUser)) {
		// Obtiene indice de cuentas
		const destinationAccountIndex = getAccountIndex(activeUser, destinationAccountNum);
		const originAccountIndex = getAccountIndex(activeUser, originAccountNum);

		// TODO: Validar montos suficientes
		if (validateSufficientFunds(activeUser, originAccountIndex, +amount)) {
			// Realiza conversión de moneda
			const originCurrency = accounts[activeUserIndex].accounts[originAccountIndex].currency;
			const destinationCurrency = accounts[activeUserIndex].accounts[destinationAccountIndex].currency;
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
		res.status(404).send("Account not found");
	}
});

// UTILS
function validateExistingUser(req, res, next) {
	const { userID } = req.body;
	const activeUser = accounts.find(account => account.dni === userID);
	const activeUserIndex = accounts.indexOf(activeUser);
	if (activeUserIndex !== -1) {
		res.locals.activeUser = activeUser;
		res.locals.activeUserIndex = activeUserIndex;
		next();
	} else {
		res.status(404).send("Origin account not found");
	}
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
function getAccountIndex(activeUser, accountNumber) {
	return activeUser.accounts.indexOf(activeUser.accounts.find(acc => acc.accountNumber === +accountNumber));
}
function validateEndAccount(inputAccount, activeUser) {
	const accountFound = activeUser.accounts.filter(account => account.accountNumber === +inputAccount);
	return !!accountFound.length;
}

// ERROR DETECTION
server.use((err, req, res, next) => {
	if (!err) return next();
	console.log("An error has occurred", err);
	res.status(500).send("Error");
});
