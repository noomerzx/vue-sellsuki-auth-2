Sellsuki Auth 2.0
=============

Vue plugin for sellsuki authentication to connect between sellsuki microservices and sellsuki login portal.

## Features
* Option to extend prepare login page (Component & Route)
* Setup data from cookie to local storage
* AuthMiddleware to check your auth status on every route change (check cookie exist)
* Provide function to access to the cookie data

## Requirement
* vue 2.x +
* vue-router 2.2 +

## Initiate

Initiate plugin by ```Vue.use``` and add some options then the plugin will takecare everything for you.
If cookie exist your app will work as it be but if cookie gone the plugin will redirect to the login portal.

```javascript
import Vue from 'vue'
import VueRouter from 'vue-router'
import VueSellsukiAuth from 'vue-sellsuki-auth'

...

var router = new VueRouter({
  routes: [
    { path: '/hello', component: Hello },
    { path: '*', redirect: '/hello' }
  ]
})

// Set plugin option
let options = {
  portal: 'loginPortalUrl',
  router: router
}

// Normally the plugin will inject prepare login page and route to your instance.
// So if you have your own preapre login component and don't need any help then set the extend to false.
let options = {
  portal: 'loginPortalUrl',
  router: router,
  extend: false
}

// Inject plugin to vue instance
Vue.use(VueSellsukiAuth, options)
```

## Available Methods
##### function [return type] 

### checkAuthStatus [bool]
Check status of the authentication (true if all data exist)

```javascript
let status = this.$sellsuki_auth.checkAuthStatus()
```

### getAuthData [object]
Get all data from cookie as JSON

```javascript
let authData = this.$sellsuki_auth.getAuthData()

// Returned Object
authData: {
  facebook: {},
  facebookToken: '',
  user: {},
  bearer: {},
  sellsukiToken: '',
  storeId: '',
  status: false
}
```

### getFacebookData [object]
Get auth data from cookie especially facebook data

```javascript
let facebookData = this.$sellsuki_auth.getFacebookData()

// Returned Object
facebookData: {
  facebook: {},
  facebookToken: ''
}
```

### getSellsukiData [object]
Get auth data from cookie especially sellsuki data

```javascript
let sellsukiData = this.$sellsuki_auth.getSellsukiData()

// Returned Object
sellsukiData: {
  storeId: '',
  user: {},
  sellsukiToken: '',
  bearer: {}
}
```
