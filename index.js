/* global localStorage */
const MyComponent = require('./PrepareLogin.vue')

exports.install = function (Vue, options) {
  // default plugin setting
  let scope = {
    portal: '',
    router: {},
    extend: true,
    store: false,
    authData: {
      facebook: '',
      facebookToken: '',
      user: '',
      userBearer: '',
      storeBearer: '',
      sellsukiToken: '',
      storeId: '',
      status: false
    }
  }

  // initial plugin setting
  if (options) {
    scope.portal = options.portal ? options.portal : ''
    scope.router = options.router ? options.router : {}
    scope.store = options.store ? option.store : false
    scope.extend = options.extend ? options.extend : true
    if (scope.extend) {
      scope.router.addRoutes([{
        path: '/prepare_login/:storeId',
        name: 'prepare-login',
        component: MyComponent,
        props: true
      },
      { path: '*', redirect: { name: 'prepare-login' } }])
    }
  }

  // add prepare loginpage component to vue instance
  Vue.component(MyComponent.name, MyComponent)

  // check auth everytime when route change
  scope.router.beforeEach((to, from, next) => {
    if (to.name !== 'prepare-login') {
      // if don't have cookie go redirect.
      if (!checkCookie()) {
        window.location.href = scope.portal
      } else if (!checkStorage()) {
        // if have cookie but dont have local storage set it.
        setupStorage()
      } else if (scope.authData.status === false) {
        // if have cookie and local storage but dont set to instance set it.
        setupInstanceData ()
      }
    }
    next()
  })

  Vue.prototype.$sellsuki_auth = {}

  // try to set localstorage from cookie
  Vue.prototype.$sellsuki_auth.initLocalStorage = (storeId) => {
    document.cookie = 'sellsuki.storeId=' + storeId
    if (!setupStorage()) {
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
      storeBearer: scope.authData.storeBearer,
      userBearer: scope.authData.userBearer
    }
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

  function checkCookie () {
    let result = true
    if (getCookie('sellsuki.facebook') === '' ||
        getCookie('sellsuki.fblogintoken') === '' ||
        getCookie('sellsuki.user') === '' ||
        getCookie('sellsuki.store_' + getCookie('sellsuki.storeId')) === '' ||
        (scope.store === true && getCookie('sellsuki.storeId') === '')) {
      result = false
    }
    return result
  }

  // set localstorage from cookie if pass then set it to instance object
  function setupStorage () {
    let result = false
    let facebook = getCookie('sellsuki.facebook')
    let fblogintoken = getCookie('sellsuki.fblogintoken')
    let user = getCookie('sellsuki.user')
    let storeId = getCookie('sellsuki.storeId')
    let storeIdData = getCookie('sellsuki.store_' + storeId)
    if (user && storeIdData) {
      localStorage.setItem('sellsuki.facebook', unescape(facebook))
      localStorage.setItem('sellsuki.fblogintoken', unescape(fblogintoken))
      localStorage.setItem('sellsuki.user', unescape(user))
      localStorage.setItem('sellsuki.bearer', unescape(storeIdData))
      localStorage.setItem('store.id', storeId)
      try {
        let storeData = JSON.parse(unescape(storeIdData))
        let storeBearer = storeData.auth.token_type + ' ' + storeData.auth.access_token
        let userData = JSON.parse(unescape(user))
        let userBearer = userData.auth.token_type + ' ' + userData.auth.access_token
        localStorage.setItem('sellsuki.store.bearer', storeBearer)
        localStorage.setItem('sellsuki.user.bearer', userBearer)
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
    scope.authData.facebook = JSON.parse(localStorage.getItem('sellsuki.facebook'))
    scope.authData.facebookToken = localStorage.getItem('sellsuki.fblogintoken')
    scope.authData.user = JSON.parse(localStorage.getItem('sellsuki.user'))
    scope.authData.storeBearer = localStorage.getItem('sellsuki.store.bearer')
    scope.authData.userBearer = localStorage.getItem('sellsuki.user.bearer')
    scope.authData.sellsukiToken = localStorage.getItem('store.id')
    scope.authData.storeId = localStorage.getItem('store.id')
    scope.authData.status = true
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
}
