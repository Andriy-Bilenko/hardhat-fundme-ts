import { network, deployments, ethers, getNamedAccounts } from "hardhat"
import { FundMe, MockV3Aggregator } from "../../typechain-types"
import { developmentChains } from "../../helper-hardhat-config"
import { assert, expect } from "chai"

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe: FundMe
          let deployer: string
          const SEND_VALUE = ethers.parseEther("0.1") // 10e18 , 1 ether in wei
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"]) //deploy contracts
              const fundMeAtAddress = (await deployments.get("FundMe")).address
              fundMe = await ethers.getContract("FundMe")
          })
          it("allows people to fund and withdraw", async function () {
              await fundMe.fund({ value: SEND_VALUE })
              await fundMe.withdraw()
              const endingFundMeBalance = await ethers.provider.getBalance(
                  await fundMe.getAddress()
              )
              assert.equal(endingFundMeBalance.toString(), "0")
          })
      })
