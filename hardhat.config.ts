import { HardhatUserConfig } from "hardhat/config";
import 'solidity-coverage'
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  defaultNetwork: `hardhat`,
  networks: {
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/{YOUR-API-KEY}`,
      accounts:[`{ACCOUNT-PRIVATE-KEY}`],
    },
    arbitrum: {
      url:"https://arb-goerli.g.alchemy.com/v2/{YOUR-API-KEY}",
      accounts: ["{ACCOUNT-PRIVATE-KEY}"],
    },
  },
};

export default config;
