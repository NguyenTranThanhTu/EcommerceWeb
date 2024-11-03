import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AddCategory from '../views/Category/AddCategory'
import ViewCategory from '../views/Category/ViewCategory'
import AdminPage from '@/views/AdminPage.vue'
import ProductPage from '@/views/Product/ProductPage.vue'
import AddProduct from '@/views/Product/AddProduct.vue'
import EditCategory from '../views/Category/EditCategory.vue' 

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/admin/category/add',
    name: 'AddCategory',
    component: AddCategory
  },
    {
    path: '/admin/category',
    name: 'ViewCategory',
    component: ViewCategory
  },
  // category edit
  {
    path: '/admin/category/:id',
    name: 'EditCategory',
    component: EditCategory
  },
  //admin homepage
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
  },
  {
    path: '/admin/product',
    name: 'AdminProduct',
    component: ProductPage,
  },
  // add product
  {
    path: '/admin/product/new',
    name: 'AddProduct',
    component: AddProduct,
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
