<template>
  <div class="settings">
      <div style="max-width:95%; margin:auto;">
      <md-card class='settings-card' style="box-shadow:none">
          <md-card-area md-inset>
              <md-card-header>
                  <h2 class="md-title" style="text-align:left; font-size:20px">{{ $t('options.general_title') }}</h2>
              </md-card-header>
          </md-card-area>

          <md-card-content>
              <md-table>
                  <md-table-body>
                      <md-table-row>
                          <md-table-cell style="text-align: left;">{{ $t('options.language_label') }}</md-table-cell>
                          <md-table-cell ><md-input-container class="language_selector">
                              <md-select name="language" id="language" v-model="language">
                                  <md-option  v-for="(language, code) in languageList" :value="code" :key="code">{{ language.title }}</md-option>
                              </md-select>
                          </md-input-container>
                          </md-table-cell>
                      </md-table-row>
                  </md-table-body>
              </md-table>
          </md-card-content>
      </md-card>

      <md-card class='settings-card' style="box-shadow:none">
          <md-card-area md-inset>
              <md-card-header>
                  <h2 class="md-title" style="text-align:left; font-size:20px">{{ $t('options.security_title') }}</h2>
              </md-card-header>
          </md-card-area>

          <md-card-content>
              <md-table>
                  <md-table-body>
                      <md-table-row>
                          <md-table-cell class="hide_on_mobile"></md-table-cell>
                          <md-table-cell colspan="2"  style="text-align:left;"><md-checkbox  v-model="storeInLS" :title="$t('options.exit_on_close_tooltip')">{{ $t('options.exit_on_close') }}</md-checkbox></md-table-cell>
                      </md-table-row>
                  </md-table-body>
              </md-table>
          </md-card-content>

      </md-card>
          <md-card class='settings-card' style="box-shadow:none">
              <md-card-area md-inset>
                  <md-card-header>
                      <h2 class="md-title" style="text-align:left; font-size:20px">{{ $t('options.chats_title') }}</h2>
                  </md-card-header>
              </md-card-area>

              <md-card-content>
                  <md-table>
                      <md-table-body>
                          <md-table-row>
                              <md-table-cell class="hide_on_mobile"></md-table-cell>
                              <md-table-cell colspan="2"  style="text-align:left;"><md-checkbox  v-model="sendOnEnter" :title="$t('options.send_on_enter_tooltip')">{{ $t('options.send_on_enter') }}</md-checkbox></md-table-cell>
                          </md-table-row>
                      </md-table-body>
                  </md-table>
              </md-card-content>

          </md-card>

      <md-card class='settings-card' style="box-shadow:none">
          <md-card-area md-inset>
              <md-card-header>
                  <h2 class="md-title" style="text-align:left; font-size:20px">{{ $t('options.notification_title') }}</h2>
              </md-card-header>
          </md-card-area>

          <md-card-content>
              <md-table>
                  <md-table-body>
                      <md-table-row>
                          <md-table-cell class="hide_on_mobile"></md-table-cell>
                          <md-table-cell style="text-align:left;" colspan="2"><md-checkbox  v-model="notifySound" :title="$t('options.enable_sound_tooltip')">{{ $t('options.enable_sound') }}</md-checkbox></md-table-cell>
                      </md-table-row>
                      <md-table-row>
                          <md-table-cell class="hide_on_mobile"></md-table-cell>
                          <md-table-cell style="text-align:left;" colspan="2"><md-checkbox  v-model="notifyBar" :title="$t('options.enable_bar_tooltip')">{{ $t('options.enable_bar') }}</md-checkbox></md-table-cell>
                      </md-table-row>
                      <md-table-row style="display:none">
                          <md-table-cell class="hide_on_mobile"></md-table-cell>
                          <md-table-cell style="text-align:left;" colspan="2"><md-checkbox  v-model="notifyDesktop" disabled :title="$t('options.enable_desktop_tooltip')">{{ $t('options.enable_desktop') }}</md-checkbox></md-table-cell>
                      </md-table-row>
                  </md-table-body>
              </md-table>
          </md-card-content>

      </md-card>

      <md-card class='settings-card' style="box-shadow:none">
        <md-card-area md-inset>
          <md-card-header>
            <h2 class="md-title" style="text-align:left; font-size:20px">{{ $t('options.delegates_title') }}</h2>
          </md-card-header>
          </md-card-area>
          <md-card-content>
            <span v-if="delegate">
              {{ $t('already_delegate_text') }} {{ delegate.username }}
            </span> 
            <md-input-container v-else>
              <md-input style="width:50%" v-model="delegateName" v-bind:placeholder="$t('options.delegate_name_input')"></md-input>
              <md-button style="width:50%" v-on:click="delegateRequest" v-bind:disabled="!delegateOpen" >
              {{ $t('options.delegate_register_button') }} - 3000 ADM</md-button>
            </md-input-container>
            <md-button style="width:100%" v-on:click="$router.push('/votes/')">{{ $t('options.vote_for_delegates_button') }}</md-button>
          </md-card-content>
      </md-card>

    <div class="version" style=" margin-bottom: -1rem; right:1rem;">{{ $t('options.version') }} {{ this.$root.$options.version }}</div>
      </div>

  </div>
</template>

<script>
export default {
  name: 'settings',
  methods: {
    delegateRequest () {
      this.registerDelegate('new-delegate-name')
      return false
    }
  },
  mounted: function () {
    this.getDelegates()
  },
  computed: {
    languageList: function () {
      var messages = require('../i18n').default
      return messages
    },
    delegate () {
      return Object.values(this.$store.state.delegates).find(x => x.address === this.$store.state.adress)
    }
  },
  watch: {
    'sendOnEnter' (to, from) {
      this.$store.commit('change_send_on_enter', to)
    },
    'storeInLS' (to, from) {
      this.$store.commit('change_storage_method', !to)
    },
    'notifySound' (to, from) {
      this.$store.commit('change_notify_sound', to)
    },
    'notifyBar' (to, from) {
      this.$store.commit('change_notify_bar', to)
    },
    'notifyDesktop' (to, from) {
      this.$store.commit('change_notify_desktop', to)
    },
    'language' (to, from) {
      this.$i18n.locale = to
      this.$store.commit('change_lang', to)
      document.title = this.$i18n.t('app_title')
    }
  },
  data () {
    return {
      storeInLS: !this.$store.state.storeInLocalStorage,
      notifySound: this.$store.state.notifySound,
      sendOnEnter: this.$store.state.sendOnEnter,
      notifyBar: this.$store.state.notifyBar,
      notifyDesktop: this.$store.state.notifyDesktop,
      language: this.$i18n.locale,
      delegateOpen: this.$store.state.balance >= 3000
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
    .settings-card .md-table .md-table-cell .md-table-cell-container {
        padding: 0;
    }
    .md-card>.md-card-area:after {
        background-color: rgba(0, 0, 0, .12);
    }
    .settings .md-table .md-table-cell {
        font-size: 16px;
    }
    .settings .md-table .md-select-value, .settings .md-table .md-option {
        font-size: 16px;
    }
  .settings .md-checkbox .md-checkbox-container:after {
      border: 2px solid gray;
      border-top: 0;
      border-left: 0;
  }
  .settings {
    position:relative;
    width:100%;
  }
  .settings .md-card .md-card-header:last-child {
      margin-bottom: 0px;
  }
    @media (max-width: 480px) {
        .hide_on_mobile {
            display:none;
        }
        #notification {
            max-width:150px;
        }
        .settings {
            padding-left: 1rem;
            padding-right: 1rem;
        }
        .settings .version {
            right: 1rem;
        }
    }
</style>
