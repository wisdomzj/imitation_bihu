const ARTICLE_API = {
  articleFindAll: {
    method: 'get',
    url: '/article/findAll'
  },
  addArticle: {
    method: 'post',
    url: '/article/add'
  },
  removeArticle: {
    method: 'post',
    url: '/article/remove'
  },
  showArticle: {
    method: 'get',
    url: '/article/findById'
  },
  editArticle: {
    method: 'post',
    url: '/article/edit'
  },
  showallArtcomm: {
    method: 'get',
    url: '/article/findallArtcomm'
  },
  removComment: {
    method: 'get',
    url: '/article/removComment'
  },
  searchArticle: {
    method: 'get',
    url: '/article/searchArticle'
  }
}

export default ARTICLE_API

