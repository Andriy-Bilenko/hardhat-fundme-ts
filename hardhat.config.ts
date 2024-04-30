import "@typechain/hardhat"
import "@nomiclabs/hardhat-waffle"
// import "@nomicfoundation/hardhat-toolbox"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-ethers"
import "hardhat-gas-reporter"
import "dotenv/config"
import "solidity-coverage"
import "hardhat-deploy"
import { HardhatUserConfig } from "hardhat/config"
import "./tasks/block-number"

// import "@nomicfoundation/hardhat-ethers"
import "hardhat-deploy-ethers"
// import "@nomicfoundation/hardhat-chai-matchers"

/** @type import('hardhat/config').HardhatUserConfig */

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || ""
const PRIVATE_KEY = process.env.PRIVATE_KEY || ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {},
        sepolia: {
            //added by me
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111, //find on internet
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337, //of a hardhat
        },
    },
    // solidity: "0.8.8",
    solidity: {
        compilers: [
            {
                version: "0.8.8",
            },
            // {
            //     version: "0.6.6",//doesn't work together with 0.8
            //     settings: {},
            // },
        ],
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY, //commented to not jerk it unnecessarily
        token: "ETH",
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user1: {
            default: 1,
        },
        user2: {
            default: 2,
        },
        user3: {
            default: 3,
        },
        user4: {
            default: 4,
        },
        user5: {
            default: 5,
        },
    },
}

export default config
