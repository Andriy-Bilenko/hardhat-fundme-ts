import { assert, expect } from "chai"
import { network, deployments, ethers, getNamedAccounts } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { FundMe, MockV3Aggregator } from "../../typechain-types"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe: FundMe
          let deployer: string //SignerWithAddress
          let mockV3Aggregator: MockV3Aggregator
          const SEND_VALUE = ethers.parseEther("1") // 10e18 , 1 ether in wei
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"]) //deploy contracts
              const fundMeAtAddress = (await deployments.get("FundMe")).address
              fundMe = await ethers.getContract("FundMe")
          })
          describe("constructor", async function () {
              it("sets the aggregator address correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  const mockV3AggregatorAddress = (
                      await deployments.get("MockV3Aggregator")
                  ).address
                  mockV3Aggregator = await ethers.getContractAt(
                      "MockV3Aggregator",
                      mockV3AggregatorAddress
                  )
                  assert.equal(response, await mockV3Aggregator.getAddress())
              })
              it("sets owner to the one who is the initial deployer", async function () {
                  const owner = await fundMe.getOwner()
                  assert.equal(deployer, owner)
              })
          })
          describe("fund() and fundersNumber()", async function () {
              it("fails if you don't send enough ETH", async function () {
                  try {
                      await fundMe.fund()
                      throw new Error("Transaction did not revert")
                  } catch (error: any) {
                      expect(error.message).to.contain(
                          "FundMe__SendingNotEnough()"
                      )
                  }
              })
              it("updates the funders data structure", async function () {
                  await fundMe.fund({ value: SEND_VALUE })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  ) //correct!
                  assert.equal(response.toString, SEND_VALUE.toString)
              })
              it("adds funder to array of funders, only once, amount funded updates", async function () {
                  let fundersLength = await fundMe.fundersNumber()
                  assert.equal(fundersLength.toString(), "0") //no funders at the start
                  assert.equal(
                      (
                          await fundMe.getAddressToAmountFunded(deployer)
                      ).toString(),
                      "0"
                  ) //nothing funded at the start

                  await fundMe.fund({ value: SEND_VALUE })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer) //deployer is the first funder
                  assert.equal(
                      (
                          await fundMe.getAddressToAmountFunded(deployer)
                      ).toString(),
                      SEND_VALUE.toString()
                  ) // registered funding 1 eth in mapping when funded 1 eth
                  fundersLength = await fundMe.fundersNumber()
                  assert.equal(fundersLength.toString(), "1") //deployer got added to funders

                  await fundMe.fund({ value: SEND_VALUE })
                  fundersLength = await fundMe.fundersNumber()
                  assert.equal(fundersLength.toString(), "1") //deployer already existed so not adding to array
                  assert.equal(
                      (
                          await fundMe.getAddressToAmountFunded(deployer)
                      ).toString(),
                      (SEND_VALUE + SEND_VALUE).toString()
                  ) // registered funding 2 eth by deployer in mapping
              })
          })
          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: SEND_VALUE })
              })
              it("withdraw ETH from a single founder", async function () {
                  //arrange
                  const startingfundMeBalance =
                      await ethers.provider.getBalance(fundMe.getAddress())
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionReceipt!
                  const gasCost = gasUsed * gasPrice
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.getAddress()
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //assert
                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      (
                          startingfundMeBalance + startingDeployerBalance
                      ).toString(),
                      (endingDeployerBalance + gasCost).toString()
                  )
              })
              it("withdraw ETH from multiple founders", async function () {
                  //arrange
                  const namedAccounts = await getNamedAccounts()
                  for (const name in namedAccounts) {
                      const account = namedAccounts[name]
                      const signer = await ethers.provider.getSigner(account)
                      const connectedContract = fundMe.connect(signer)
                      const transaction = await connectedContract.fund({
                          value: SEND_VALUE,
                      })
                      // console.log("funding transaction from ", name)
                  }
                  const startingfundMeBalance =
                      await ethers.provider.getBalance(fundMe.getAddress())
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionReceipt!
                  const gasCost = gasUsed * gasPrice
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.getAddress()
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //assert
                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      (
                          startingfundMeBalance + startingDeployerBalance
                      ).toString(),
                      (endingDeployerBalance + gasCost).toString()
                  )
                  //funders array is empty
                  const fundersLength = await fundMe.fundersNumber()
                  assert.equal(fundersLength.toString(), "0")

                  //address to amount funded mapping is zeroed
                  for (const name in namedAccounts) {
                      assert.equal(
                          (
                              await fundMe.getAddressToAmountFunded(
                                  namedAccounts[name]
                              )
                          ).toString(),
                          "0"
                      )
                  }
              })
              it("only allows the owner to withdraw", async function () {
                  const namedAccounts = await getNamedAccounts()
                  for (const name in namedAccounts) {
                      const account = namedAccounts[name]
                      const signer = await ethers.provider.getSigner(account)
                      const connectedContract = fundMe.connect(signer)
                      if (name == "deployer") {
                          try {
                              ;(await connectedContract.withdraw()).wait(1)
                              throw new Error("Transaction did not revert")
                          } catch (error: any) {
                              expect(error.message).to.contain(
                                  "Transaction did not revert"
                              )
                          }
                      } else {
                          try {
                              ;(await connectedContract.withdraw()).wait(1)
                              throw new Error("Transaction did not revert")
                          } catch (error: any) {
                              expect(error.message).to.contain(
                                  "FundMe__NotOwner()"
                              )
                          }
                      }
                  }
              })
              it("cheaper withdraw testing, only allows the owner to withdraw", async function () {
                  const namedAccounts = await getNamedAccounts()
                  for (const name in namedAccounts) {
                      const account = namedAccounts[name]
                      const signer = await ethers.provider.getSigner(account)
                      const connectedContract = fundMe.connect(signer)
                      if (name == "deployer") {
                          try {
                              ;(await connectedContract.cheaperWithdraw()).wait(
                                  1
                              )
                              throw new Error("Transaction did not revert")
                          } catch (error: any) {
                              expect(error.message).to.contain(
                                  "Transaction did not revert"
                              )
                          }
                      } else {
                          try {
                              ;(await connectedContract.cheaperWithdraw()).wait(
                                  1
                              )
                              throw new Error("Transaction did not revert")
                          } catch (error: any) {
                              expect(error.message).to.contain(
                                  "FundMe__NotOwner()"
                              )
                          }
                      }
                  }
              })
              it("cheaper withdraw testing, withdraw ETH from multiple founders", async function () {
                  //arrange
                  const namedAccounts = await getNamedAccounts()
                  for (const name in namedAccounts) {
                      const account = namedAccounts[name]
                      const signer = await ethers.provider.getSigner(account)
                      const connectedContract = fundMe.connect(signer)
                      const transaction = await connectedContract.fund({
                          value: SEND_VALUE,
                      })
                      // console.log("funding transaction from ", name)
                  }
                  const startingfundMeBalance =
                      await ethers.provider.getBalance(fundMe.getAddress())
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionReceipt!
                  const gasCost = gasUsed * gasPrice
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.getAddress()
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //assert
                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      (
                          startingfundMeBalance + startingDeployerBalance
                      ).toString(),
                      (endingDeployerBalance + gasCost).toString()
                  )
                  //funders array is empty
                  const fundersLength = await fundMe.fundersNumber()
                  assert.equal(fundersLength.toString(), "0")

                  //address to amount funded mapping is zeroed
                  for (const name in namedAccounts) {
                      assert.equal(
                          (
                              await fundMe.getAddressToAmountFunded(
                                  namedAccounts[name]
                              )
                          ).toString(),
                          "0"
                      )
                  }
              })
              it("cheaper withdraw testing, withdraw ETH from a single founder", async function () {
                  //arrange
                  const startingfundMeBalance =
                      await ethers.provider.getBalance(fundMe.getAddress())
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionReceipt!
                  const gasCost = gasUsed * gasPrice
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.getAddress()
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //assert
                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      (
                          startingfundMeBalance + startingDeployerBalance
                      ).toString(),
                      (endingDeployerBalance + gasCost).toString()
                  )
              })
          })
      })
