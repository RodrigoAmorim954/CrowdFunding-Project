const { assert } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("CrowdFunding", function () {
          let deployer
          let crowdfunding
          const sendValue = ethers.utils.parseEther("0.1")

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              crowdfunding = await ethers.getContract("CrowdFunding", deployer)
          })

          it("allows people to fund and withdraw", async () => {
              const fundTxResponse = await crowdfunding.fund({
                  value: sendValue,
              })
              fundTxResponse.wait(1)

              const withdrawTxResponse = await crowdfunding.withdraw()
              withdrawTxResponse.wait(1)

              endingContractBalance = await ethers.provider.getBalance(
                  crowdfunding.address
              )
              console.log(
                  endingContractBalance.toString() +
                      " Should equal 0, runing assert equal..."
              )

              assert.equal(endingContractBalance.toString(), "0")
          })
      })
