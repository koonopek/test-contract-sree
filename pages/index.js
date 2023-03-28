import { useEffect, useRef, useState } from 'react'
import { WarpFactory } from 'warp-contracts'
import { DeployPlugin } from 'warp-contracts-plugin-deploy'
import { WebBundlr } from '@bundlr-network/client'
import initialState from '../initialState.json'
import Arweave from 'arweave'
import { ethers } from 'ethers'

export default function Home() {
  const warpRef = useRef()
  const [contractId, setContractId] = useState()

  useEffect(() => {
    const warp = WarpFactory.forMainnet({ dbLocation: '', inMemory: true }).use(new DeployPlugin());
    warpRef.current = warp

    setContractId(localStorage.getItem('contract-id'))
  }, [])

  const deploy = async () => {
    const sourceId = 'YaC9_fH46hY9C5iFrNkEokTKl8ds6Rn5xzkzHq8xYk0' //`w2Ae8elQ0qVy2Ya82qthKn3FHfwTnTlpxzycT1OOAoc`

    window.ethereum.request({ method: 'eth_requestAccounts' })

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const bundlr = new WebBundlr("https://node2.bundlr.network", "arbitrum", provider);
    await bundlr.ready()

    const publicKey = bundlr.getSigner().publicKey
    const ownerHash = await Arweave.crypto.hash(publicKey);
    // const owner = Arweave.utils.bufferTob64Url(ownerHash);
    const owner = await provider.getSigner().getAddress();

    const contractUpload = await bundlr.upload('', {
      tags: [
        {
          name: 'Init-State', value: JSON.stringify({
            description: 'This is the test of Atomic Asset token',
            symbol: 'atomic-asset-test',
            name: 'Sample Atomic Asset token',
            decimals: 2,
            totalSupply: 100,
            balances: {
              [owner]: 100,
            },
            allowances: {},
            owner: owner,
          })
        },
        { name: 'App-Name', value: 'SmartWeaveContract' },
        { name: 'App-Version', value: '0.3.0' },
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Contract-Src', value: sourceId }
      ]
    })

    const contractDeploy = await warpRef.current.register(contractUpload.id, 'node2')

    localStorage.setItem('contract-id', contractDeploy.contractTxId)

    setContractId(contractDeploy.contractTxId)
  }

  const test = async () => {
    const { evmSignature } = await import('warp-contracts-plugin-signature')

    const contract = warpRef.current.contract(contractId).connect({ type: 'ethereum', signer: evmSignature })

    await contract.writeInteraction({ function: "transfer", amount: 10, to: 'bcc' })

    const state = (await contract.readState()).cachedValue.state

    console.log(state)
  }

  return (
    <>
      {contractId ?? 'contract not deployed yet'}
      <button onClick={deploy}>deploy contract</button>
      <button onClick={test}>test contract</button>
    </>
  )
}
