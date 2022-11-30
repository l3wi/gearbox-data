const {
  CreditAccountData,
  CreditAccountWatcher,
  CreditManagerWatcher,
  IDataCompressor__factory,
  IAddressProvider__factory,
  PathFinder
} = require('@gearbox-protocol/sdk')

const { providers } = require('ethers')

const CHAIN_TYPE = process.env.CHAIN_ID != 1 ? 'Goerli' : 'Mainnet'
const ADDRESS_PROVIDER = process.env.ADDRESS_PROVIDER
const provider = new providers.AlchemyProvider('homestead', process.env.ALCHEMY)

let dataCompressorAddress = ''

let pathFinder = null

const setupWeb3 = async () => {
  // Get addresses
  const addressProvider = IAddressProvider__factory.connect(
    ADDRESS_PROVIDER,
    provider
  )
  dataCompressorAddress = await addressProvider.getDataCompressor()
  const patherFinderAddress = await addressProvider.getLeveragedActions()

  pathFinder = new PathFinder(patherFinderAddress, provider, CHAIN_TYPE)
}

const getCAs = async () => {
  if (dataCompressorAddress === '') await setupWeb3()

  // Get all live CMs
  const creditManagers = await CreditManagerWatcher.getV2CreditManagers(
    dataCompressorAddress,
    provider
  )

  // Fetch all CreditAccounts
  const caListCalls = Object.values(creditManagers).map((cm, i) =>
    CreditAccountWatcher.getOpenAccounts(cm, provider)
  )
  // Fetch and Flatten CAList
  const creditAccounts = (await Promise.all(caListCalls)).flat(1)

  // Fetch CA data
  const caData = await CreditAccountWatcher.batchCreditAccountLoad(
    creditAccounts,
    dataCompressorAddress,
    provider,
    { chunkSize: creditAccounts.length }
  )

  return { caData, creditManagers }
}

const fetchCAData = async (hash) => {
  if (dataCompressorAddress === '') await setupWeb3()

  // Fetch CA data
  const dataCompressor = IDataCompressor__factory.connect(
    dataCompressorAddress,
    provider
  )
  const cm = hash.split(':')[0]
  const borrower = hash.split(':')[1]
  const data = await dataCompressor.getCreditAccountData(cm, borrower)
  const ca = new CreditAccountData(data)

  return ca
}

module.exports = {
  provider,
  setupWeb3,
  getCAs,
  fetchCAData
}
