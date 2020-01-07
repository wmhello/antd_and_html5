import { asyncRouterMap, constantRouterMap } from '@/config/router.config'
import router from '@/router/index'
import { template } from 'handlebars'

/**
 * 过滤账户是否拥有某一个权限，并将菜单从加载列表移除
 *
 * @param permission
 * @param route
 * @returns {boolean}
 */
// function hasPermission (permission, route) {
//   if (route.meta && route.meta.permission) {
//     let flag = false
//     for (let i = 0, len = permission.length; i < len; i++) {
//       flag = route.meta.permission.includes(permission[i])
//       if (flag) {
//         return true
//       }
//     }
//     return false
//   }
//   return true
// }

/**
 * 单账户多角色时，使用该方法可过滤角色不存在的菜单
 *
 * @param roles
 * @param route
 * @returns {*}
 */
// eslint-disable-next-line
function hasRole(roles, route) {
  if (route.meta && route.meta.roles) {
    return route.meta.roles.includes(roles.id)
  } else {
    return true
  }
}

// function filterAsyncRouter (routerMap, roles) {
//   let res = []
//     routerMap.forEach( route => {
//       const tmp = { ...route }
//       if (hasPermission(roles, tmp)) {
//         if (tmp.children) {
//            tmp.children = filterAsyncRouter(tmp.children, roles)
//         }
//         res.push(tmp)
//       }
//     })
//     return res
//   // const accessedRouters = routerMap.filter(route => {
//   //   if (hasPermission(roles.permissionList, route)) {
//   //     if (route.children && route.children.length) {
//   //       route.children = filterAsyncRouter(route.children, roles)
//   //     }
//   //     return true
//   //   }
//   //   return false
//   // })
//   // return accessedRouters
// }

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.permission) {
    return roles.some(role => route.meta.permission.includes(role))
  } else {
    return false
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}


const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateRoutes ({ commit }, data) {
      return new Promise(resolve => {
        let { roles, permissions} = data
        
        let accessedRouters
        if (roles.includes('admin')){
          accessedRouters = asyncRouterMap || []
        } else {
          // roles = roles.permissions
          accessedRouters = filterAsyncRouter(asyncRouterMap, permissions)
        }
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    }
  }
}

export default permission
