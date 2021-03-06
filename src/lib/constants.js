export const EPOCH = Date.UTC(2017, 8, 2, 17, 0, 0, 0)

export const Transactions = {
  SEND: 0,
  SIGNATURE: 1,
  DELEGATE: 2,
  VOTE: 3,
  MULTI: 4,
  DAPP: 5,
  IN_TRANSFER: 6,
  OUT_TRANSFER: 7,
  CHAT_MESSAGE: 8,
  STATE: 9
}

export const Cryptos = {
  ADM: 'ADM',
  ETH: 'ETH'
}

/** Number of decimal places for the different crypto amounts */
export const CryptoAmountPrecision = {
  ADM: 2,
  ETH: 6
}

/** Fees for the misc ADM operations */
export const Fees = {
  /** Storing a value into the KVS */
  KVS: 0.001,
  /** Transfering tokens */
  TRANSFER: 0.5
}
