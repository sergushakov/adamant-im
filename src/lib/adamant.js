/* eslint-disable no-redeclare */
'use strict'

var sodium = require('sodium-browserify-tweetnacl')
var crypto = require('crypto')
var Mnemonic = require('bitcore-mnemonic')
var bignum = require('./bignumber.js')
var ByteBuffer = require('bytebuffer')
const constants = require('./constants.js')

/**
 * Crypto functions that implements sodium.
 * @memberof module:helpers
 * @requires sodium
 * @namespace
 */
var adamant = {}

/**
 * Converts provided `time` to Adamant's epoch timestamp
 * @param {number=} time timestamp to convert
 * @returns {number}
 */
adamant.epochTime = function (time) {
  if (!time) {
    time = Date.now()
  }

  return Math.floor((time - constants.EPOCH) / 1000)
}

/**
 * Parses URI, return false on fails or object with fields if valid
 * @param uri
 * @returns {*}
 */
adamant.parseURI = function (uri) {
  var r = /^adm:(U[0-9]{17,22})(?:\?(.*))?$/
  var match = r.exec(uri)
  if (!match) {
    return false
  }
  var parsed = { url: uri }
  if (match[2]) {
    var queries = match[2].split('&')
    for (var i = 0; i < queries.length; i++) {
      var query = queries[i].split('=')
      if (query.length === 2) {
        parsed[query[0]] = decodeURIComponent(query[1].replace(/\+/g, '%20'))
      }
    }
  }
  parsed.address = match[1]
  return parsed
}

/**
 * Creates a hash based on a passphrase.
 * @param {string} passPhrase
 * @return {string} hash
 */
adamant.createPassPhraseHash = function (passPhrase) {
  var secretMnemonic = new Mnemonic(passPhrase, Mnemonic.Words.ENGLISH)
  return crypto.createHash('sha256').update(secretMnemonic.toSeed().toString('hex'), 'hex').digest()
}

/**
 * Creates a keypar based on a hash.
 * @implements {sodium}
 * @param {hash} hash
 * @return {Object} publicKey, privateKey
 */
adamant.makeKeypair = function (hash) {
  var keypair = sodium.crypto_sign_seed_keypair(hash)

  return {
    publicKey: keypair.publicKey,
    privateKey: keypair.secretKey
  }
}
/**
 * Creates hash based on transaction bytes.
 * @implements {getBytes}
 * @implements {crypto.createHash}
 * @param {transaction} trs
 * @return {hash} sha256 crypto hash
 */
adamant.getHash = function (trs) {
  return crypto.createHash('sha256').update(this.getBytes(trs)).digest()
}

/**
 * Calls `getBytes` based on trs type (see privateTypes)
 * @see privateTypes
 * @implements {ByteBuffer}
 * @param {transaction} trs
 * @param {boolean} skipSignature
 * @param {boolean} skipSecondSignature
 * @return {!Array} Contents as an ArrayBuffer.
 * @throws {error} If buffer fails.
 */

adamant.getBytes = function (transaction) {
  var skipSignature = false
  var skipSecondSignature = true
  var assetSize = 0
  var assetBytes = null

  switch (transaction.type) {
    case constants.Transactions.SEND:
      break
    case constants.Transactions.CHAT_MESSAGE:
      assetBytes = this.chatGetBytes(transaction)
      assetSize = assetBytes.length
      break
    case constants.Transactions.STATE:
      assetBytes = this.stateGetBytes(transaction)
      assetSize = assetBytes.length
      break
    case constants.Transactions.DELEGATE:
      assetBytes = this.delegateGetBytes(transaction)
      assetSize = assetBytes.length
      break
    case constants.Transactions.VOTE:
      assetBytes = this.voteGetBytes(transaction)
      assetSize = assetBytes.length
      break
    default:
      alert('Not supported yet')
  }

  var bb = new ByteBuffer(1 + 4 + 32 + 8 + 8 + 64 + 64 + assetSize, true)

  bb.writeByte(transaction.type)
  bb.writeInt(transaction.timestamp)

  var senderPublicKeyBuffer = new Buffer(transaction.senderPublicKey, 'hex')
  for (var i = 0; i < senderPublicKeyBuffer.length; i++) {
    bb.writeByte(senderPublicKeyBuffer[i])
  }

  if (transaction.requesterPublicKey) {
    var requesterPublicKey = new Buffer(transaction.requesterPublicKey, 'hex')

    for (var i = 0; i < requesterPublicKey.length; i++) {
      bb.writeByte(requesterPublicKey[i])
    }
  }

  if (transaction.recipientId) {
    var recipient = transaction.recipientId.slice(1)
    // eslint-disable-next-line new-cap
    recipient = new bignum(recipient).toBuffer({size: 8})

    for (i = 0; i < 8; i++) {
      bb.writeByte(recipient[i] || 0)
    }
  } else {
    for (i = 0; i < 8; i++) {
      bb.writeByte(0)
    }
  }

  bb.writeLong(transaction.amount)

  if (assetSize > 0) {
    for (var i = 0; i < assetSize; i++) {
      bb.writeByte(assetBytes[i])
    }
  }

  if (!skipSignature && transaction.signature) {
    var signatureBuffer = new Buffer(transaction.signature, 'hex')
    for (var i = 0; i < signatureBuffer.length; i++) {
      bb.writeByte(signatureBuffer[i])
    }
  }

  if (!skipSecondSignature && transaction.signSignature) {
    var signSignatureBuffer = new Buffer(transaction.signSignature, 'hex')
    for (var i = 0; i < signSignatureBuffer.length; i++) {
      bb.writeByte(signSignatureBuffer[i])
    }
  }

  bb.flip()
  var arrayBuffer = new Uint8Array(bb.toArrayBuffer())
  var buffer = []

  for (var i = 0; i < arrayBuffer.length; i++) {
    buffer[i] = arrayBuffer[i]
  }

  return new Buffer(buffer)
}

