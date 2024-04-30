import { getNamedAccounts, ethers } from "hardhat"
import { FundMe } from "../typechain-types"

async function main() {
    const deployer = (await getNamedAccounts()).deployer
    const fundMe: FundMe = await ethers.getContract("FundMe")
    console.log("withdrawing...")
    console.log(`contract address: ${await fundMe.getAddress()}`)
    const transactionResponse = await fundMe.withdraw()
    await transactionResponse.wait(1)
    console.log("got it back.")
    const fundMeBalance = ethers.formatEther(
        await ethers.provider.getBalance(fundMe.getAddress())
    )
    const deployerBalance = ethers.formatEther(
        await ethers.provider.getBalance(deployer)
    )
    console.log(`deployer balance: ${deployerBalance}`)
    console.log(`fundMe balance: ${fundMeBalance}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
