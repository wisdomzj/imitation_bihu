import axios from 'axios'
import users from '@/api/user'
import article from '@/api/article'
import focus from '@/api/focus'
import nav from '@/api/nav'
import link from '@/api/link'
import upload from '@/api/upload'
import setting from '@/api/setting'
import admin from '@/api/admin'
import store from '@/store'
import { MessageBox, Message } from 'element-ui'
import { getToken } from '@/utils/auth'

const instance = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000
})

const http = {}

const service = {
  ...users,
  ...article,
  ...focus,
  ...nav,
  ...link,
  ...upload,
  ...setting,
  ...admin
}

for (const key in service) {
  const api = service[key]
  http[key] = async function(
    { url, ...params },
    isFormData = false,
    config = {}
  ) {
    let newParams = {}
    if (params && isFormData) {
      newParams = new FormData()
      for (const i in params) {
        newParams.append(i, params[i])
      }
    } else {
      newParams = params
    }
    let response = {}
    if (api.method === 'put' || api.method === 'post' || api.method === 'patch') {
      try {
        if (api.isDycRouter) {
          response = await instance[api.method](url, newParams, config)
        } else {
          response = await instance[api.method](api.url, newParams, config)
        }
      } catch (err) {
        response = err
      }
    } else if (api.method === 'delete' || api.method === 'get') {
      config.params = newParams
      try {
        if (api.isDycRouter) {
          response = await instance[api.method](url, config)
        } else {
          response = await instance[api.method](api.url, config)
        }
      } catch (err) {
        response = err
      }
    }
    return response
  }
}

instance.interceptors.request.use(config => {
  const token = getToken('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

instance.interceptors.response.use(response => {
  return response.data
}, error => {
  if (error.response && error.response.status === 401) {
    MessageBox.confirm('您已注销，可以取消停留在此页面上，或者再次登录', '确认登出', {
      confirmButtonText: '重新登录',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      store.dispatch('user/resetToken').then(() => {
        location.reload()
      })
    })
  } else {
    Message({
      message: error.response.data.message || 'Error',
      type: 'error',
      duration: 5 * 1000
    })
  }
  return Promise.reject(error)
})

export default http
