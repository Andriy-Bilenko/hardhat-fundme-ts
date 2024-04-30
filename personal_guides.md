yarn init
yarn add --dev hardhat
yarn hardhat // and set project as ts
yarn add --dev @typechain/ethers-v5 @typechain/hardhat @types/chai @types/node @types/mocha ts-node typechain typescript

//change tsconfig.json

yarn add --dev @nomiclabs/hardhat-etherscan hardhat-deploy // to fix hardhat.config.ts
yarn add --dev @nomiclabs/hardhat-ethers @types/sinon-chai ethereum-waffle @nomiclabs/hardhat-waffle dotenv @chainlink/contracts

nvm install v18.18.2

yarn hardhat compile
yarn hardhat deploy --network sepolia

//setting typechains for ts to know functions of our contract:
yarn
yarn hardhat typechain

### tasks

yarn hardhat block-numbers
//trying to fix this line above:
yarn add --dev hardhat @nomiclabs/hardhat-ethers ethers @nomiclabs/hardhat-waffle @types/node typescript

### unit tests

yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers // to fix ethers.getContract() in unit tests

yarn add --dev @nomiclabs/hardhat-ethers

yarn add --dev hardhat-deploy-ethers
yarn add --dev @nomicfoundation/hardhat-ethers

yarn hardhat typechain

yarn add --dev ethers

### end unit tests

yarn add --dev @nomicfoundation/hardhat-toolbox
yarn remove @nomiclabs/hardhat-waffle ethereum-waffle // for waffle and unit testing without thrown errors cuz of require keyword
yarn add --dev @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ignition-ethers @nomicfoundation/hardhat-network-helpers @nomicfoundation/hardhat-chai-matchers@1 @nomiclabs/hardhat-ethers @nomiclabs/hardhat-etherscan chai@4 ethers@5 hardhat-gas-reporter solidity-coverage @typechain/hardhat typechain @typechain/ethers-v6
yarn add --dev @nomicfoundation/hardhat-chai-matchers

### after tests and all those things:

yarn hardhat node
yarn hardhat run scripts/fund.ts --network localhost

//after changes in package.json can do
yarn test // instead of yarn hardhat test
yarn coverage
