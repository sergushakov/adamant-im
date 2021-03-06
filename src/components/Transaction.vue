<template>
    <div class="transaction transaction_detail">
      <md-table v-if="transaction">
        <md-table-body>
          <md-table-row >
            <md-table-cell class='label_td'>{{ $t('transaction.amount') }}</md-table-cell>
            <md-table-cell >{{ $formatAmount(transaction.amount, crypto) }} {{ crypto }}</md-table-cell>
          </md-table-row>
          <md-table-row >
            <md-table-cell  class='label_td'>{{ $t('transaction.date') }}</md-table-cell>
            <md-table-cell >{{ $formatDate(transaction.timestamp, crypto === 'ADM') }}</md-table-cell>
          </md-table-row>
          <md-table-row v-if="crypto === 'ADM'">
            <md-table-cell  class='label_td'>{{ $t('transaction.confirmations') }}</md-table-cell>
            <md-table-cell >{{ confirmations }}</md-table-cell>
          </md-table-row>
          <md-table-row >
            <md-table-cell  class='label_td'>{{ $t('transaction.commission') }}</md-table-cell>
            <md-table-cell >{{ $formatAmount(transaction.fee, crypto) }} {{ crypto }}</md-table-cell>
          </md-table-row>
          <md-table-row >
            <md-table-cell  class='label_td'>{{ $t('transaction.txid') }}</md-table-cell>
            <md-table-cell class='data_td'>{{ $route.params.tx_id }}</md-table-cell>
          </md-table-row>
          <md-table-row >
            <md-table-cell  class='label_td'>{{ $t('transaction.sender') }}</md-table-cell>
            <md-table-cell class='data_td'>{{ transaction.senderId.toString() }}</md-table-cell>
          </md-table-row>
          <md-table-row >
            <md-table-cell  class='label_td'>{{ $t('transaction.recipient') }}</md-table-cell>
            <md-table-cell class='data_td'>{{ transaction.recipientId.toString() }} </md-table-cell>
          </md-table-row>
          <md-table-row class='open_in_explorer'>
            <md-table-cell  class='label_td'>
              <div v-on:click="openInExplorer">{{ $t('transaction.explorer') }}</div>
            </md-table-cell>
            <md-table-cell class='data_td'>
              <div v-on:click="openInExplorer">&gt;</div>
            </md-table-cell>
          </md-table-row>
          <md-table-row class='open_chat' v-if="crypto === 'ADM'">
            <md-table-cell class='label_td'>
              <div v-on:click="openChat">
                <md-icon class="md-size-2x">{{ hasMessages ? "chat" : "chat_bubble_outline" }}</md-icon>
                <span>{{ hasMessages ? $t('transaction.continueChat') : $t('transaction.startChat') }}</span>
              </div>
            </md-table-cell>
            <md-table-cell class='data_td'></md-table-cell>
          </md-table-row>
        </md-table-body>
      </md-table>
    </div>
</template>

<script>
  import { Cryptos } from '../lib/constants'
  import getExplorerUrl from '../lib/getExplorerUrl'

  export default {
    name: 'transaction',
    data () {
      return {
      }
    },
    watch: {
      '$route': function (value) {
        if (value.params.crypto === Cryptos.ADM) {
          this.getTransactionInfo(value.params.tx_id)
        }
      }
    },
    methods: {
      openInExplorer: function () {
        window.open(getExplorerUrl(this.crypto, this.$route.params.tx_id), '_blank')
      },
      openChat: function () {
        this.$store.commit('select_chat', this.partner)
        this.$router.push('/chats/' + this.partner + '/')
      }
    },
    computed: {
      crypto () {
        return this.$route.params.crypto
      },
      confirmations: function () {
        if (!this.transaction.confirmations) {
          return '⏱'
        }
        return this.transaction.confirmations
      },
      transaction: function () {
        if (this.$route.params.crypto === Cryptos.ETH) {
          return this.$store.state.eth.transactions[this.$route.params.tx_id]
        }

        if (this.$store.state.transactions[this.$route.params.tx_id]) {
          return this.$store.state.transactions[this.$route.params.tx_id]
        }
        this.getTransactionInfo(this.$route.params.tx_id)
        return false
      },
      partner: function () {
        return this.transaction.senderId !== this.$store.state.address
          ? this.transaction.senderId : this.transaction.recipientId
      },
      hasMessages: function () {
        const chat = this.$store.state.chats[this.partner]
        return chat && chat.messages && Object.keys(chat.messages).length > 0
      }
    }
  }
</script>
<style>
  .label_td {
    text-align: left;
  }
  .transaction_detail {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .data_td {
    word-break: break-all;
  }
  @media (max-width: 380px) {
    .label_td {
      text-align:left;
      max-width:100px;
    }

  }

  .open_in_explorer {
    cursor: pointer;
  }

  .md-table .md-table-row.open_chat .md-table-cell.label_td .md-table-cell-container {
    display: inherit;
    cursor: pointer;
  }

  .md-table .md-table-row.open_chat .md-table-cell.label_td .md-icon {
    margin-left: -2px;
    margin-right: 8px;
  }
</style>

