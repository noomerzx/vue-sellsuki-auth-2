/* global localStorage */
const MyComponent = require('./PrepareLogin.vue')

exports.install = function (Vue, options) {
  // default plugin setting
  let scope = {
    portal: '',
    router: {},
    extend: true,
    public: ['prepare-login'],
    authData: {
      facebook: {},
      facebookToken: '',
      user: {},
      userBearer: '',
      userToken: '',
      store: {},
      storeBearer: '',
      storeToken: '',
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
    scope.public = options.public ? scope.public.concat(options.public) : scope.public
    if (scope.extend) {
      scope.router.addRoutes([{
        path: '/prepare_login/:storeId?',
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
    // console.log('Middleware Process')
    if (!scope.public.find(route => route === to.name)) {
      // console.log('Middleware >> Catched Route')
      // if don't have cookie go redirect.
      if (!checkCookie()) {
        // console.log('Middleware >> No Cookie')
        window.location.href = scope.portal
      } else if (!checkStorage() && !setupStorage()) {
        // console.log('Middleware >> No Local Storage, Trying to set.')
        // if have cookie but dont have local storage set it.
        window.location.href = scope.portal
      } else if (scope.authData.status === false) {
        // console.log('Middleware >> Set instance data.')
        // if have cookie and local storage but dont set to instance set it.
        setupInstanceData()
      }
    }
    next()
  })

  Vue.prototype.$sellsuki_auth = {}

  Vue.prototype.$sellsuki_auth.goToPortal = () => {
    window.location.href = scope.portal
  }

  // try to set localstorage from cookie
  Vue.prototype.$sellsuki_auth.initLocalStorage = (storeId) => {
    if (window.location.origin === 'https://dm.sellsuki.com' || window.location.origin === 'https://staging-dm.sellsuki.com') {
      document.cookie = 'sellsuki.storeId=' + storeId + ';domain=sellsuki.com'
    } else {
      document.cookie = 'sellsuki.storeId=' + storeId
    }
    
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
        localStorage.getItem('sellsuki.user.token') === null ||
        localStorage.getItem('sellsuki.user.bearer') === null ||
        localStorage.getItem('sellsuki.store') === null ||
        localStorage.getItem('sellsuki.store.token') === null ||
        localStorage.getItem('sellsuki.store.bearer') === null ||
        localStorage.getItem('sellsuki.store.id') === null) {
      result = false
    }
    return result
  }

  function checkCookie () {
    let result = true
    if (getCookie('sellsuki.user') === '' ||
        (parseInt(getCookie('sellsuki.storeId')) !== 0 &&
        (getCookie('sellsuki.store_' + getCookie('sellsuki.storeId')) === ''))) {
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
    let storeData = getCookie('sellsuki.store_' + storeId)

    if (user) {
      user = decodeURIComponent(user)
    }

    try {
      // check only user
      if (user && parseInt(storeId) === 0) {
        let userData = JSON.parse(unescape(user))
        let userBearer = userData.auth.token_type + ' ' + userData.auth.access_token
        localStorage.setItem('sellsuki.user', unescape(user))
        localStorage.setItem('sellsuki.user.token', userData.auth.access_token)
        localStorage.setItem('sellsuki.user.bearer', userBearer)
        if (facebook && fblogintoken) {
          localStorage.setItem('sellsuki.facebook', unescape(facebook))
          localStorage.setItem('sellsuki.fblogintoken', unescape(fblogintoken))
        }
        result = true
      } else if (user && storeId && storeData) {
        // check store and user
        let userData = JSON.parse(unescape(user))
        let userBearer = userData.auth.token_type + ' ' + userData.auth.access_token
        let store = JSON.parse(unescape(storeData))
        let storeBearer = store.auth.token_type + ' ' + store.auth.access_token
        localStorage.setItem('sellsuki.user', unescape(user))
        localStorage.setItem('sellsuki.user.token', userData.auth.access_token)
        localStorage.setItem('sellsuki.user.bearer', userBearer)
        localStorage.setItem('sellsuki.store', unescape(storeData))  
        localStorage.setItem('sellsuki.store.id', storeId)  
        localStorage.setItem('sellsuki.store.token', store.auth.access_token)
        localStorage.setItem('sellsuki.store.bearer', storeBearer)  
        if (facebook && fblogintoken) {
          localStorage.setItem('sellsuki.facebook', unescape(facebook))
          localStorage.setItem('sellsuki.fblogintoken', unescape(fblogintoken))
        }
        result = true
      }
      if (result) {
        setupInstanceData()
      }
    } catch (e) { console.log(e) }
    return result
  }

  // setup data from local storage to instance
  function setupInstanceData () {
    let facebook = localStorage.getItem('sellsuki.facebook')
    let user = localStorage.getItem('sellsuki.user')
    let store = localStorage.getItem('sellsuki.store')
    let storeId = parseInt(localStorage.getItem('sellsuki.store.id'))

    if (facebook) {
      scope.authData.facebook = JSON.parse(facebook)
      scope.authData.facebookToken = localStorage.getItem('sellsuki.fblogintoken')
    }
    if (storeId !== 0 && store && user) {
      scope.authData.user = JSON.parse(user)
      scope.authData.userToken = localStorage.getItem('sellsuki.user.token')
      scope.authData.userBearer = localStorage.getItem('sellsuki.user.bearer')
      scope.authData.store = JSON.parse(store)
      scope.authData.storeId = localStorage.getItem('sellsuki.store.id')
      scope.authData.storeToken = localStorage.getItem('sellsuki.store.token')
      scope.authData.storeBearer = localStorage.getItem('sellsuki.store.bearer')
      scope.authData.status = true
    } else if (!storeId && user) {
      scope.authData.user = JSON.parse(user)
      scope.authData.userToken = localStorage.getItem('sellsuki.user.token')
      scope.authData.userBearer = localStorage.getItem('sellsuki.user.bearer')
      scope.authData.status = true
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
}
