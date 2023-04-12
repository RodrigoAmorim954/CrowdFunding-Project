const { deployments, getNamedAccounts, network, ethers } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("CrowdFunding", function () {
          let crowdfunding
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1")

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer // or await ethers.getSigners()
              await deployments.fixture(["all"]) // run our entire deploy folder as many tags as we want
              crowdfunding = await ethers.getContract("CrowdFunding", deployer) // We take the contract because we already had deployed with the codeline above
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("Constructor", function () {
              it("Sets the aggregator address correctly", async () => {
                  // If the test gets an error, change the "ethers" version on package.json with the version ^5.7.2",
                  const answer = await crowdfunding.getPriceFeed() // then, type yarn on the terminal so can be downgrade
                  assert.equal(answer, mockV3Aggregator.address)
              })
          })

          describe("fund", function () {
              it("Fails if we don't send enough ether", async () => {
                  await expect(
                      crowdfunding.fund()
                  ).to.be.revertedWithCustomError(
                      crowdfunding,
                      "CrowdFunding__NotEnoughEther"
                  )
              })

              it("Updates the amount funded data structured", async () => {
                  await crowdfunding.fund({ value: sendValue })
                  const answer = await crowdfunding.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(answer.toString(), sendValue)
              })

              it("Adds funder to array of funders", async () => {
                  await crowdfunding.fund({ value: sendValue })
                  const answer = await crowdfunding.getFunders(0)
                  assert.equal(answer, deployer)
              })
          })

          describe("withdraw", function () {
              beforeEach(async () => {
                  await crowdfunding.fund({ value: sendValue })
              })

              it("Withdraw ETH from a single user", async () => {
                  // Arange
                  const startingContractBalance =
                      await ethers.provider.getBalance(crowdfunding.address)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Act
                  const txResponse = await crowdfunding.withdraw()
                  const txReceipt = await txResponse.wait()
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingContractBalance =
                      await ethers.provider.getBalance(crowdfunding.address)
                  const endindDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingContractBalance, 0)
                  assert.equal(
                      endindDeployerBalance.add(gasCost).toString(),
                      startingContractBalance
                          .add(startingDeployerBalance)
                          .toString()
                  )
              })

              it("It allows us to withdraw with multiple funders", async () => {
                  const accounts = await ethers.getSigners()
                  for (i = 1; i < 6; i++) {
                      const crowdfundingConnectContract =
                          await crowdfunding.connect(accounts[i])
                      await crowdfundingConnectContract.fund({
                          value: sendValue,
                      })
                  }

                  const startingContractBalance =
                      await ethers.provider.getBalance(crowdfunding.address)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Act
                  const txResponse = await crowdfunding.withdraw()
                  const txReceipt = await txResponse.wait()
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingContractBalance =
                      await ethers.provider.getBalance(crowdfunding.address)
                  const endindDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingContractBalance, 0)
                  assert.equal(
                      endindDeployerBalance.add(gasCost).toString(),
                      startingContractBalance
                          .add(startingDeployerBalance)
                          .toString()
                  )

                  await expect(crowdfunding.getFunders(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await crowdfunding.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("Only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const AtackerConnectContract = await crowdfunding.connect(
                      accounts[1]
                  )

                  await expect(
                      AtackerConnectContract.withdraw()
                  ).to.be.revertedWithCustomError(
                      crowdfunding,
                      "CrowdFunding__NotOwner"
                  )
              })
          })
      })
