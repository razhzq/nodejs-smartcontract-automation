"use strict";
const Contract = require("@truffle/contract");
const WalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const cron = require("node-cron"); 
const path = require("path");
const fs = require("fs");

const axios = require('axios');

require("dotenv").config();
const RPC_URL = process.env.RPC_URL;
const contractAddress = process.env.CONTRACT_ADDRESS;

const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));



const getPrice = async () => {
    try {
        const res = await axios.get('http://146.190.222.139/crypto/btc')
        let data = res.data;
        let price = data["BTC/USD"];

        return price 
    } catch (error) {
        console.log(error);
    }
    
}


const execute = async () =>  {
    const abiPath = path.resolve("abi/BTC.json");  
    const rawData = fs.readFileSync(abiPath);  
    const contractAbi = JSON.parse(rawData);

    const contract = Contract({ abi: contractAbi.abi });  
    const provider = new WalletProvider(process.env.PRIVATE_KEY, RPC_URL);  
    contract.setProvider(provider);  
    const contractInstance = await contract.at(contractAddress);


    

    cron.schedule('*/10 * * * * *', async () => {
        try {

            const price =  await getPrice();
            const conv_price = price * 100000000
                        
            await contractInstance.setPairInfo(conv_price,{
              from: web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY).address,
              gasPrice: '60000000000',
              transactionBlockTimeout: 200

            })
          
        } catch (error) {
           exit
        }
      })

}

execute();