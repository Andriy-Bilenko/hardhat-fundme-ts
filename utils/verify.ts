import { run } from "hardhat"

async function verify(contractAddress: String, args: any[]) {
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("already verified")
        } else {
            console.log(`contract verification error: ${e.message}`)
        }
    }
}

export default verify
