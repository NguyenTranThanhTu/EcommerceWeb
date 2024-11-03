<template>
  <navbar-position></navbar-position>
  <div id="nav">
  </div>
  <router-view 
  :baseURL="baseURL" :categories="categories" :products="products"
  @fetchData="fetchData"></router-view>
</template>

<script>
import NavbarPosition from "./components/NavbarPosition.vue";
import axios from "axios";
export default {
  components: { NavbarPosition },
  data() {
    return {
      //baseURL : ".................",
      products: [],
      categories: [],
    };
  },
  methods: {
    async fetchData() {
      // api call to get all the category
      await axios
        .get(this.baseURL + "category/") //dựa theo tên được đặt bên backend
        .then((res) => {
          this.categories = res.data;
        })
        .catch((err) => console.log("err", err));

      // api call to get the products
      await axios
        .get(this.baseURL + "products/") //dựa theo tên được đặt bên backend
        .then((res) => {
          this.products = res.data;
        })
        .catch((err) => console.log("err", err));
    },
  },

  mounted() {
    this.fetchData();
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
