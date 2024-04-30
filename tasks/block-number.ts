import { HardhatRuntimeEnvironment } from "hardhat/types"
import { task } from "hardhat/config"

task("block-number", "Prints the current block number").setAction(
    async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
        const provider = hre.ethers.provider
        const blockNumber = await provider.getBlockNumber()
        console.log("Current block number:", blockNumber)
    }
)
