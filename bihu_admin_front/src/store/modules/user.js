import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import http from '@/utils/http'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  roles: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      http.login({ name: username.trim(), password: password }).then(response => {
        const { result, err_code, msg } = response.data
        commit('SET_TOKEN', result.token)
        setToken(result.token)
        resolve({ err_code, msg })
      }).catch(error => {
        reject(error)
      })
    })
  },

  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      http.getInfo({}).then(response => {
        const { result, err_code, msg } = response.data

        if (!result) {
          reject('Verification failed, please Login again.')
        }

        const { role, name, avatar } = result
        const roles = !role ? ['editor'] : ['admin']
        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve({ roles, err_code, msg })
      }).catch(error => {
        reject(error)
      })
    })
  },

  logout({ commit, state }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resetRouter()
      resolve()
    })
  },

  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
