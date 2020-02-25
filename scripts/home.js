
// Dabatase

let activeUser = {};

let userDb = [
	{
		dni: "30111000",
		password: "pedrogato123"
	},
	{
		dni: "20999111",
		password: "marioperro123"
	}
];

let accounts = [
	{
		fullname: "Iván Canga",
		dni: "30111000",
		accounts: [
			{
				accountNumber: 111111,
				accountType: "CA",
				currency: "$",
				balance: 10000,
				extractionLimit: 1000
			},
			{
				accountNumber: 222222,
				accountType: "CC",
				currency: "US$",
				balance: 500,
				extractionLimit: 1000
			}
		]
	},
	{
		fullname: "Pedro Gato",
		dni: "20999111",
		accounts: [
			{
				accountNumber: 111111,
				accountType: "CA",
				currency: "$",
				balance: 10000,
				extractionLimit: 1000
			},
			{
				accountNumber: 222222,
				accountType: "CC",
				currency: "US$",
				balance: 500000,
				extractionLimit: 1000
			}
		]
	}
];

const name = accounts[0].fullname;
const ca = accounts[0].accounts[0];
const cc = accounts[1].accounts[1];

document.getElementById("cajaAhorro").innerHTML = ca.balance;
document.getElementById("cuentaCorriente").innerHTML = cc.balance;
document.getElementById("name").innerHTML = name;


const ingresaDinero = (event) => {
    event.preventDefault();
    let amount = document.getElementById("ingresaAmount").value;

    let bodyPut = {
        amount: amount
    }

    console.log(bodyPut);

    // fetch("/transfInterna",{
    //     method = "PUT",
    //     body = bodyPut
    // })
    // .then(response => {
    //     if(response.status === 200) return console.log("Ingreso de dinero realizado." + response);
    // })
};

document.getElementById("btn-transfInterna").addEventListener('click', ingresaDinero);

