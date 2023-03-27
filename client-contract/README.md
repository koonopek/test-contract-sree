# XDrive Contract
Warp smart contract for XDrive that evaluates state on the dapp

#### Building and testing
building wasm
```shell
npm run build:wasm
```

testing (arlocal)
```shell
npm run test
```

#### Deploying
first copy your wallet jwk to `/data`, file name should be `wallet.json`

deploy to testnet
```shell
npm run deploy:test
```

deploy to mainnet
```shell
npm run deploy:prod
```

deployed contract source id will be in `/data/contract_deployment.txt`