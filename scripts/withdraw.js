const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const crowdfunding = await ethers.getContract("CrowdFunding", deployer)
    console.log(`Got contract CrowdFunding at ${crowdfunding.address}`)
    console.log("Withdrawing from contract...")

    const txResponse = await crowdfunding.withdraw()
    txResponse.wait(1)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
