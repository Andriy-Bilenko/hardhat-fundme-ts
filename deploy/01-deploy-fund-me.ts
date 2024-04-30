
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../utils/verify"
import { networkConfig, developmentChains } from "../helper-hardhat-config"

const deployFundMe: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId!

    let ethUsdPriceAddress: String
    if (developmentChains.includes(network.name)) {
        //on local dev chain
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceAddress = ethUsdAggregator.address
    } else {
        //on testnet
        ethUsdPriceAddress = networkConfig[network.name]["ethUsdPriceFeed"]!
    }

    //when going for localhost or hardhat we want to use a mock
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceAddress],
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        //verify
        await verify(fundMe.address, [ethUsdPriceAddress])
    }
    log("=====================================")
}

export default deployFundMe
deployFundMe.tags = ["all", "fundMe"]
