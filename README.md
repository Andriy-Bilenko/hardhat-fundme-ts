# Hardhat fundme in typescript

This project demonstrates a basic crowdfunding smart contract written in solidity, deployed with typescript.
Includes unit and staging tests, coverage, gas reports, solidity code verification on etherscan.

after creating your own `.env` file with specified SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY, COINMARKETCAP_API_KEY you may want to try deploying the contract with `yarn hardhat deploy` or specify the network where to run: 
1) on sepolia testnet `yarn hardhat deploy --network sepolia`
2) on local node (after running `yarn hardhat node` on other terminal instance) `yarn hardhat deploy --network localhost`
3) on hardhat (default, as if not specifying) `yarn hardhat deploy --network hardhat`

You can also run 
- tests: `yarn test` or `yarn test:staging`
- tasks: `yarn hardhat block-number`
- scripts: `yarn hardhat run scripts/fund.ts --network sepolia`

check coverage: `yarn coverage`

if something doesn't work you may want to dig my messy personal notes in `personal_guides.md`
