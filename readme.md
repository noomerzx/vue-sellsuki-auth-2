Sellsuki Auth v2
=============

Vue plugin for sellsuki authentication to connect between sellsuki microservices and sellsuki login portal.

## Features
* Option to extend prepare login page (Component & Route)
* Setup data from cookie to local storage
* Auth Middleware to check your auth status on every route change (check cookie exist)
* Provide function to access to the cookie data

### Update
* Prepare Login Page and route for Sellsuki Authenticate (2.0)
* Add new option to check only store or bother user and store token (2.1)
* Remove store option and add public option that accept array of public route name to by pass auth middleware (2.2)
* Optional store id params for prepare login instead of accept "0" for no store (2.3.1)
* Option to config auth middleware (auto inject beforeEach hook and check auth data) default = true (2.5.0)
* Function to check auth data manually (checkAuth), check cookie, localstorage, instance then redirect (2.5.1)
* Component error on vue 2.5.* so fixed it to support both < 2.5 > versions (2.5.2)
* Fix authMiddleware and Extend option's flag check (2.5.5)

## Requirement
* vue 2.x +
* vue-router 2.2 +

## Initiate

Initiate plugin by ```Vue.use``` and add some options then the plugin will takecare everything for you.
If cookie exist your app will work as it be but if cookie gone the plugin will redirect to the login portal.

...

Note that we catch all unavailable route and redirect to prepare login, So if you have redirect route like 

```javascript
{ path: '*', redirect: { path: '/' } }
```

You need to remove it from your route to protect the duplicate error.


```javascript
import Vue from 'vue'
import VueRouter from 'vue-router'
import VueSellsukiAuth from 'vue-sellsuki-auth'

...

var router = new VueRouter({
  routes: [
    { path: '/hello', component: Hello }
  ]
})

// Set plugin option, If you have public route to by pass authentication add the name to public option as array
let options = {
  portal: 'loginPortalUrl',
  router: router,
  public: ['news', 'register']
}

// Normally the plugin will inject prepare login page and route to your instance.
// So if you have your own preapre login component and don't need any help then set the extend to false.
let options = {
  portal: 'loginPortalUrl',
  router: router,
  extend: false
}

// Normally the plugin will inject beforeEach hook to validate auth data.
// So if you need to use beforeEach hook bby yourself you need to disabled authMiddleware (default = true).
// Then we provide checkAuth method to check data manually.
let options = {
  portal: 'loginPortalUrl',
  router: router,
  authMiddleware: false
}

// Inject plugin to vue instance
Vue.use(VueSellsukiAuth, options)
```

## Available Methods
##### function [return type] 

### checkAuth
Check auth data manually, If it's not valid then redirect to portal

```javascript
this.$sellsuki_auth.checkAuth()
```

### getAuthStatus [bool]
Check status of the authentication (true if all data exist)

```javascript
let status = this.$sellsuki_auth.getAuthStatus()
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

