const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const crowdfunding = await ethers.getContract("CrowdFunding", deployer)
    console.log(`Got contract CrowdFunding at ${crowdfunding.address}`)
    console.log("Funding contract...")

    const txResponse = await crowdfunding.fund({
        value: ethers.utils.parseEther("0.1"),
    })
    await txResponse.wait(1)
    console.log("Funded")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