adamant.transactionSign = function (trs, keypair) {
  var hash = this.getHash(trs)
  return this.sign(hash, keypair).toString('hex')
}
adamant.chatGetBytes = function (trs) {
  var buf

  try {
    buf = Buffer.from([])
    var messageBuf = Buffer.from(trs.asset.chat.message, 'hex')
    buf = Buffer.concat([buf, messageBuf])

    if (trs.asset.chat.own_message) {
      var ownMessageBuf = Buffer.from(trs.asset.chat.own_message, 'hex')
      buf = Buffer.concat([buf, ownMessageBuf])
    }
    var bb = new ByteBuffer(4 + 4, true)
    bb.writeInt(trs.asset.chat.type)
    bb.flip()
    buf = Buffer.concat([buf, Buffer.from(bb.toBuffer())])
  } catch (e) {
    throw e
  }

  return buf
}

adamant.delegateGetBytes = function (trs) {
  if (!trs.asset.delegate.username) {
    return null
  }
  var buf

  try {
    buf = Buffer.from(trs.asset.delegate.username, 'utf8')
  } catch (e) {
    throw e
  }
  return buf
}

adamant.voteGetBytes = function (trs) {
  if (!trs.asset.votes || trs.asset.votes.length === 0) {
    return null
  }
  var buf
  try {
    buf = Buffer.from([])
    for (let i in trs.asset.votes) {
      buf = Buffer.concat([buf, Buffer.from(trs.asset.votes[i], 'utf8')])
    }
  } catch (e) {
    throw e
  }
  return buf
}

adamant.stateGetBytes = function (trs) {
  if (!trs.asset.state.value) {
    return null
  }
  var buf

  try {
    buf = Buffer.from([])
    var stateBuf = Buffer.from(trs.asset.state.value)
    buf = Buffer.concat([buf, stateBuf])

    if (trs.asset.state.key) {
      var keyBuf = Buffer.from(trs.asset.state.key)
      buf = Buffer.concat([buf, keyBuf])
    }

    var bb = new ByteBuffer(4 + 4, true)
    bb.writeInt(trs.asset.state.type)
    bb.flip()

    buf = Buffer.concat([buf, Buffer.from(bb.toBuffer())])
  } catch (e) {
    throw e
  }

  return buf
}

/**
 * Creates a signature based on a hash and a keypair.
 * @implements {sodium}
 * @param {hash} hash
 * @param {keypair} keypair
 * @return {signature} signature
 */
adamant.sign = function (hash, keypair) {
  return sodium.crypto_sign_detached(hash, Buffer.from(keypair.privateKey, 'hex'))
}

/**
 * Verifies a signature based on a hash and a publicKey.
 * @implements {sodium}
 * @param {hash} hash
 * @param {keypair} keypair
 * @return {Boolean} true id verified
 */
adamant.verify = function (hash, signatureBuffer, publicKeyBuffer) {
  return sodium.crypto_sign_verify_detached(signatureBuffer, hash, publicKeyBuffer)
}

module.exports = adamant
