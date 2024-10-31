<template>
    <div class="container">
        <div class="row">
            <div class="col-12 text-center">
                <h3 class="pt-3">Our Categories</h3>
                <router-link :to="{name: 'AddCategory'}">
                    <button class="btn" style="float:center">AddCategory</button>
                </router-link>
                    
            </div>
        </div>
        <div class="row">
            <div v-for="viewcategory of categories" :key="viewcategory.id" 
            class="col-xl-4 col-md-6 col-12 pt-3 d-flex">
                <CategoryBox :viewcategory="viewcategory"></CategoryBox>
            </div>

        </div>
    </div>
</template>
<script>

const axios = require("axios");
import CategoryBox from '@/components/Category/CategoryBox.vue';
export default {
    name: "ViewCategory",
    components: {CategoryBox},
    data() {
        return {
            // baseURL = "....................." --- chèn link api -----
            categories: []
        };
    },
    methods: {
        async getCategories() {
            await axios.get('${this.baseURL}/viewcategory/')
            .then(res => this.categories= res.data)
            .catch(err => console.log(err))
        }
    },
    mounted() {
        this.getCategories();
    }
}
</script>
<style scoped>
</style>
