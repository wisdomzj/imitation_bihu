const ADMIN_API = {
  login: {
    method: 'post',
    url: '/admin/login'
  },
  getInfo: {
    method: 'get',
    url: '/admin/info'
  },
  changepwd: {
    method: 'post',
    url: '/admin/changepwd'
  }
}

export default ADMIN_API
