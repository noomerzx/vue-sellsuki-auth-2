/* global localStorage */
const MyComponent = require('./PrepareLogin.vue')

exports.install = function (Vue, options) {
  // default plugin setting
  let scope = {
    portal: '',
    router: {},
    extend: true,
    authData: {
      facebook: '',
      facebookToken: '',
      user: '',
      bearer: '',
      sellsukiToken: '',
      storeId: '',
      status: false
    }
  }

  // initial plugin setting
  if (options) {
    scope.portal = options.portal ? options.portal : ''
    scope.router = options.router ? options.router : {}
    scope.extend = options.extend ? options.extend : true
    if (options.extend) {
      scope.router.addRoutes([{
        path: '/prepare_login/:storeId',
        name: 'prepare-login',
        component: MyComponent,
        props: true
      }])
    }
  }

  // add prepare loginpage component to vue instance
  Vue.component(MyComponent.name, MyComponent)

  // check auth everytime when route change
  scope.router.beforeEach((to, from, next) => {
    if (!((document.cookie.search('sellsuki.fblogintoken') !== -1 && document.cookie.search('sellsuki.facebook') !== -1) ||
      document.cookie.search('sellsuki.user') !== -1 && document.cookie.search('sellsuki.store_' + window.localStorage.getItem('store.id')) !== -1)) {
      window.location.href = scope.portal
    } else {
      if (!checkStorage) {
        setupStorage(window.localStorage.getItem('store.id'))
      }
      next()
    }
  })

  Vue.prototype.$sellsuki_auth = {}

  // try to set localstorage from cookie
  Vue.prototype.$sellsuki_auth.initLocalStorage = (storeId) => {
    if (!setupStorage(storeId)) {
      window.location.href = scope.portal
    } else {
      scope.router.push({ path: '/' })
    }
  }

  // get auth data from instance
  Vue.prototype.$sellsuki_auth.checkAuthStatus = () => {
    return scope.authData.status
  }

  // get auth data from instance
  Vue.prototype.$sellsuki_auth.getAuthData = () => {
    return scope.authData
  }

  // get auth facebook data from instance
  Vue.prototype.$sellsuki_auth.getFacebookData = () => {
    return {
      facebook: scope.authData.facebook,
      facebookToken: scope.authData.facebookToken
    }
  }

  // get sellsuki data from instance
  Vue.prototype.$sellsuki_auth.getSellsukiData = () => {
    return {
      storeId: scope.authData.storeId,
      user: scope.authData.user,
      sellsukiToken: scope.authData.sellsukiToken,
      bearer: scope.authData.bearer
    }
  }

  // get cookie fn
  function getCookie (cname) {
    let name = cname + '='
    let ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length)
      }
    }
    return ''
  }

  // check data from localstorage is exist
  function checkStorage () {
    let result = true
    if (localStorage.getItem('sellsuki.facebook') === null ||
        localStorage.getItem('sellsuki.fblogintoken') === null ||
        localStorage.getItem('sellsuki.user') === null ||
        localStorage.getItem('sellsuki.bearer') === null ||
        localStorage.getItem('store.id') === null ||
        localStorage.getItem('ssk_token') === null) {
      result = false
    }
    return result
  }

  // set localstorage from cookie if pass then set it to instance object
  function setupStorage (storeId) {
    console.log('local storate init - ', storeId)
    let result = false
    let facebook = getCookie('sellsuki.facebook')
    let fblogintoken = getCookie('sellsuki.fblogintoken')
    let user = getCookie('sellsuki.user')
    let storeIdData = getCookie('sellsuki.store_' + storeId)
    if (user && storeIdData) {
      localStorage.setItem('sellsuki.facebook', unescape(facebook))
      localStorage.setItem('sellsuki.fblogintoken', unescape(fblogintoken))
      localStorage.setItem('sellsuki.user', unescape(user))
      localStorage.setItem('sellsuki.bearer', unescape(storeIdData))
      localStorage.setItem('store.id', storeId)
      try {
        let temp = JSON.parse(unescape(storeIdData))
        let stringbear = temp.auth.token_type + ' ' + temp.auth.access_token
        localStorage.setItem('ssk_token', stringbear)
        result = true
      } catch (e) { console.log(e) }
    }
    if (result) {
      setupInstanceData()
    }
    return result
  }

  // setup data from local storage to instance
  function setupInstanceData () {
    scope.authData.facebook = localStorage.getItem('sellsuki.facebook')
    scope.authData.facebookToken = localStorage.getItem('sellsuki.fblogintoken')
    scope.authData.user = localStorage.getItem('sellsuki.user')
    scope.authData.bearer = localStorage.getItem('sellsuki.bearer')
    scope.authData.sellsukiToken = localStorage.getItem('store.id')
    scope.authData.storeId = localStorage.getItem('ssk_token')
    scope.authData.status = true
  }
}
